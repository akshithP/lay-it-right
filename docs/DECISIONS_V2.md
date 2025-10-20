# LayItRight - Architecture Decision Records V2

**Last Updated**: 2025-10-19
**Version**: 2.0
**Related Docs**: [CLAUDE_V2.md](./CLAUDE_V2.md) | [PROGRESS_V2.md](./PROGRESS_V2.md) | [BUGS_V2.md](./BUGS_V2.md)

---

## How to Use This File

Architecture Decision Records (ADRs) document significant technical choices:
- **Context**: Why we needed to make a decision
- **Decision**: What we chose
- **Alternatives**: Other options considered (with pros/cons)
- **Consequences**: Impact of the decision
- **Follow-ups**: Migration steps or future revisits

**Format**: ADRs are immutable once accepted. Superseded ADRs link to replacements.

---

## ADR Index

| ID | Title | Status | Date | Category |
|----|-------|--------|------|----------|
| [ADR-001](#adr-001-numeric-svg-flow-now-interactive-canvas-deferred) | Numeric SVG flow now; interactive canvas deferred | ✅ Accepted | 2025-09-25 | Architecture |
| [ADR-002](#adr-002-svg-pattern-for-performance-vs-individual-tiles) | SVG `<pattern>` for performance vs individual tiles | ✅ Accepted | 2025-09-26 | Performance |
| [ADR-003](#adr-003-base-unit-millimeters-mm-convert-at-io) | Base unit millimeters (mm), convert at I/O | ✅ Accepted | 2025-09-27 | Data Model |
| [ADR-004](#adr-004-nextjs-tailwind-shadcnui-selection) | Next.js + Tailwind + shadcn/ui selection | ✅ Accepted | 2025-09-20 | Tech Stack |
| [ADR-005](#adr-005-shared-tiling-engine-pure-ts-module) | Shared "tiling-engine" pure TS module | ✅ Accepted | 2025-09-28 | Architecture |
| [ADR-006](#adr-006-testing-stack-jestvitest-testing-library-playwright) | Testing stack (Jest/Vitest + Testing Library; Playwright optional) | ✅ Accepted | 2025-09-29 | Quality |
| [ADR-007](#adr-007-localstorage-persistence-v1-future-serverdb-optional) | LocalStorage persistence v1; future server/DB optional | ✅ Accepted | 2025-10-01 | Architecture |
| [ADR-008](#adr-008-accessibility-and-performance-budgets) | Accessibility and performance budgets | ✅ Accepted | 2025-10-02 | Quality |

---

## ADR-001: Numeric SVG Flow Now; Interactive Canvas Deferred

**Date**: 2025-09-25
**Status**: ✅ Accepted
**Category**: Architecture
**Related**: [EP-001](./PROGRESS_V2.md#ep-001-numeric-room-dimensions-svg), [FEAT-001.3](./PROGRESS_V2.md#feat-0013-live-svg-room-preview)

### Context

Original project vision included an interactive polygon canvas editor (using Konva.js) where users could:
- Draw custom room shapes by tapping points
- Drag vertices to adjust dimensions
- Edit edge lengths via inline popovers
- See tiles rendered directly within the polygon

However, this requires:
- Complex geometry validation (self-intersection, concave polygons)
- Canvas state management (vertices, drawing mode, undo/redo)
- Responsive coordinate transformation (mm ↔ pixels)
- Significant development time (~3-4 sprints)

### Decision

**Defer interactive canvas editor to Phase 2.** Start with **numeric-driven wizard** using:
- Input fields for length/width (rectangular rooms only)
- SVG `<rect>` preview with proportional scaling
- Simple, fast implementation (~1 sprint)

Canvas editor becomes **EP-007** (Q1 2026 roadmap).

### Alternatives Considered

#### Option A: Canvas-first approach (NOT chosen)
**Pros**:
- Aligns with original vision
- Supports L-shaped, irregular rooms immediately
- Differentiator vs competitors

**Cons**:
- High complexity, delays MVP launch by 2-3 months
- Many edge cases (self-intersection, tiny angles, huge polygons)
- Mobile UX challenging (touch precision, small screens)
- Risk of scope creep

#### Option B: Hybrid (inputs + static SVG preview) (CHOSEN)
**Pros**:
- Fast to implement (1 sprint vs 4)
- Covers 80% of DIY use cases (rectangular rooms)
- Validates core business logic (calculations, patterns)
- Low risk, proven UX pattern

**Cons**:
- Doesn't support irregular rooms in MVP
- Less "wow factor" for early adopters

#### Option C: Third-party room planner API
**Pros**:
- Offload complexity to vendor
- Enterprise-grade features immediately

**Cons**:
- Costly ($500+/month)
- Vendor lock-in
- Privacy concerns (user data sent to third party)

### Consequences

**Positive**:
- ✅ MVP launch accelerated by 2 months
- ✅ Focus on core calculations and pattern algorithms
- ✅ Simpler codebase, easier to test
- ✅ Lower bug risk

**Negative**:
- ❌ Irregular rooms not supported in MVP
- ❌ Competitive disadvantage vs full-featured tools
- ❌ May confuse users expecting canvas (manage expectations in marketing)

**Neutral**:
- Canvas editor remains in backlog (prioritize based on user feedback)
- Rectangular rooms cover majority of DIY projects

### Follow-ups

1. **User Research** (before Phase 2): Survey users on need for irregular shapes (L-shaped, T-shaped)
2. **Canvas Spike** (Q4 2025): 1-week technical spike to validate Konva.js approach
3. **Migration Plan**: Ensure tiling-engine functions work for polygons, not just rectangles

---

## ADR-002: SVG `<pattern>` for Performance vs Individual Tiles

**Date**: 2025-09-26
**Status**: ✅ Accepted
**Category**: Performance
**Related**: [FEAT-004.1](./PROGRESS_V2.md#feat-0041-svg-pattern-fill-renderer)

### Context

Rendering 1000+ tiles in a large room (e.g., 10m × 10m with 300×300mm tiles = ~1100 tiles) requires efficient visualization. Two main approaches:

1. **Individual SVG `<rect>` elements**: Create DOM node per tile
2. **SVG `<pattern>` element**: Single pattern definition, applied as fill

### Decision

Use **SVG `<pattern>` element** as primary tile visualization method.

**Implementation**:
```xml
<svg>
  <defs>
    <pattern id="tile-pattern" width="303" height="303" patternUnits="userSpaceOnUse">
      <rect width="300" height="300" fill="#ccc" stroke="#333" stroke-width="3"/>
    </pattern>
  </defs>
  <rect width="10000" height="10000" fill="url(#tile-pattern)" />
</svg>
```

### Alternatives Considered

#### Option A: Individual `<rect>` per tile (NOT chosen)
**Pros**:
- Easy to implement (straightforward mapping)
- Individual tile interactivity (click, hover)
- Granular control (different colors, states)

**Cons**:
- ❌ DOM bloat: 1000+ nodes = slow rendering (>1s on mobile)
- ❌ Memory usage: ~100KB per 1000 tiles
- ❌ Poor performance on scroll/zoom

#### Option B: HTML `<canvas>` with 2D context (NOT chosen)
**Pros**:
- High performance for large tile counts
- Pixel-perfect rendering

**Cons**:
- ❌ Not accessible (screen readers can't parse canvas)
- ❌ No SVG benefits (scaling, CSS styling, print-friendly)
- ❌ More complex codebase (canvas API vs declarative SVG)

#### Option C: SVG `<pattern>` (CHOSEN)
**Pros**:
- ✅ Excellent performance: single DOM node regardless of tile count
- ✅ Accessible: SVG supports ARIA labels, roles
- ✅ Print-friendly: scales perfectly at any resolution
- ✅ CSS styleable: grout color, tile borders

**Cons**:
- Tiles not individually interactive (can't click single tile)
- Pattern edges may not align perfectly at room boundaries (need clipping)

### Consequences

**Positive**:
- ✅ 60fps rendering even with 5000+ tiles
- ✅ Lighthouse Performance >90
- ✅ Works on low-end mobile devices
- ✅ Accessible and print-friendly

**Negative**:
- ❌ Individual tile selection deferred to Phase 2 (requires canvas overlay)
- ❌ Pattern edges need careful clipping at room boundaries

**Neutral**:
- Pattern-based approach aligns with SVG best practices
- Future interactive features (tile selection) will overlay canvas on SVG

### Follow-ups

1. **Edge Clipping**: Implement SVG `<clipPath>` for room boundaries (FEAT-004.1)
2. **Performance Testing**: Benchmark rooms with 10,000+ tiles (stress test)
3. **Interactivity**: If users request tile selection, add Konva.js layer on top of SVG pattern

---

## ADR-003: Base Unit Millimeters (mm), Convert at I/O

**Date**: 2025-09-27
**Status**: ✅ Accepted
**Category**: Data Model
**Related**: [tiling-engine/units.ts](../packages/tiling-engine/src/units.ts)

### Context

App supports 5 units: mm, cm, m, in, ft. Need consistent internal representation to:
- Avoid floating-point errors (e.g., 0.1m + 0.2m ≠ 0.3m)
- Simplify calculations (no unit tracking in every function)
- Ensure accuracy across unit conversions

### Decision

**Store all dimensions internally in millimeters (mm).** Convert to/from user's selected unit only at I/O boundaries (form inputs, display labels).

**Rationale**:
- Millimeters provide integer precision for most use cases (300mm tile, 3mm grout)
- Avoid floating-point rounding errors in calculations
- Single source of truth for state (no mixed units)

### Alternatives Considered

#### Option A: Store in user's selected unit (NOT chosen)
**Pros**:
- Simpler mental model (display matches storage)
- No conversion overhead

**Cons**:
- ❌ State must track unit alongside every dimension
- ❌ Calculations require unit-aware logic
- ❌ Floating-point errors when user switches units

#### Option B: Store in base SI unit (meters) (NOT chosen)
**Pros**:
- Aligns with SI standards
- Meters common in engineering

**Cons**:
- ❌ Floating-point values (0.3m) less precise than integers (300mm)
- ❌ Rounding errors in tile calculations (e.g., 0.3m ÷ 0.003m grout)

#### Option C: Store in millimeters (CHOSEN)
**Pros**:
- ✅ Integer precision (300mm, 3mm, 10000mm)
- ✅ No floating-point errors
- ✅ Simple calculations (area = length × width in mm²)
- ✅ Easy conversion to display units via `convert-units` library

**Cons**:
- Large numbers for big rooms (10m = 10000mm)
- Conversion overhead at I/O (mitigated by memoization)

### Consequences

**Positive**:
- ✅ Accurate calculations (no floating-point drift)
- ✅ Simplified state management (single unit)
- ✅ Type safety (`type Millimeters = number` branded type)

**Negative**:
- Conversion function calls at form boundaries
- Developer must remember to convert on display

**Neutral**:
- Conversion library (`convert-units`) handles edge cases
- Branded type `Millimeters` prevents accidental mixing

### Implementation

```typescript
// Type safety
type Millimeters = number & { readonly __brand: 'mm' }

// Conversion helpers
function toMillimeters(value: number, unit: Unit): Millimeters {
  return convert(value).from(unit).to('mm') as Millimeters
}

function fromMillimeters(mm: Millimeters, unit: Unit): number {
  return convert(mm).from('mm').to(unit)
}

// State always in mm
interface RoomState {
  length: Millimeters  // e.g., 5000mm (5m)
  width: Millimeters   // e.g., 4000mm (4m)
}

// Convert on display
function RoomDimensionInput() {
  const lengthMm = useStore(state => state.length)
  const unit = useStore(state => state.unit)

  const displayValue = fromMillimeters(lengthMm, unit)  // 5000mm → 5m
  // ...
}
```

### Follow-ups

1. **Type Enforcement**: Use TypeScript branded types to prevent accidental mixing
2. **Testing**: Unit tests for conversion edge cases (0, negative, huge numbers)
3. **Performance**: Memoize conversion functions to avoid repeated calculations

---

## ADR-004: Next.js + Tailwind + shadcn/ui Selection

**Date**: 2025-09-20
**Status**: ✅ Accepted
**Category**: Tech Stack
**Related**: [package.json](../package.json), [CLAUDE_V2.md](./CLAUDE_V2.md#tech-stack)

### Context

Need to select frontend framework, styling approach, and component library for rapid MVP development while maintaining:
- SEO optimization (organic traffic for DIY users)
- Accessibility compliance (WCAG 2.1 AA)
- Performance (mobile-first users on slow networks)
- Developer productivity (small team, tight timeline)

### Decision

**Tech Stack**:
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3.4
- **Components**: shadcn/ui (Radix UI primitives)

### Alternatives Considered

#### Option A: Create React App + Material-UI (NOT chosen)
**Pros**:
- Familiar to team (prior experience)
- Material-UI mature, well-documented

**Cons**:
- ❌ No built-in SSR (poor SEO)
- ❌ Material-UI heavy (100KB+ bundle)
- ❌ Opinionated design (hard to customize)

#### Option B: Next.js + Chakra UI (NOT chosen)
**Pros**:
- Next.js provides SSR/SSG
- Chakra UI accessible by default

**Cons**:
- ❌ Chakra UI runtime CSS-in-JS (performance cost)
- ❌ Less control over styling (theme abstraction)

#### Option C: Next.js + Tailwind + shadcn/ui (CHOSEN)
**Pros**:
- ✅ Next.js App Router: Server components, streaming, SEO
- ✅ Tailwind: Utility-first, zero runtime, tree-shakeable
- ✅ shadcn/ui: Copy-paste components (no dependency bloat), Radix primitives (accessibility)
- ✅ Full customization control (no theme lock-in)

**Cons**:
- Learning curve for team new to Tailwind
- shadcn/ui requires manual component updates

### Consequences

**Positive**:
- ✅ SEO optimized: SSR/SSG via Next.js
- ✅ Fast builds: Tailwind JIT compilation
- ✅ Small bundle: No runtime CSS, tree-shaken utilities
- ✅ Accessible: Radix primitives WCAG-compliant out-of-box
- ✅ Full control: Copy-paste components, customize freely

**Negative**:
- Team must learn Tailwind utility classes
- Manual updates for shadcn/ui components (not NPM package)

**Neutral**:
- Next.js App Router requires rethinking data fetching patterns
- Tailwind config customization needed for brand colors

### Implementation Notes

**Next.js Configuration**:
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['unsplash.com'],  // SVG placeholders
  },
}
```

**Tailwind Configuration**:
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F3C623',   // LayItRight yellow
        secondary: '#EB8317', // Orange accent
        royal: '#10375C',     // Royal blue
      },
    },
  },
}
```

### Follow-ups

1. **Team Training**: 1-week Tailwind workshop, shadcn/ui best practices
2. **Performance Monitoring**: Lighthouse CI in GitHub Actions
3. **Component Library**: Document custom shadcn/ui components in Storybook (future)

---

## ADR-005: Shared "tiling-engine" Pure TS Module

**Date**: 2025-09-28
**Status**: ✅ Accepted
**Category**: Architecture
**Related**: [packages/tiling-engine](../packages/tiling-engine/)

### Context

Tile calculation logic (area, perimeter, pattern algorithms, tile counts) is:
- Framework-agnostic (pure math, no React dependencies)
- Highly testable (deterministic inputs/outputs)
- Reusable (could power mobile app, API service in future)

Need to decide: embed in Next.js app or extract to shared module?

### Decision

Extract business logic to **`packages/tiling-engine`** as standalone TypeScript module.

**Structure**:
```
packages/tiling-engine/
  src/
    geometry.ts      # Pure functions (area, perimeter, validation)
    tiles.ts         # Pattern algorithms, tile counts
    units.ts         # Unit conversion helpers
    index.ts         # Public API exports
  __tests__/
    geometry.test.ts # Jest unit tests
    tiles.test.ts
  package.json       # Independent package
  tsconfig.json
```

### Alternatives Considered

#### Option A: Embed in Next.js `src/utils/` (NOT chosen)
**Pros**:
- Simple: no monorepo tooling
- Fewer files to maintain

**Cons**:
- ❌ Couples business logic to Next.js
- ❌ Hard to reuse (mobile app, API would duplicate code)
- ❌ Mixes framework code with pure logic

#### Option B: Separate NPM package (NOT chosen)
**Pros**:
- Fully independent, publishable to NPM
- Versioned releases

**Cons**:
- ❌ Overhead: publish workflow, versioning, registry
- ❌ Overkill for single app (no external consumers yet)

#### Option C: Monorepo package (CHOSEN)
**Pros**:
- ✅ Clear separation of concerns (logic vs UI)
- ✅ Easy to test in isolation (no Next.js dependencies)
- ✅ Reusable by mobile app, API (future)
- ✅ Lightweight: single repo, no publish overhead

**Cons**:
- Slight monorepo complexity (minimal with Next.js workspace support)

### Consequences

**Positive**:
- ✅ Business logic testable without UI framework
- ✅ Future-proof: mobile app can import same calculations
- ✅ Enforces pure functions (no React hooks, no side effects)
- ✅ Faster tests (no Next.js booting required)

**Negative**:
- Extra folder/config boilerplate
- Must configure TypeScript path aliases

**Neutral**:
- Next.js workspace feature simplifies monorepo setup
- Pattern aligns with industry best practices (e.g., Vercel's Turbo)

### Implementation

**TypeScript Path Alias**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@tiling-engine/*": ["./packages/tiling-engine/src/*"]
    }
  }
}
```

**Usage in Next.js**:
```typescript
import { calculateArea, generateGridPattern } from '@tiling-engine/geometry'

function RoomPreview({ length, width }: RoomProps) {
  const area = calculateArea(length, width)
  // ...
}
```

### Follow-ups

1. **API Versioning**: If publishing to NPM, use semantic versioning
2. **Mobile App**: When mobile app starts, reuse `tiling-engine` package
3. **CI Pipeline**: Run tiling-engine tests independently of Next.js

---

## ADR-006: Testing Stack (Jest/Vitest + Testing Library; Playwright Optional)

**Date**: 2025-09-29
**Status**: ✅ Accepted
**Category**: Quality
**Related**: [jest.config.js](../jest.config.js), [package.json](../package.json)

### Context

Need comprehensive testing strategy covering:
- **Unit Tests**: Pure functions (tiling-engine), utilities
- **Integration Tests**: React components, forms, state
- **E2E Tests**: Full wizard flow (optional for MVP)

### Decision

**Testing Stack**:
- **Unit/Integration**: **Jest** + **React Testing Library**
- **E2E (Optional)**: **Playwright** (1 happy path test only)

**Rationale**:
- Jest standard for React projects (team familiarity)
- Testing Library enforces accessibility best practices
- Playwright for critical E2E coverage (not full suite)

### Alternatives Considered

#### Option A: Vitest + Testing Library (NOT chosen)
**Pros**:
- Vitest faster than Jest (Vite-based)
- Modern ESM support

**Cons**:
- ❌ Team unfamiliar with Vitest
- ❌ Less mature ecosystem (fewer plugins)

#### Option B: Jest + Enzyme (NOT chosen)
**Pros**:
- Enzyme provides shallow rendering

**Cons**:
- ❌ Enzyme deprecated (not maintained)
- ❌ Encourages implementation testing (not user behavior)

#### Option C: Jest + Testing Library (CHOSEN)
**Pros**:
- ✅ Industry standard (React docs recommend)
- ✅ Testing Library enforces accessible queries
- ✅ Team experienced with Jest

**Cons**:
- Jest slower than Vitest (acceptable for MVP)

#### E2E: Playwright vs Cypress

**Playwright** (CHOSEN):
- ✅ Multi-browser (Chromium, Firefox, WebKit)
- ✅ Faster, headless by default
- ✅ Better developer experience (auto-wait, screenshots)

**Cypress** (NOT chosen):
- ❌ Chromium-only by default
- ❌ Slower (real browser instance)

### Consequences

**Positive**:
- ✅ Comprehensive coverage (unit, integration, E2E)
- ✅ Accessibility enforced via Testing Library queries
- ✅ Fast feedback loop (Jest watch mode)

**Negative**:
- Jest slower than Vitest (10-20% slower)
- Playwright adds dependency (skip if timeline tight)

**Neutral**:
- Standard tooling aligns with Next.js community

### Test Coverage Targets

| Layer | Coverage | Tools |
|-------|----------|-------|
| Unit (tiling-engine) | >90% | Jest |
| Integration (components) | >80% | Jest + Testing Library |
| E2E (happy path) | 1 test | Playwright (optional) |

### Implementation

**Jest Configuration**:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@tiling-engine/(.*)$': '<rootDir>/packages/tiling-engine/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'packages/**/*.{js,ts}',
    '!**/*.d.ts',
  ],
}
```

**Playwright E2E Test** (optional):
```typescript
// e2e/wizard-flow.spec.ts
test('complete wizard flow', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.click('text=Start New Project')

  // Step 1: Dimensions
  await page.fill('[name="length"]', '5')
  await page.fill('[name="width"]', '4')
  await page.click('text=Next')

  // Step 2: Tile & Grout
  await page.fill('[name="tileLength"]', '300')
  await page.fill('[name="tileWidth"]', '300')
  await page.fill('[name="groutWidth"]', '3')
  await page.click('text=Next')

  // Step 3: Pattern
  await page.click('text=Grid')
  await page.click('text=Next')

  // Step 4: Results
  await expect(page.locator('text=Total Tiles')).toBeVisible()
})
```

### Follow-ups

1. **CI Integration**: Run Jest in GitHub Actions on every PR
2. **Coverage Enforcement**: Fail PRs if coverage drops below 70%
3. **E2E Decision**: Add Playwright if team has bandwidth (nice-to-have)

---

## ADR-007: LocalStorage Persistence v1; Future Server/DB Optional

**Date**: 2025-10-01
**Status**: ✅ Accepted
**Category**: Architecture
**Related**: [EP-005](./PROGRESS_V2.md#ep-005-persistence-saveload--saved-projects)

### Context

Users need to save projects for future reference. Options:
- **LocalStorage**: Browser-based, no backend
- **Database + API**: Server-side persistence

MVP timeline constrains server infrastructure development.

### Decision

**Phase 1 (MVP)**: Use **LocalStorage** for project persistence.

**Phase 2 (Future)**: Optionally add server-side persistence (database + API).

### Alternatives Considered

#### Option A: Database + API from start (NOT chosen)
**Pros**:
- Unlimited storage (not 5MB quota)
- Cross-device sync
- Backup/recovery

**Cons**:
- ❌ Requires backend development (2-3 weeks)
- ❌ Hosting costs ($20-50/month)
- ❌ Privacy concerns (user data on server)
- ❌ Delays MVP launch

#### Option B: LocalStorage only (CHOSEN for MVP)
**Pros**:
- ✅ No backend required (ships faster)
- ✅ Zero hosting costs
- ✅ Privacy-friendly (data stays on device)
- ✅ Simple implementation (Zustand persist middleware)

**Cons**:
- 5MB storage quota (limits to ~50-100 projects)
- No cross-device sync
- Data lost if user clears browser cache

#### Option C: IndexedDB (NOT chosen)
**Pros**:
- Larger quota (50MB+)
- Structured queries

**Cons**:
- More complex API than LocalStorage
- Overkill for simple JSON storage

### Consequences

**Positive**:
- ✅ MVP ships 2-3 weeks faster
- ✅ Zero infrastructure costs
- ✅ User privacy preserved (no server)

**Negative**:
- ❌ 5MB quota limits power users
- ❌ No cross-device sync
- ❌ Data not backed up (user responsibility)

**Neutral**:
- LocalStorage sufficient for 90% of users (casual DIYers)
- Future migration path to server DB if user demand

### Implementation

**Zustand Persist Middleware**:
```typescript
import { persist } from 'zustand/middleware'

const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      saveProject: (project) => set(state => ({
        projects: [...state.projects, project]
      })),
      // ...
    }),
    {
      name: 'layitright-projects',  // LocalStorage key
      version: 1,                   // Schema versioning
    }
  )
)
```

**Storage Quota Monitoring**:
```typescript
function checkStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(({ usage, quota }) => {
      const percentUsed = (usage / quota) * 100
      if (percentUsed > 80) {
        // Warn user: "Storage 80% full. Consider exporting projects."
      }
    })
  }
}
```

### Follow-ups

1. **Schema Migration**: Implement version migration for future schema changes
2. **Export/Import**: Add JSON export/import for user backups (Phase 1.5)
3. **Server Persistence**: Evaluate Supabase/Firebase for Phase 2 if user demand high
4. **Quota Warnings**: Alert users at 80% storage usage

---

## ADR-008: Accessibility and Performance Budgets

**Date**: 2025-10-02
**Status**: ✅ Accepted
**Category**: Quality
**Related**: [EP-006](./PROGRESS_V2.md#ep-006-a11y--performance-pass)

### Context

Quality standards must be measurable and enforced. Without explicit budgets:
- Accessibility regressions go unnoticed
- Performance degrades over time
- No objective PR review criteria

### Decision

Establish **measurable budgets** for accessibility and performance, enforced via CI.

### Accessibility Budget (WCAG 2.1 AA)

**Mandatory**:
- **Zero axe violations** (critical/serious)
- **Lighthouse Accessibility ≥95**
- **Keyboard navigation**: 100% of flows accessible
- **Screen reader compatibility**: NVDA, JAWS, VoiceOver
- **Color contrast**: 4.5:1 (text), 3:1 (UI components)
- **Touch targets**: ≥44×44px (mobile)
- **Reduced motion**: Respect `prefers-reduced-motion`

**Tools**:
- `@axe-core/react` (dev mode checks)
- Lighthouse CI (GitHub Actions)
- Manual testing (keyboard, screen reader)

### Performance Budget

**Metrics**:
| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Lighthouse Performance | ≥90 | <80 (fail PR) |
| First Contentful Paint (FCP) | <1.5s | >2.5s |
| Time to Interactive (TTI) | <3s | >5s |
| Cumulative Layout Shift (CLS) | <0.1 | >0.25 |
| Total Blocking Time (TBT) | <200ms | >600ms |
| Main bundle size | <200KB | >300KB |

**Test Conditions**: Mobile (3G throttled), Lighthouse mobile emulation

### Alternatives Considered

#### Option A: No formal budgets (NOT chosen)
**Pros**:
- Flexible, no constraints

**Cons**:
- ❌ Quality degrades unnoticed
- ❌ No objective review criteria

#### Option B: Strict budgets with CI enforcement (CHOSEN)
**Pros**:
- ✅ Quality regressions blocked at PR level
- ✅ Objective metrics for team
- ✅ Forces performance consciousness

**Cons**:
- Requires initial setup (Lighthouse CI)
- May slow down feature velocity initially

### Consequences

**Positive**:
- ✅ Quality maintained at high standard
- ✅ Users with disabilities can use app
- ✅ Fast load times on mobile networks
- ✅ Better SEO (Core Web Vitals)

**Negative**:
- Team must fix violations before merge (may delay PRs)
- Requires discipline to maintain budgets

**Neutral**:
- Industry-standard practice (Google, Vercel enforce similar)

### Implementation

**Lighthouse CI Configuration**:
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install && npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/project/wizard
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

**Budget File**:
```json
// lighthouse-budget.json
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "script", "budget": 200 },
      { "resourceType": "total", "budget": 500 }
    ],
    "resourceCounts": [
      { "resourceType": "third-party", "budget": 5 }
    ]
  }
]
```

**Axe DevTools Integration**:
```typescript
// src/app/layout.tsx
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000)
  })
}
```

### Follow-ups

1. **Training**: Team workshop on WCAG guidelines, performance best practices
2. **CI Enforcement**: Block PRs if budgets fail (phase in over 2 sprints)
3. **Monitoring**: Add Lighthouse scores to project dashboard (weekly tracking)

---

## 🔗 Related Documentation

- **[CLAUDE_V2.md](./CLAUDE_V2.md)** - Tech stack, architecture, quality standards
- **[PROGRESS_V2.md](./PROGRESS_V2.md)** - Epics, feature tickets, implementation timeline
- **[BUGS_V2.md](./BUGS_V2.md)** - Known issues, bug triage

---

**End of DECISIONS_V2.md**
