# 🚀 Matrix AI Lead Generator

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MatrixDigital-ai/Lead_Generator)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Intelligent B2B Lead Discovery Platform** - Generate high-quality business leads instantly with AI-powered web scraping and smart scoring.

![Matrix AI Lead Generator](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Multi-Source Search** | Aggregates results from Google, Bing, DuckDuckGo, and YellowPages |
| 📧 **Email Discovery** | Auto-generates common business email patterns (info@, contact@, sales@) |
| 💯 **Smart Lead Scoring** | AI-powered 0-100 scoring based on website health & business signals |
| 🏢 **Business Classification** | Automatically identifies B2B vs B2C businesses |
| 📊 **CSV Export** | One-click export of all discovered leads |
| ⚡ **Rate Limiting** | Built-in API protection (10 requests/minute) |
| 🎨 **Modern UI** | Clean, professional interface with responsive design |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Scraping:** Cheerio (server-side HTML parsing)
- **Runtime:** React 19 with React Compiler

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/MatrixDigital-ai/Lead_Generator.git

# Navigate to project directory
cd Lead_Generator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-leads/    # API endpoint
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── LeadForm.tsx           # Search form component
│   │   └── ResultsTable.tsx       # Results display
│   ├── lib/
│   │   ├── scraper/               # Web scraping modules
│   │   ├── processors/            # Data processing
│   │   ├── rate-limiter.ts        # API rate limiting
│   │   └── utils.ts               # Utility functions
│   └── types/
│       └── index.ts               # TypeScript definitions
├── public/                        # Static assets
├── next.config.ts                 # Next.js configuration
└── package.json
```

---

## 🔌 API Reference

### Generate Leads

```http
POST /api/generate-leads
Content-Type: application/json
```

**Request Body:**

```json
{
  "industry": "software development",
  "location": "New York",
  "maxResults": 25
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "uuid",
        "companyName": "Example Corp",
        "website": "https://example.com",
        "emails": ["info@example.com", "contact@example.com"],
        "classification": "B2B",
        "score": 85,
        "healthStatus": "healthy"
      }
    ],
    "totalFound": 25,
    "processedAt": "2025-01-15T12:00:00.000Z"
  }
}
```

---

## 📊 Lead Scoring System

Leads are scored 0-100 based on:

| Criteria | Points | Description |
|----------|--------|-------------|
| Website Active | 40 | Site responds and is accessible |
| HTTPS Enabled | 20 | Secure connection available |
| Business Keywords | 25 | Contains professional terminology |
| Response Time | 0-15 | Faster = higher score |

**Score Interpretation:**
- 🟢 **80-100:** High-quality lead
- 🟡 **50-79:** Medium potential
- 🔴 **0-49:** Needs verification

---

## ☁️ Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Deploy (zero configuration needed)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MatrixDigital-ai/Lead_Generator)

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## ⚙️ Environment Variables

No environment variables required for basic functionality. All features work out of the box.

---

## 🔒 Security Features

- **Rate Limiting:** 10 requests per minute per IP
- **Input Sanitization:** All user inputs are sanitized
- **Security Headers:** X-Frame-Options, X-Content-Type-Options
- **No External APIs:** No API keys or third-party dependencies

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Vercel](https://vercel.com/)

---

<p align="center">
  <strong>Made with ❤️ by Matrix Digital AI</strong>
</p>
