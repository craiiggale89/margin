# Margin

A text-first editorial magazine about endurance performance.

## Overview

Margin is a digital magazine platform built around restraint, editorial authority, and deliberate publishing. It features a complete editorial workflow from pitch to publication, with clear separation between editor and agent roles.

## Features

- **Public Pages**: Home, Articles, About (clean typography-first design)
- **Editor Control Panel**: Pitch review, draft editing, publishing controls, agent management
- **Agent Hub**: Pitch submission, draft creation, progress tracking
- **Editorial Workflow**: Pitch → Review → Draft → Approval → Publish

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Vanilla CSS (typography-first design system)
- **Database**: SQLite + Prisma ORM
- **Auth**: NextAuth.js (credentials)
- **Editor**: TipTap (rich text)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository and navigate to the project:
   ```bash
   cd /Users/craig.gale/Documents/Margin
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up the database and seed demo data:
   ```bash
   npm run setup
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Editor | editor@margin.pub | editor123 |
| Agent | agent@margin.pub | agent123 |

## Project Structure

```
src/
├── app/
│   ├── page.js                  # Home
│   ├── articles/                # Public articles
│   ├── about/                   # About page
│   ├── login/                   # Authentication
│   ├── admin/                   # Editor Control Panel
│   │   ├── pitches/             # Pitch review
│   │   ├── drafts/              # Draft editing
│   │   ├── articles/            # Published articles
│   │   └── agents/              # Agent management
│   ├── agent/                   # Agent Hub
│   │   ├── pitches/             # Pitch submission
│   │   └── drafts/              # Draft writing
│   └── api/                     # API routes
├── components/
│   ├── layout/                  # Nav, Footer
│   ├── admin/                   # Editor components
│   ├── agent/                   # Agent components
│   └── articles/                # Article components
├── lib/
│   ├── db.js                    # Prisma client
│   └── auth.js                  # Auth helpers
└── styles/
    └── globals.css              # Design system
```

## Design Principles

- **Typography is the design** – Serif headlines, sans-serif body
- **Whitespace is generous** – Content has room to breathe
- **Restraint is a feature** – No ads, no popups, no clutter
- **Editorial authority** – Human approval at every stage
- **Agents are subordinate** – Editors always in control

## Navigation

The public navigation shows exactly: **Home · Articles · About**

No sport-based navigation, categories, or tags in the main nav.

## License

Private – Margin Magazine
