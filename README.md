# Abdullah Imran — Portfolio

Personal developer portfolio built with [Next.js](https://nextjs.org) 14. Single-page site with animated hero, project showcase, live GitHub activity, and contact section.

## Features

- **Hero** — Three.js wireframe sphere with scroll parallax
- **About & Stack** — Bio and technology categories
- **Work** — Featured projects with live platform links
- **Activity** — GitHub contribution graph, language breakdown, stats, and radar chart
- **Contact** — Email CTA and social links
- **Responsive** — Mobile nav, 6-month swipeable contribution graph on small screens

## Tech Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** CSS custom properties
- **3D:** Three.js, React Three Fiber, Drei
- **Animation:** Framer Motion, CSS transitions
- **Data:** GitHub REST API (contributions, languages, activity)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment variables

Create `.env.local` in the project root:

```env
GITHUB_TOKEN=your_github_personal_access_token
```

The token needs **`repo`** scope if you want private repository contributions included in the activity graph. Never commit `.env.local` — it is listed in `.gitignore`.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run start` | Run production server    |
| `npm run lint`  | Run ESLint               |

## Project structure

```
app/
  api/          # GitHub stats, languages, activity routes
  globals.css   # Design tokens and layout
  page.tsx      # Root page
components/     # UI sections and GitHub visualizations
hooks/          # Shared React hooks
public/         # Static assets (CV, images)
```

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project on [Vercel](https://vercel.com/new).
3. Add `GITHUB_TOKEN` under **Settings → Environment Variables**.
4. Deploy.

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more detail.

## License

Private — © Abdullah Imran
