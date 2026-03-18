# Braelo Chatbot – React frontend

This React app talks to the **Braelo** backend (Django) at `/chatbot/`. The backend lives inside the Braelo project at `braelo/chatbot/`.

## Run locally

1. **Start Braelo backend** (from `braelo` folder):
   ```bash
   python manage.py runserver
   ```

2. **Install and run this frontend**:
   ```bash
   cd chatbot/frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:5173. The Vite dev server proxies `/chatbot` to `http://localhost:8000`, so chat requests go to the Braelo backend.

## Env (optional)

- `VITE_API_BASE`: Backend base URL. Empty = use proxy (dev). Set e.g. `http://localhost:8000` if you’re not using the proxy.

## Build

```bash
npm run build
```

Output is in `dist/`. You can serve it with any static host or point Braelo at it if you add a static route.
