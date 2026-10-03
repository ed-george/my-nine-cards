# My 9 Cards 🎴✨

A modern web application clone inspired by `my9albums.com` built specifically for **Pokémon TCG collectors and fans**. Users can search over 20,000+ official Pokémon TCG cards using the **TCGdex REST API**, build their ultimate 3x3 favorite cards showcase, customize aesthetic themes & layout geometry, and export high-resolution images to share on social media.

Built by **Ed Holloway-George** ([@ptgenius](https://x.com/ptgenius) • [spght.dev](https://spght.dev)).

![My 9 Cards Favicon](public/favicon.svg)

---

## 🌟 Key Features

- **3x3 Interactive Showcase Grid**: Select, replace, remove, and drag-and-drop reorder 9 Pokémon cards.
- **TCGdex REST API Integration**: Real-time card search with debouncing, type filters, and 100% exact total card count calculations.
- **Automatic Infinite Scroll**: Smooth auto-pagination with card skeleton shimmers and early prefetching (`rootMargin: '200px'`).
- **Clean Aesthetic Themes**: 8 light, minimalistic themes named after iconic TCG mechanics (*Base Set Holo*, *Secret Rare*, *Delta Metal*, *Fire GX*, *Water VMAX*, *TAG TEAM Gold*, *Psychic EX*, *Tera Crystal*).
- **High-Resolution Image Export**: Export 4K PNG or JPEG images and copy images directly to your system clipboard.
- **Strict Input Sanitization**: Built-in protection stripping URL syntax & injection vectors from query strings.
- **Local Storage Draft Saving**: Keeps your active showcase safe across browser refreshes.

---

## 🛠️ Technology Stack

- **Core**: React 18 + TypeScript + Vite
- **API**: [TCGdex REST API](https://tcgdex.dev) (`https://api.tcgdex.net/v2/en/`)
- **Styling**: Vanilla CSS (CSS Variables, Light Minimal UI, responsive layouts)
- **Icons**: `lucide-react`
- **Image Generation**: `html-to-image` with Base64 image inlining

---

## 🔒 Security Evaluation & Guidance

A comprehensive security audit has been conducted on the **My 9 Cards** codebase. Below is an overview of the security architecture and operational guidance for production deployment.

### 1. Security Controls Implemented

#### A. Input Sanitization & Request Injection Defense
- **Implementation**: All user search inputs pass through `sanitizeSearchQuery()` in [`src/services/tcgdexApi.ts`](file:///Users/ehg/projs/my-nine-cards/src/services/tcgdexApi.ts).
- **Controls**: Strips URL delimiters and query injection vectors (`?`, `&`, `=`, `#`, `:`, `|`, `/`, `\`, `<`, `>`, `%`, `"`, `'`, `;`, `{`, `}`, `(`, `)`), collapses whitespace, and caps length at 50 characters. Parameters are safely serialized using `URLSearchParams`, preventing HTTP parameter pollution (HPP) and SSRF attempts.

#### B. Cross-Site Scripting (XSS) Prevention
- **Implementation**: User-editable fields (grid title, subtitle) render strictly via React JSX text nodes.
- **Controls**: React automatically escapes strings before DOM insertion. No usage of `dangerouslySetInnerHTML` or `eval()`.

#### C. Cross-Origin Image Export Safety (CORS & Base64 Inlining)
- **Implementation**: [`src/services/exportCanvas.ts`](file:///Users/ehg/projs/my-nine-cards/src/services/exportCanvas.ts) pre-converts external image URLs from `assets.tcgdex.net` into Base64 `data:` URLs prior to canvas rendering.
- **Controls**: Prevents cross-origin canvas taint errors in strict browsers (Safari, Firefox, Chrome) and eliminates third-party tracking parameter leakage during export.

#### D. Reverse Tabnabbing Protection
- **Implementation**: All external hyperlinks (X/Twitter, personal site) include `target="_blank" rel="noopener noreferrer"`.
- **Controls**: Prevents malicious external pages from taking control of the opener window via `window.opener`.

#### E. Data Privacy & Storage
- **Implementation**: Client-side `localStorage` stores only non-sensitive card IDs, slot positions, and theme settings.
- **Controls**: No user credentials, authentication tokens, or personally identifiable information (PII) are collected or transmitted.

---

### 2. Production Security Deployment Guidance

When deploying **My 9 Cards** to a public web server, enforce the following HTTP security headers to protect end users:

#### Recommended Security Headers

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' data: blob: https://assets.tcgdex.net; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.tcgdex.net;` | Restricts asset loading to authorized origins |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forces HTTPS communication |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Protects against clickjacking attacks |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Protects referrer privacy |

#### NGINX Configuration Example (`nginx.conf`)

```nginx
server {
    listen 80;
    server_name my9cards.domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name my9cards.domain.com;

    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    # Security Headers
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: blob: https://assets.tcgdex.net; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.tcgdex.net;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🚀 Local Development Setup

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher) or **yarn** / **pnpm** / **bun**

### 1. Clone the Repository & Install Dependencies

```bash
git clone https://github.com/your-username/my-nine-cards.git
cd my-nine-cards

# Install npm dependencies
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`. Open your browser to view and build your 9-card grid.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

This compiles TypeScript, bundles assets, and outputs static production files to the `dist/` directory.

You can preview the production build locally with:

```bash
npm run preview
```

---

## 🌐 Remote Deployment Guide

### 1. Deploying to Vercel (Recommended)

#### Option A: Vercel CLI
```bash
npx vercel
```

#### Option B: GitHub Integration
1. Push your code to GitHub.
2. Import your repository into your [Vercel Dashboard](https://vercel.com).
3. Vercel will automatically detect **Vite** with the following build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

---

### 2. Deploying to Netlify

#### Option A: Netlify CLI
```bash
npx netlify deploy --prod
```

#### Option B: Netlify Dashboard
1. Connect your GitHub repository on [Netlify](https://netlify.com).
2. Set Build Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Click **Deploy Site**.

---

### 3. Deploying to Cloudflare Pages

1. Log in to the Cloudflare Dashboard and navigate to **Workers & Pages**.
2. Click **Create Application** > **Pages** > **Connect to Git**.
3. Select your repository and configure build parameters:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**.

---

### 4. Deploying with Docker / Nginx

#### Create a `Dockerfile`:
```dockerfile
# Step 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Serve stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Build and Run Docker Container:
```bash
docker build -t my-nine-cards .
docker run -p 8080:80 my-nine-cards
```

---

## 📄 License & Attribution

Built by **Ed Holloway-George** ([@ptgenius](https://x.com/ptgenius) • [spght.dev](https://spght.dev)).

MIT License - feel free to use and customize for your own Pokémon TCG projects!
