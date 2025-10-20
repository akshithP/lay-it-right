# LayItRight - Project Brain V2

**Last Updated**: 2025-10-19
**Version**: 2.0
**Related Docs**: [PROGRESS_V2.md](./PROGRESS_V2.md) | [DECISIONS_V2.md](./DECISIONS_V2.md) | [BUGS_V2.md](./BUGS_V2.md)

---

## How to Use This File

This is the **single source of truth** for project understanding. Use it to:
- Onboard new team members or AI assistants
- Understand tech stack decisions and architecture
- Find quality standards and runbook commands
- Navigate to specialized docs (progress, decisions, bugs)

**Update Frequency**: After major feature completions or architecture changes.

---

## 📋 Project Overview

**LayItRight** is a web application helping DIY users plan tiling projects with precision. Users input room dimensions, tile specifications, grout width, and layout patterns to calculate exact material requirements and visualize tile layouts.

**Target Users**: DIY homeowners, contractors, interior designers
**Core Value**: Accurate tile quantity calculations + visual previews = reduced waste + cost savings

**Key Features**:
- Precise calculations (area, tile counts, waste %)
- Multi-unit support (mm/cm/m/in/ft)
- Pattern previews (Grid, Brick, Herringbone)
- SVG-based visualization (performance optimized)
- Responsive design (mobile-first approach)
- WCAG 2.1 AA accessibility compliance

---

## 🚀 User Journey

```
HOME PAGE
  ↓
  [Start New Project] → PROJECT WIZARD (4 Steps)
                          ↓
                        STEP 1: Room Dimensions
                          - Unit toggle (metric/imperial)
                          - Length × Width input
                          - Live SVG box preview
                          - Area & perimeter display
                          ↓
                        STEP 2: Tile & Grout
                          - Tile dimensions (L×W)
                          - Grout width (presets + custom)
                          - Live SVG tile cell preview
                          ↓
                        STEP 3: Pattern Selection
                          - Grid (straight lay)
                          - Brick (50% offset)
                          - Herringbone (45°)
                          - SVG pattern thumbnails
                          ↓
                        STEP 4: Results & Preview
                          - Room rect filled via SVG <pattern>
                          - Total tiles (full/cut counts)
                          - Waste % (pattern-specific: 10%/15%/20%)
                          - Option to save project
                          ↓
                        [Save to Local Storage]
  ↓
SAVED PROJECTS (Future Phase)
  - View/edit/delete saved projects
  - Share project links
```

**Current Focus**: Steps 1-4 (numeric-driven wizard)
**Future**: Interactive polygon canvas editor (deferred per ADR-001)

---

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 14** (App Router) - Server components, file-based routing, SEO optimization
- **React 18** + **TypeScript** - Type safety, component reusability
- **Tailwind CSS** - Utility-first styling, responsive design system

**Rationale**: Next.js provides SSR/SSG for SEO, App Router simplifies data fetching, TypeScript catches errors early.

### UI Components & Styling
- **shadcn/ui** (Radix primitives) - Pre-built accessible components
- **Framer Motion** - Performant micro-animations
- **Lucide React** - Consistent icon system

**Rationale**: Radix ensures WCAG compliance out-of-box, Framer Motion supports reduced-motion preferences, Lucide provides lightweight icons.

### State Management & Forms
- **Zustand** (+ Immer) - Lightweight global state (no boilerplate)
- **react-hook-form** + **Zod** - Type-safe form validation
- **convert-units** - Multi-unit conversions (mm/cm/m/in/ft)

**Rationale**: Zustand simpler than Redux, Zod ensures runtime validation matches TypeScript types, convert-units handles edge cases in unit conversion.

### Visualization & Drawing
- **SVG** (native) - Primary visualization (crisp, performant, accessibility-friendly)
- **Konva.js** (react-konva) - Future canvas editor (deferred to Phase 2)

**Rationale**: SVG <pattern> renders 1000s of tiles efficiently without DOM bloat. Konva reserved for interactive polygon editing.

### Testing & Quality
- **Jest** + **Testing Library** - Unit/integration tests
- **Playwright** (optional) - E2E happy path testing
- **ESLint** + **TypeScript** - Static analysis, type checking

**Rationale**: Jest/Testing Library follow best practices, Playwright handles browser automation, TypeScript + ESLint catch bugs pre-runtime.

---

## 🏗️ Architecture

### High-Level Diagram
```
┌────────────────────────────────────────────────────────────┐
│                      Next.js App (SSR)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  app/                   (App Router Pages)           │  │
│  │  ├── page.tsx           (Home)                       │  │
│  │  ├── project/wizard/    (4-step wizard)              │  │
│  │  └── project/[id]/      (Saved project view)         │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  components/            (React Components)           │  │
│  │  ├── ui/                (shadcn/ui base)             │  │
│  │  ├── wizard/            (wizard-specific)            │  │
│  │  ├── forms/             (form components)            │  │
│  │  └── preview/           (SVG tile previews)          │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  stores/                (Zustand State)              │  │
│  │  └── project-store.ts  (wizard state, saved projects)│  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  packages/tiling-engine/ (Pure TS Module)            │  │
│  │  └── src/                                            │  │
│  │      ├── geometry.ts   (area, perimeter, validation) │  │
│  │      ├── tiles.ts      (pattern generation, counts)  │  │
│  │      └── units.ts      (unit conversions)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  lib/                   (Utilities)                  │  │
│  │  ├── utils.ts          (helpers)                     │  │
│  │  └── validations.ts    (Zod schemas)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Core Modules

#### 1. **tiling-engine** (Pure Functions)
**Location**: `packages/tiling-engine/src/`

**Purpose**: Business logic for tile calculations (framework-agnostic, highly testable)

**Files**:
- `geometry.ts` - Area, perimeter, polygon validation
- `tiles.ts` - Tile pattern algorithms, full/cut counts, waste %
- `units.ts` - Unit conversion helpers (mm base unit)

**Key Principles**:
- All functions are **pure** (no side effects)
- Base unit: **millimeters** (mm) - convert at I/O boundaries
- Comprehensive test coverage (>90%)

#### 2. **Web App** (Next.js Frontend)
**Location**: `src/`

**Key Components**:
- **Wizard Pages**: Step-by-step project creation flow
- **SVG Components**: Tile pattern renderers using `<pattern>` element
- **Form Components**: react-hook-form + Zod integration
- **Store**: Zustand for wizard state + local storage persistence

**Routing**:
- `/` - Home page (start project, view saved)
- `/project/wizard` - 4-step wizard flow
- `/project/[id]` - View saved project (future)

---

## ✅ Quality Standards

### Engineering Principles

#### SOLID
- **S**: Single Responsibility - Each component/function has one clear purpose
- **O**: Open/Closed - Extend via composition, not modification
- **L**: Liskov Substitution - Derived components substitutable for base
- **I**: Interface Segregation - No unused props/dependencies
- **D**: Dependency Inversion - Depend on abstractions (store interfaces)

#### DRY, KISS, YAGNI
- **DRY**: Abstract repeated logic to utilities/hooks
- **KISS**: Prefer simple solutions over clever abstractions
- **YAGNI**: Implement current requirements only (no speculative features)

### Accessibility Checklist (WCAG 2.1 AA)

✅ **Semantic HTML**: Use `<section>`, `<nav>`, `<article>`, `<ul>/<li>` over generic `<div>`
✅ **Heading Hierarchy**: Single `<h1>` per page, logical nesting
✅ **ARIA Labels**: All landmarks labeled (`aria-label`, `role` attributes)
✅ **Keyboard Navigation**: Tab order logical, focus indicators visible (3:1 contrast min)
✅ **Screen Readers**: Alt text for images, descriptive button labels
✅ **Color Contrast**: 4.5:1 for text, 3:1 for UI components
✅ **Touch Targets**: 44×44px minimum for interactive elements
✅ **Reduced Motion**: Respect `prefers-reduced-motion` CSS media query

**Tools**: axe DevTools, Lighthouse Accessibility Audit, manual keyboard testing

### Performance Guidelines

**Budgets**:
- Initial load: <2s (mobile 3G)
- Time to Interactive (TTI): <3s
- Lighthouse Performance: >90
- Bundle size: <200KB (main JS)

**Optimization Strategies**:
- SVG `<pattern>` for tile grids (avoid 1000s of DOM nodes)
- Code splitting via Next.js dynamic imports
- Image optimization via Next.js `<Image>` component
- Memoization (`useMemo`, `React.memo`) for expensive calculations
- Debouncing for real-time inputs

**Tools**: Lighthouse, WebPageTest, Chrome DevTools Performance tab

### Code Review Checklist

Before merging PRs, verify:

- [ ] TypeScript types defined (no `any`)
- [ ] Unit tests added/updated (coverage >70%)
- [ ] Accessibility tested (keyboard nav, screen reader)
- [ ] Responsive design verified (mobile/tablet/desktop)
- [ ] Error handling implemented (edge cases covered)
- [ ] JSDoc comments for public APIs
- [ ] ESLint/Prettier passing
- [ ] No console.logs in production code
- [ ] Performance regression check (bundle size)
- [ ] CHANGELOG.md updated (if applicable)

---

## 📖 Runbook

### Installation
```bash
# Clone repository
git clone <repository-url>
cd lay-it-right

# Install dependencies
npm install
```

### Development
```bash
# Start dev server (http://localhost:3000)
npm run dev

# Type checking (watch mode)
npm run type-check -- --watch

# Linting
npm run lint         # Check issues
npm run lint:fix     # Auto-fix
```

### Testing
```bash
# Unit tests
npm test                    # Run once
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# E2E tests (optional - Playwright)
npx playwright test         # Run all E2E
npx playwright test --ui    # Interactive mode
```

### Build & Deploy
```bash
# Production build
npm run build

# Preview production build
npm run start

# Vercel deployment (automatic on push to main)
# Configure via Vercel dashboard
```

### Troubleshooting
- **Port 3000 in use**: `npx kill-port 3000` or change port in `package.json`
- **Type errors**: Run `npm run type-check` to isolate issues
- **Test failures**: Check `jest.setup.js` for global mocks
- **Build errors**: Clear `.next/` cache: `rm -rf .next && npm run build`

---

## 🎬 Demo Script (15-20 min)

**Goal**: Showcase MCP/agent workflow from ticket to deployed feature

### Setup (Pre-Demo)
- Jira ticket created: "Add metric/imperial unit toggle to Step 1"
- Local dev server running (`npm run dev`)
- Browser open to `http://localhost:3000`

### Script

**1. Ticket Analysis (2 min)**
- Show Jira ticket: User story, acceptance criteria, mockups
- AI assistant reads ticket, identifies scope: UI component + state management + unit conversion

**2. Design Phase (3 min)**
- AI uses **Magic MCP** to search 21st.dev for toggle component patterns
- AI generates responsive toggle component with Tailwind + shadcn/ui
- Show HTML/CSS preview in `.superdesign/design_iterations/`

**3. Implementation (8 min)**
- AI uses **Context7 MCP** to fetch Next.js App Router patterns
- AI creates/edits files:
  - `src/components/wizard/unit-toggle.tsx` (component)
  - `src/stores/project-store.ts` (add `unit` state)
  - `src/app/project/wizard/page.tsx` (integrate toggle)
- AI uses **Sequential MCP** for multi-step reasoning (state flow design)
- Show TypeScript type safety catching bugs

**4. Testing (4 min)**
- AI generates Jest tests for unit conversion logic
- AI uses **Playwright MCP** to create E2E test:
  - Navigate to wizard
  - Toggle unit (mm → in)
  - Verify conversion displayed correctly
- Run tests: `npm test && npx playwright test`

**5. Preview & Deploy (3 min)**
- Show live preview in browser (`http://localhost:3000/project/wizard`)
- Commit changes with conventional commit message
- Push to GitHub → Vercel auto-deploys
- Show production URL with feature live

**Key Takeaways**:
- AI leveraged MCP tools for design, docs, testing
- TypeScript caught errors before runtime
- Automated tests ensure no regressions
- End-to-end workflow: ticket → code → tests → deploy

---

## 🔗 Related Documentation

- **[PROGRESS_V2.md](./PROGRESS_V2.md)** - Epics, tickets, milestones, backlog
- **[DECISIONS_V2.md](./DECISIONS_V2.md)** - Architecture Decision Records (ADRs)
- **[BUGS_V2.md](./BUGS_V2.md)** - Known issues, bug triage, severity classification
- **[README.md](../README.md)** - Project overview, setup instructions (external)

---

## 📝 Notes for Maintainers

### Context Management
- This file targets <20k characters (<6k tokens) for efficient AI context loading
- If file grows beyond 25k chars, split into sub-documents (e.g., `ARCHITECTURE.md`, `QUALITY.md`)
- Update "Last Updated" date after significant changes

### When to Update
- **Tech Stack Changes**: New major dependency, framework migration
- **Architecture Shifts**: Folder restructure, new module additions
- **Quality Standard Updates**: New WCAG guidelines, performance budgets
- **Runbook Changes**: New scripts, deployment process changes

### File Size Monitoring
```bash
# Check character count
wc -c docs/CLAUDE_V2.md

# Target: <20,000 characters
# Warning: >20,000 characters (consider splitting)
# Critical: >30,000 characters (must split)
```

---

**End of CLAUDE_V2.md**
