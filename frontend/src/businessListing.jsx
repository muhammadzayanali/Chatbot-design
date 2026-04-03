import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const PIN = '📍'
const PHONE_PREFIX = '📞'

function extractMapsUrlFromLine(line) {
  const m = line.match(/🗺️\s*Google Maps:\s*(.+)$/i)
  if (!m) return ''
  let url = m[1].trim()
  const md = url.match(/^\[([^\]]*)\]\(([^)]+)\)\s*$/)
  if (md) url = md[2].trim()
  // Plain URL may be followed by other text on same line — take first URL token
  const urlOnly = url.match(/^(https?:\/\/\S+)/i)
  return urlOnly ? urlOnly[1] : url.split(/\s/)[0] || url
}

/** GFM bullets: -, *, • (backend uses indented "-"; LLM may use "*"). */
const LISTA_BULLET = '[-*•]'

/** CSV / Lista-style blocks: numbered row + Category/Location (no 📍 / Google Maps). */
function looksLikeListaBlock(text) {
  if (text.includes(PIN) && text.includes('🗺️')) return false
  const hasNumbered = /^\s*\d+\.\s.+/m.test(text)
  const hasField = new RegExp(`^\\s*${LISTA_BULLET}\\s*Category:`, 'im').test(text) ||
    new RegExp(`^\\s*${LISTA_BULLET}\\s*Location:`, 'im').test(text)
  return hasNumbered && hasField
}

function firstUrlFromText(s) {
  if (!s) return ''
  const md = s.match(/\[([^\]]*)\]\((https?:[^)]+)\)/i)
  if (md) return md[2].trim()
  const m = s.match(/https?:\/\/[^\s)\]<]+/i)
  return m ? m[0].replace(/[,;.]+$/, '') : ''
}

function stripMailto(s) {
  return s.replace(/^mailto:/i, '').trim()
}

function stripMarkdownBold(s) {
  return s.replace(/^\*+\s*/, '').replace(/\s*\*+$/, '').trim()
}

function isListaListingComplete(blob) {
  if (!/^\s*\d+\.\s/m.test(blob)) return false
  const cat = new RegExp(`^\\s*${LISTA_BULLET}\\s*Category:`, 'im').test(blob)
  const loc = new RegExp(`^\\s*${LISTA_BULLET}\\s*Location:`, 'im').test(blob)
  return cat && loc
}

/**
 * Lista / internal CSV style, e.g.
 * 1. Bbq.Brazilian
 * - Category: …
 * - Location: Los Angeles, California
 * - Phone: [ListaBusiness1]
 * Social: https://instagram.com/…
 * Phone: 3105900305
 * Email: …
 * - WhatsApp: https://wa.me/…
 */
function listaPlaceholderPhone(v) {
  if (!v) return true
  const t = v.trim()
  if (t === '—' || t === '-' || /^\[ListaBusiness/i.test(t)) return true
  return false
}

function stripUrlsFromPhoneDisplay(s) {
  if (!s || typeof s !== 'string') return s
  const t = s
    .replace(/\s*https?:\/\/[^\s]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  return t
}

function normalizeListaPhoneDisplay(phoneRaw) {
  if (!phoneRaw || listaPlaceholderPhone(phoneRaw)) return '—'
  return phoneRaw.trim()
}

const reListaPhoneBul = new RegExp(`^${LISTA_BULLET}\\s*Phone:\\s*(.+)$`, 'i')
const reListaWaBul = new RegExp(`^${LISTA_BULLET}\\s*WhatsApp:\\s*(.+)$`, 'i')

/** Parse Social / Phone / Email / Website / WhatsApp lines (Lista CSV tail or contact_info). */
function parseListaContactFieldsFromLines(lines) {
  let phone = ''
  let socialUrl = ''
  let email = ''
  let whatsappUrl = ''
  let websiteUrl = ''

  for (const L of lines) {
    const line = L.replace(/\*\*/g, '')
    let m
    if ((m = line.match(reListaPhoneBul))) {
      const v = m[1].trim()
      if (!listaPlaceholderPhone(v) && /[\d]/.test(v.replace(/\D/g, '')) && v.replace(/\D/g, '').length >= 7) {
        phone = v
      }
    } else if ((m = line.match(/^Phone:\s*(.+)$/i))) {
      const v = m[1].trim()
      if (!listaPlaceholderPhone(v) && /[\d]/.test(v.replace(/\D/g, '')) && v.replace(/\D/g, '').length >= 7) {
        phone = v
      }
    } else if ((m = line.match(/^Social:\s*(.+)$/i))) {
      const u = firstUrlFromText(m[1])
      if (u) socialUrl = u
    } else if ((m = line.match(/^Email:\s*(.+)$/i))) {
      const raw = m[1].trim()
      const tokenWithAt = raw.split(/\s+/).find((p) => p.includes('@') && !/^https?:\/\//i.test(p))
      const emailCandidate = tokenWithAt || raw.replace(/\s+https?:\/\/\S+/gi, '').trim()
      email = stripMailto(firstUrlFromText(emailCandidate) || emailCandidate).replace(/^<|>$/g, '')
    } else if ((m = line.match(/^Website:\s*(.+)$/i))) {
      const raw = m[1].trim()
      const u = firstUrlFromText(raw) || raw.replace(/^<|>$/g, '')
      if (u && /^https?:\/\//i.test(u)) websiteUrl = u
      else if (u && /\./.test(u)) websiteUrl = `https://${u.replace(/^\/+/, '')}`
    } else if ((m = line.match(reListaWaBul))) {
      const u = firstUrlFromText(m[1])
      if (u) whatsappUrl = u
    } else if ((m = line.match(/^WhatsApp:\s*(.+)$/i))) {
      const u = firstUrlFromText(m[1])
      if (u) whatsappUrl = u
    }
  }

  return { phone, socialUrl, email, whatsappUrl, websiteUrl }
}

function seedContactFieldsFromPrimaryUrl(mapsUrl) {
  const o = { whatsappUrl: '', socialUrl: '', email: '', websiteUrl: '' }
  if (!mapsUrl) return o
  if (/wa\.me\//i.test(mapsUrl) || /api\.whatsapp/i.test(mapsUrl)) o.whatsappUrl = mapsUrl
  else if (/^mailto:/i.test(mapsUrl)) o.email = stripMailto(mapsUrl)
  else if (!/^tel:/i.test(mapsUrl) && /^https?:\/\//i.test(mapsUrl)) {
    if (/instagram|facebook\.com|fb\.com|tiktok|twitter\.com|x\.com/i.test(mapsUrl)) o.socialUrl = mapsUrl
    else o.websiteUrl = mapsUrl
  }
  return o
}

function computeListaPrimaryLink({ whatsappUrl, socialUrl, websiteUrl, email, phone }) {
  let primaryUrl = whatsappUrl || socialUrl || websiteUrl || (email ? `mailto:${email}` : '')
  let linkLabel = 'Link'
  if (whatsappUrl) linkLabel = 'WhatsApp'
  else if (socialUrl) {
    linkLabel = /instagram/i.test(socialUrl)
      ? 'Instagram'
      : /facebook/i.test(socialUrl)
        ? 'Facebook'
        : 'Social'
  } else if (websiteUrl) linkLabel = 'Website'
  else if (email) linkLabel = 'Email'

  if (!primaryUrl && phone) {
    const digits = phone.replace(/\D/g, '')
    if (digits.length >= 7) {
      primaryUrl = `tel:${digits}`
      linkLabel = 'Call'
    }
  }

  return { mapsUrl: primaryUrl || '', linkLabel }
}

function normalizeUrlKey(u) {
  if (!u) return ''
  return u.replace(/\/$/, '').replace(/^mailto:/i, '').toLowerCase()
}

function defaultLabelForLinkType(type) {
  const m = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    facebook: 'Facebook',
    email: 'Email',
    website: 'Website',
    maps: 'Maps',
    link: 'Link',
  }
  return m[type] || m.link
}

function linkTypeFromHref(href, label) {
  const h = (href || '').toLowerCase()
  const l = (label || '').toLowerCase()
  if (/^mailto:/i.test(href)) return 'email'
  if (/wa\.me|whatsapp|api\.whatsapp/i.test(h)) return 'whatsapp'
  if (/instagram\.com|instagr\.am/i.test(h) || l.includes('instagram')) return 'instagram'
  if (/facebook\.com|fb\.com|fb\.me/i.test(h) || (l.includes('facebook') && !l.includes('instagram')))
    return 'facebook'
  if (/maps\.google|google\.com\/maps|goo\.gl\/maps|maps\.apple\.com/i.test(h)) return 'maps'
  if (/^https?:\/\//i.test(href)) return 'website'
  return 'link'
}

/**
 * Ordered footer slots: phone first, then primary URL, then lista extras — each with its own icon.
 */
function buildContactLinkSlots({ phone, mapsUrl, linkLabel, listaExtras }) {
  const slots = []
  const seen = new Set()

  const pushPhone = (display) => {
    const v = String(display || '').trim()
    if (!v || v === '—') return
    if (slots.some((s) => s.type === 'phone')) return
    slots.push({ type: 'phone', value: v })
  }

  if (mapsUrl && /^tel:/i.test(mapsUrl)) {
    const digits = mapsUrl.replace(/^tel:/i, '').replace(/\D/g, '')
    if (digits.length >= 7) pushPhone(digits)
  }

  const phoneClean = normalizeListaPhoneDisplay(stripUrlsFromPhoneDisplay(phone || ''))
  if (phoneClean && phoneClean !== '—') pushPhone(phoneClean)

  const addLink = (href, label) => {
    if (!href || !String(href).trim()) return
    if (/^tel:/i.test(href)) return
    const key = normalizeUrlKey(href)
    if (!key || seen.has(key)) return
    seen.add(key)
    const type = linkTypeFromHref(href, label)
    slots.push({
      type,
      href,
      label: String(label || defaultLabelForLinkType(type)).trim(),
    })
  }

  if (mapsUrl && !/^tel:/i.test(mapsUrl)) addLink(mapsUrl, linkLabel)
  for (const x of listaExtras || []) addLink(x.href, x.label)

  return slots
}

/** Extra contact links shown under the card stats (primary CTA excluded). */
function buildListaExtras(fields, primaryUrl) {
  const { whatsappUrl, socialUrl, websiteUrl, email } = fields
  const extras = []
  const seen = new Set()
  const pKey = normalizeUrlKey(primaryUrl)

  const add = (label, href) => {
    if (!href) return
    const k = normalizeUrlKey(href)
    if (!k || seen.has(k)) return
    if (pKey && k === pKey) return
    if (primaryUrl?.startsWith?.('mailto:') && href.startsWith('mailto:')) {
      if (normalizeUrlKey(href) === normalizeUrlKey(primaryUrl)) return
    }
    seen.add(k)
    extras.push({ label, href })
  }

  if (socialUrl) add(/instagram/i.test(socialUrl) ? 'Instagram' : /facebook/i.test(socialUrl) ? 'Facebook' : 'Social', socialUrl)
  if (email) add('Email', `mailto:${email}`)
  if (websiteUrl) add('Website', websiteUrl)
  if (whatsappUrl) add('WhatsApp', whatsappUrl)

  return extras
}

function listaContactFieldsForExtras({ whatsappUrl, socialUrl, websiteUrl, email }) {
  return { whatsappUrl, socialUrl, websiteUrl, email }
}

export function parseListaBusinessMultiline(block) {
  if (!looksLikeListaBlock(block)) return null

  const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return null

  const nameLine = lines[0].replace(/\*\*/g, '')
  const nameMatch = nameLine.match(/^\d+\.\s*(.+)$/)
  const name = nameMatch ? stripMarkdownBold(nameMatch[1].trim()) : stripMarkdownBold(nameLine)

  let category = ''
  let address = ''

  const reCat = new RegExp(`^${LISTA_BULLET}\\s*Category:\\s*(.+)$`, 'i')
  const reLoc = new RegExp(`^${LISTA_BULLET}\\s*Location:\\s*(.+)$`, 'i')

  for (const L of lines.slice(1)) {
    const line = L.replace(/\*\*/g, '')
    let m
    if ((m = line.match(reCat))) category = m[1].trim()
    else if ((m = line.match(reLoc))) address = m[1].trim()
  }

  const contactFromBody = parseListaContactFieldsFromLines(lines.slice(1))

  if (!name) return null
  const locUsable = address && address !== '—' && address !== '-' ? address : ''
  const catUsable = category && category !== '—' && category !== '-' ? category : ''
  const displayAddress = locUsable || catUsable
  if (!displayAddress) return null

  const {
    phone: rawPhone,
    socialUrl,
    email,
    whatsappUrl,
    websiteUrl,
  } = contactFromBody
  const phone = normalizeListaPhoneDisplay(stripUrlsFromPhoneDisplay(rawPhone))

  const { mapsUrl, linkLabel } = computeListaPrimaryLink({
    whatsappUrl,
    socialUrl,
    websiteUrl,
    email,
    phone: phone !== '—' ? phone : '',
  })

  const mergedFields = { whatsappUrl, socialUrl, websiteUrl, email }
  const listaExtras = buildListaExtras(listaContactFieldsForExtras(mergedFields), mapsUrl)

  return {
    name,
    address: displayAddress,
    ratingFull: '',
    ratingValue: '—',
    reviewCount: '',
    statusRaw: '',
    phone,
    mapsUrl,
    linkLabel,
    isLista: true,
    listaExtras,
    showCategoryColumn: false,
    sparseStats: true,
  }
}

/** True when this markdown block is only Lista contact tail (split off by a blank line). */
function isListaContactTailBlock(text) {
  const t = text.trim()
  if (!t) return false
  if (looksLikeListaBlock(t)) return false
  const lines = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return false
  return lines.every((line) => {
    if (/^\[ListaBusiness\d*\]$/i.test(line)) return true
    return /^(?:[-*•]\s*)?(Social|Phone|Email|Website|WhatsApp):\s*\S/i.test(line)
  })
}

function mergeListaTailIntoCardData(data, tailText) {
  const tailLines = tailText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const ext = parseListaContactFieldsFromLines(tailLines)
  const seeded = seedContactFieldsFromPrimaryUrl(data.mapsUrl)

  const whatsappUrl = ext.whatsappUrl || seeded.whatsappUrl
  const socialUrl = ext.socialUrl || seeded.socialUrl
  const websiteUrl = ext.websiteUrl || seeded.websiteUrl
  const email = ext.email || seeded.email

  const basePhoneOk = data.phone && data.phone !== '—'
  const phoneMerged = basePhoneOk
    ? normalizeListaPhoneDisplay(stripUrlsFromPhoneDisplay(data.phone))
    : normalizeListaPhoneDisplay(stripUrlsFromPhoneDisplay(ext.phone))

  const { mapsUrl, linkLabel } = computeListaPrimaryLink({
    whatsappUrl,
    socialUrl,
    websiteUrl,
    email,
    phone: phoneMerged !== '—' ? phoneMerged : '',
  })

  const mergedFields = { whatsappUrl, socialUrl, websiteUrl, email }
  const listaExtras = buildListaExtras(listaContactFieldsForExtras(mergedFields), mapsUrl)

  return {
    ...data,
    phone: phoneMerged,
    mapsUrl,
    linkLabel,
    listaExtras,
    showCategoryColumn: false,
    sparseStats: true,
    statusRaw: '',
  }
}

function mergeListaContactTailSegments(segments) {
  const out = []
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (seg.type !== 'listing' || !seg.data?.isLista) {
      out.push(seg)
      continue
    }

    const tailParts = []
    let j = i + 1
    while (j < segments.length && segments[j].type === 'markdown' && isListaContactTailBlock(segments[j].content)) {
      tailParts.push(segments[j].content)
      j++
    }

    if (tailParts.length === 0) {
      out.push(seg)
      continue
    }

    const mergedData = tailParts.reduce(
      (acc, chunk) => mergeListaTailIntoCardData(acc, chunk),
      seg.data,
    )
    out.push({ type: 'listing', data: mergedData })
    i = j - 1
  }
  return out
}

/**
 * Multi-line / numbered-list format, e.g.
 * 1. Business name
 * 📍 Address line
 * ★★★★★ 4.8/5 (11686 reviews)
 * 🔴 Closed now
 * 📞 Phone: …
 * 🗺️ Google Maps: https://…
 * (Phone line optional; status may be ✅ Open now)
 */
export function parseBusinessListingMultiline(block) {
  const lines = block.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0)
  if (lines.length < 2) return null
  const blob = block
  if (!blob.includes(PIN) || !blob.includes('🗺️')) return null

  const nameParts = []
  let i = 0
  while (i < lines.length && !lines[i].includes(PIN)) {
    nameParts.push(lines[i].replace(/^\d+\.\s*/, '').trim())
    i++
  }
  const name = nameParts.join(' ').trim()
  if (!name || i >= lines.length) return null

  const addrLine = lines[i]
  const pi = addrLine.indexOf(PIN)
  if (pi === -1) return null
  const address = addrLine.slice(pi + PIN.length).trim()
  if (!address) return null
  i++

  let ratingFull = ''
  let statusRaw = ''
  let phone = ''
  let mapsUrl = ''

  while (i < lines.length) {
    const L = lines[i]
    if (/^★/.test(L)) {
      ratingFull = L
      i++
      continue
    }
    if (/^(🔴|🟢|🕐|✅)/u.test(L)) {
      statusRaw = L
      i++
      continue
    }
    if (L.includes(PHONE_PREFIX)) {
      const pm = L.match(/📞\s*Phone:\s*(.+)$/i)
      phone = pm ? pm[1].trim() : L.replace(/^.*📞\s*/i, '').replace(/^Phone:\s*/i, '').trim()
      i++
      continue
    }
    if (L.includes('🗺️')) {
      mapsUrl = extractMapsUrlFromLine(L)
      i++
      continue
    }
    i++
  }

  if (!mapsUrl || !name || !address) return null

  const numMatch = (ratingFull || '').match(/([\d.]+)\/5/)
  const reviewsMatch = (ratingFull || '').match(/\((\d+)\s*reviews?\)/i)
  const ratingValue = numMatch ? numMatch[1] : '—'
  const reviewCount = reviewsMatch ? reviewsMatch[1] : ''

  return {
    name,
    address,
    ratingFull: ratingFull || (ratingValue !== '—' ? `${ratingValue}/5` : ''),
    ratingValue,
    reviewCount,
    statusRaw,
    phone,
    mapsUrl,
  }
}

/**
 * Single-line format: Name 📍 address ★… 4.7/5 (…) status 📞 Phone: … 🗺️ Google Maps: url
 * Phone optional.
 */
export function parseBusinessListing(line) {
  const s = line.trim().replace(/\s+/g, ' ')
  if (!s.includes(PIN) || !s.includes('🗺️')) return null

  const iPin = s.indexOf(PIN)
  let name = s.slice(0, iPin).trim().replace(/^\d+\.\s*/, '')
  if (!name) return null

  const iStar = s.indexOf('★', iPin + PIN.length)
  if (iStar === -1) return null

  const address = s.slice(iPin + PIN.length, iStar).trim()
  if (!address) return null

  let i = iStar
  while (i < s.length && s[i] === '★') i++
  const ratingMatch = s.slice(i).match(/^(\s*[\d.]+\/5\s*\(\d+\s*reviews?\))/i)
  if (!ratingMatch) return null

  const ratingFull = s.slice(iStar, i + ratingMatch[0].length).trim()
  const numMatch = ratingFull.match(/([\d.]+)\/5/)
  const reviewsMatch = ratingFull.match(/\((\d+)\s*reviews?\)/i)
  const ratingValue = numMatch ? numMatch[1] : ''
  const reviewCount = reviewsMatch ? reviewsMatch[1] : ''

  let rest = s.slice(i + ratingMatch[0].length).trim()
  const mapIdx = rest.indexOf('🗺️')
  if (mapIdx === -1) return null

  const phoneIdx = rest.indexOf(PHONE_PREFIX)
  let statusRaw = ''
  let phone = ''
  let mapsUrl = ''

  if (phoneIdx !== -1 && phoneIdx < mapIdx) {
    statusRaw = rest.slice(0, phoneIdx).trim()
    const afterPhone = rest.slice(phoneIdx)
    const mapIdx2 = afterPhone.indexOf('🗺️')
    if (mapIdx2 === -1) return null
    const phoneLine = afterPhone.slice(0, mapIdx2).trim()
    const phoneMatch = phoneLine.match(/^📞\s*Phone:\s*(.+)$/i)
    phone = phoneMatch ? phoneMatch[1].trim() : phoneLine.replace(/^📞\s*/, '').replace(/^Phone:\s*/i, '').trim()
    mapsUrl = extractMapsUrlFromLine(afterPhone.slice(mapIdx2))
  } else {
    statusRaw = rest.slice(0, mapIdx).trim()
    phone = ''
    mapsUrl = extractMapsUrlFromLine(rest.slice(mapIdx))
  }

  if (!mapsUrl) return null

  return {
    name,
    address,
    ratingFull,
    ratingValue,
    reviewCount,
    statusRaw,
    phone,
    mapsUrl,
  }
}

/** Intro text before numbered listings, or whole block if not a listing. */
function extractPreambleAndListingsBody(trimmedBlock, mode) {
  const isGoogle = mode === 'google'
  const isLista = mode === 'lista'

  if (!isGoogle && !isLista) {
    return { preamble: trimmedBlock, listings: '' }
  }

  const lines = trimmedBlock.split(/\r?\n/)
  let preambleEnd = -1
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx]
    if (/^\s*\d+\.\s/.test(line)) {
      const fromHere = lines.slice(idx).join('\n')
      if (isGoogle && fromHere.includes(PIN)) {
        preambleEnd = idx
        break
      }
      if (
        isLista &&
        new RegExp(`^\\s*${LISTA_BULLET}\\s*(Category|Location):`, 'im').test(fromHere)
      ) {
        preambleEnd = idx
        break
      }
    }
  }

  if (preambleEnd === -1) {
    return { preamble: '', listings: trimmedBlock }
  }

  const preamble = lines.slice(0, preambleEnd).join('\n').trim()
  const listings = lines.slice(preambleEnd).join('\n')
  return { preamble, listings }
}

/** Google Places: one chunk per place (ends with Google Maps line). */
function splitCompleteListings(listingsText) {
  const lines = listingsText.split(/\r?\n/)
  const groups = []
  let group = []

  const isComplete = () => {
    const g = group.join('\n')
    return g.includes('🗺️') && /Google Maps:/i.test(g)
  }

  for (const line of lines) {
    if (/^\s*\d+\.\s/.test(line) && group.length > 0 && isComplete()) {
      groups.push(group.join('\n'))
      group = [line]
    } else {
      group.push(line)
    }
  }
  if (group.length) groups.push(group.join('\n'))
  return groups.filter((g) => g.trim())
}

/** Lista CSV style: split when next numbered item starts and previous chunk is complete. */
function splitListaListings(listingsText) {
  const lines = listingsText.split(/\r?\n/)
  const groups = []
  let group = []

  for (const line of lines) {
    if (/^\s*\d+\.\s/.test(line) && group.length > 0 && isListaListingComplete(group.join('\n'))) {
      groups.push(group.join('\n'))
      group = [line]
    } else {
      group.push(line)
    }
  }
  if (group.length) groups.push(group.join('\n'))
  return groups.filter((g) => g.trim())
}

/**
 * Split assistant text into listing cards and markdown fragments.
 */
export function segmentAssistantMessage(text) {
  if (!text || !text.trim()) return [{ type: 'markdown', content: text || '' }]

  const segments = []
  const majorBlocks = text.split(/\n\n+/)

  for (const block of majorBlocks) {
    const trimmed = block.trim()
    if (!trimmed) continue

    const isGoogle = trimmed.includes(PIN) && trimmed.includes('🗺️')
    const isLista = looksLikeListaBlock(trimmed)

    if (!isGoogle && !isLista) {
      segments.push({ type: 'markdown', content: trimmed })
      continue
    }

    const mode = isGoogle ? 'google' : 'lista'
    const { preamble, listings } = extractPreambleAndListingsBody(trimmed, mode)
    if (preamble) segments.push({ type: 'markdown', content: preamble })

    const body = listings
    if (!body) continue

    const subs =
      mode === 'google'
        ? (() => {
            const s = splitCompleteListings(body)
            return s.length ? s : [body]
          })()
        : (() => {
            const s = splitListaListings(body)
            return s.length ? s : [body]
          })()

    for (const sub of subs) {
      const data =
        mode === 'google'
          ? parseBusinessListingMultiline(sub) || parseBusinessListing(sub.replace(/\s+/g, ' ').trim())
          : parseListaBusinessMultiline(sub)

      if (data) segments.push({ type: 'listing', data })
      else if (sub.trim()) segments.push({ type: 'markdown', content: sub })
    }
  }

  let result = mergeListaContactTailSegments(segments)
  if (result.length === 0) result.push({ type: 'markdown', content: text })
  return result
}

function IconStar({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function IconPhone({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function IconClock({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function IconMapPin({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconWhatsApp({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.55 0-3-.4-4.24-1.15L3 21l1.65-5.1A8.4 8.4 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" />
      <path d="M9.5 9.5c.2 1.4 1.2 3.4 3.2 5.3 2 2 4.1 2.9 5.3 3.2" />
    </svg>
  )
}

function IconInstagram({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconEnvelope({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 6L2 7" />
    </svg>
  )
}

function IconFacebook({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function IconGlobe({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
    </svg>
  )
}

function IconExternalLink({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  )
}

function StatIconForContactType({ type, className }) {
  switch (type) {
    case 'whatsapp':
      return <IconWhatsApp className={className} />
    case 'instagram':
      return <IconInstagram className={className} />
    case 'facebook':
      return <IconFacebook className={className} />
    case 'email':
      return <IconEnvelope className={className} />
    case 'maps':
      return <IconMapPin className={className} />
    case 'website':
      return <IconGlobe className={className} />
    default:
      return <IconExternalLink className={className} />
  }
}

function IconStore({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function humanStatus(statusRaw) {
  if (!statusRaw) return '—'
  return statusRaw.replace(/^(🔴|🟢|🕐|✅)\s*/u, '').trim() || statusRaw
}

export function BusinessListingCard({
  name,
  address,
  ratingFull,
  ratingValue,
  reviewCount,
  statusRaw,
  phone,
  mapsUrl,
  linkLabel = 'Google Maps',
  isLista = false,
  listaExtras = [],
  /** When false, hide the clock / category (Lista) column entirely. */
  showCategoryColumn = true,
  /** When true, omit stat slots that have no real data (no "—" placeholders). */
  sparseStats = false,
  /** Optional explicit contact rows (phone + links with icons). If omitted, built when sparseStats && isLista. */
  contactLinks = undefined,
}) {
  const statusIsClosed = /closed\s*now/i.test(statusRaw)
  const statusIsOpen = (/\bopen\b/i.test(statusRaw) && !statusIsClosed) || /✅/u.test(statusRaw)
  const statusClass = statusIsClosed ? 'is-closed' : statusIsOpen ? 'is-open' : 'is-neutral'
  const statusLabel = humanStatus(statusRaw || '')
  const ratingLabel = ratingValue && ratingValue !== '—' ? `${ratingValue}/5` : '—'
  const ratingSub =
    reviewCount ? `${Number(reviewCount).toLocaleString()} reviews` : isLista ? 'Lista' : 'Rating'
  const mapsOpensNewTab = /^https?:\/\//i.test(mapsUrl || '')

  const ratingHasData =
    (ratingValue && String(ratingValue).trim() !== '' && ratingValue !== '—') ||
    (reviewCount != null && String(reviewCount).trim() !== '' && Number(reviewCount) > 0)
  const phoneHasData = phone && String(phone).trim() !== '' && phone !== '—'
  const statusHasData =
    showCategoryColumn &&
    statusRaw &&
    String(statusRaw).trim() !== '' &&
    statusLabel !== '—'

  const showRatingStat = !sparseStats || ratingHasData
  const showPhoneStat = !sparseStats || phoneHasData
  const showStatusStat = !sparseStats ? showCategoryColumn : statusHasData
  const showMapsStat = Boolean(mapsUrl)
  const showMapsPlaceholder = !mapsUrl && !sparseStats

  const footerClass =
    sparseStats
      ? 'biz-listing-footer biz-listing-footer--sparse'
      : 'biz-listing-footer'

  const contactSlots =
    Array.isArray(contactLinks) && contactLinks.length > 0
      ? contactLinks
      : sparseStats && isLista
        ? buildContactLinkSlots({ phone, mapsUrl, linkLabel, listaExtras })
        : null
  const useContactIconGrid = Array.isArray(contactSlots) && contactSlots.length > 0

  return (
    <article className="biz-listing-card">
      <div className="biz-listing-header">
        <div className="biz-listing-header-inner">
          <div className="biz-listing-logo" aria-hidden>
            <IconStore />
          </div>
          <div className="biz-listing-header-text">
            <div className="biz-listing-title-row">
              <h3 className="biz-listing-title">{name}</h3>
            </div>
            <p className="biz-listing-address">
              <IconMapPin className="biz-listing-address-icon" />
              <span>{address}</span>
            </p>
          </div>
        </div>
      </div>
      {useContactIconGrid ? (
        <div className={footerClass}>
          {contactSlots.map((slot, si) =>
            slot.type === 'phone' ? (
              <div key={`phone-${si}-${slot.value}`} className="biz-listing-stat">
                <IconPhone className="biz-listing-stat-icon" />
                <div className="biz-listing-stat-text">
                  <span className="biz-listing-stat-value biz-listing-phone">{slot.value}</span>
                  <span className="biz-listing-stat-sub">Phone</span>
                </div>
              </div>
            ) : (
              <a
                key={`link-${si}-${normalizeUrlKey(slot.href)}`}
                className="biz-listing-stat biz-listing-maps"
                href={slot.href}
                target={
                  /^https?:\/\//i.test(slot.href) ? '_blank' : undefined
                }
                rel={
                  /^https?:\/\//i.test(slot.href) ? 'noopener noreferrer' : undefined
                }
              >
                <StatIconForContactType type={slot.type} className="biz-listing-stat-icon" />
                <div className="biz-listing-stat-text">
                  <span className="biz-listing-stat-value">{slot.label}</span>
                  <span className="biz-listing-stat-sub">Open link</span>
                </div>
              </a>
            ),
          )}
        </div>
      ) : (
        <div className={footerClass}>
          {showRatingStat ? (
            <div className="biz-listing-stat" title={ratingFull || undefined}>
              <IconStar className="biz-listing-stat-icon biz-listing-stat-star" />
              <div className="biz-listing-stat-text">
                <span className="biz-listing-stat-value">{ratingLabel}</span>
                <span className="biz-listing-stat-sub">{ratingSub}</span>
              </div>
            </div>
          ) : null}
          {showPhoneStat ? (
            <div className="biz-listing-stat">
              <IconPhone className="biz-listing-stat-icon" />
              <div className="biz-listing-stat-text">
                <span className="biz-listing-stat-value biz-listing-phone">{phone || '—'}</span>
                <span className="biz-listing-stat-sub">Phone</span>
              </div>
            </div>
          ) : null}
          {showStatusStat ? (
            <div className={`biz-listing-stat biz-listing-stat-status ${statusClass}`}>
              <IconClock className="biz-listing-stat-icon" />
              <div className="biz-listing-stat-text">
                <span className="biz-listing-stat-value">{statusLabel}</span>
                <span className="biz-listing-stat-sub">{isLista ? 'Category' : 'Status'}</span>
              </div>
            </div>
          ) : null}
          {showMapsStat ? (
            <a
              className="biz-listing-stat biz-listing-maps"
              href={mapsUrl}
              target={mapsOpensNewTab ? '_blank' : undefined}
              rel={mapsOpensNewTab ? 'noopener noreferrer' : undefined}
            >
              <IconMapPin className="biz-listing-stat-icon" />
              <div className="biz-listing-stat-text">
                <span className="biz-listing-stat-value">{linkLabel}</span>
                <span className="biz-listing-stat-sub">Open link</span>
              </div>
            </a>
          ) : showMapsPlaceholder ? (
            <div className="biz-listing-stat biz-listing-maps biz-listing-maps-empty" aria-hidden="false">
              <IconMapPin className="biz-listing-stat-icon" />
              <div className="biz-listing-stat-text">
                <span className="biz-listing-stat-value">—</span>
                <span className="biz-listing-stat-sub">No link</span>
              </div>
            </div>
          ) : null}
        </div>
      )}
      {isLista && listaExtras?.length > 0 && !useContactIconGrid ? (
        <div className="biz-listing-lista-extras">
          {listaExtras.map((x, xi) => (
            <span key={`${x.href}-${xi}`} className="biz-listing-lista-extra-item">
              {xi > 0 ? <span className="biz-listing-lista-extra-sep">·</span> : null}
              <a
                href={x.href}
                target={/^https?:\/\//i.test(x.href) ? '_blank' : undefined}
                rel={/^https?:\/\//i.test(x.href) ? 'noopener noreferrer' : undefined}
              >
                {x.label}
              </a>
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}

/** Renders one directory row from the chat API `businesses` JSON (Mongo/SQL listing shape). */
export function ApiDirectoryBusinessCard({ business }) {
  if (!business || typeof business !== 'object') return null
  const loc = [business.city, business.state, business.zip_code].filter(Boolean).join(', ') || '—'
  const dist = business.distance_miles
  const address =
    dist != null && Number.isFinite(Number(dist))
      ? `${loc} · ~${Number(dist)} mi`
      : loc

  const contactRaw = (business.contact_info || '').trim()
  const lines = contactRaw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const parsed = parseListaContactFieldsFromLines(lines)
  const whatsappUrl = (parsed.whatsappUrl || business.whatsapp_url || '').trim()
  const fields = {
    phone: parsed.phone,
    socialUrl: parsed.socialUrl,
    email: parsed.email,
    websiteUrl: parsed.websiteUrl,
    whatsappUrl,
  }
  const phoneLine = normalizeListaPhoneDisplay(stripUrlsFromPhoneDisplay(fields.phone))
  const { mapsUrl, linkLabel } = computeListaPrimaryLink(fields)
  const listaExtras = buildListaExtras(listaContactFieldsForExtras(fields), mapsUrl)

  return (
    <BusinessListingCard
      name={business.name || '—'}
      address={address}
      ratingValue="—"
      reviewCount={null}
      statusRaw=""
      phone={phoneLine}
      mapsUrl={mapsUrl}
      linkLabel={linkLabel}
      isLista
      listaExtras={listaExtras}
      showCategoryColumn={false}
      sparseStats
    />
  )
}

export function AssistantMessageContent({ text, markdownComponents }) {
  const segments = segmentAssistantMessage(text)
  return (
    <div className="assistant-message-parts">
      {segments.map((seg, i) =>
        seg.type === 'listing' ? (
          <BusinessListingCard key={`l-${i}`} {...seg.data} />
        ) : (
          <div key={`m-${i}`} className="assistant-markdown-chunk">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {seg.content}
            </ReactMarkdown>
          </div>
        ),
      )}
    </div>
  )
}
