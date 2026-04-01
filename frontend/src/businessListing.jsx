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
  // Plain URL may be followed by other text in same line — take first URL token
  const urlOnly = url.match(/^(https?:\/\/\S+)/i)
  return urlOnly ? urlOnly[1] : url.split(/\s/)[0] || url
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
function extractPreambleAndListingsBody(trimmedBlock) {
  if (!trimmedBlock.includes(PIN) || !trimmedBlock.includes('🗺️')) {
    return { preamble: trimmedBlock, listings: '' }
  }

  const lines = trimmedBlock.split(/\r?\n/)
  let preambleEnd = -1
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx]
    if (/^\s*\d+\.\s/.test(line)) {
      const fromHere = lines.slice(idx).join('\n')
      if (fromHere.includes(PIN)) {
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

/** Split listing region into one string per place (each ends with Google Maps line). */
function splitCompleteListings(listingsText) {
  const lines = listingsText.split(/\r?\n/)
  const groups = []
  let group = []

  const isComplete = () => {
    const g = group.join('\n')
    return g.includes('🗺️') && /Google Maps:/i.test(g)
  }

  for (const line of lines) {
    const t = line.trim()
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

    const { preamble, listings } = extractPreambleAndListingsBody(trimmed)
    if (preamble) segments.push({ type: 'markdown', content: preamble })

    const body = listings
    if (!body || !body.includes(PIN) || !body.includes('🗺️')) {
      continue
    }

    const subs = splitCompleteListings(body)
    if (subs.length === 0) subs.push(body)

    for (const sub of subs) {
      const data = parseBusinessListingMultiline(sub) || parseBusinessListing(sub.replace(/\s+/g, ' ').trim())
      if (data) segments.push({ type: 'listing', data })
      else if (sub.trim()) segments.push({ type: 'markdown', content: sub })
    }
  }

  if (segments.length === 0) segments.push({ type: 'markdown', content: text })
  return segments
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

export function BusinessListingCard({ name, address, ratingFull, ratingValue, reviewCount, statusRaw, phone, mapsUrl }) {
  const statusIsClosed = /closed\s*now/i.test(statusRaw)
  const statusIsOpen = (/\bopen\b/i.test(statusRaw) && !statusIsClosed) || /✅/u.test(statusRaw)
  const statusClass = statusIsClosed ? 'is-closed' : statusIsOpen ? 'is-open' : 'is-neutral'
  const statusLabel = humanStatus(statusRaw)
  const ratingLabel = ratingValue && ratingValue !== '—' ? `${ratingValue}/5` : '—'

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
      <div className="biz-listing-footer">
        <div className="biz-listing-stat" title={ratingFull || undefined}>
          <IconStar className="biz-listing-stat-icon biz-listing-stat-star" />
          <div className="biz-listing-stat-text">
            <span className="biz-listing-stat-value">{ratingLabel}</span>
            <span className="biz-listing-stat-sub">
              {reviewCount ? `${Number(reviewCount).toLocaleString()} reviews` : 'Rating'}
            </span>
          </div>
        </div>
        <div className="biz-listing-stat">
          <IconPhone className="biz-listing-stat-icon" />
          <div className="biz-listing-stat-text">
            <span className="biz-listing-stat-value biz-listing-phone">{phone || '—'}</span>
            <span className="biz-listing-stat-sub">Phone</span>
          </div>
        </div>
        <div className={`biz-listing-stat biz-listing-stat-status ${statusClass}`}>
          <IconClock className="biz-listing-stat-icon" />
          <div className="biz-listing-stat-text">
            <span className="biz-listing-stat-value">{statusLabel}</span>
            <span className="biz-listing-stat-sub">Status</span>
          </div>
        </div>
        <a
          className="biz-listing-stat biz-listing-maps"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconMapPin className="biz-listing-stat-icon" />
          <div className="biz-listing-stat-text">
            <span className="biz-listing-stat-value">Google Maps</span>
            <span className="biz-listing-stat-sub">Open link</span>
          </div>
        </a>
      </div>
    </article>
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
