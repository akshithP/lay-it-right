# LayItRight - Progress & Roadmap V2

**Last Updated**: 2025-10-19
**Version**: 2.0
**Related Docs**: [CLAUDE_V2.md](./CLAUDE_V2.md) | [DECISIONS_V2.md](./DECISIONS_V2.md) | [BUGS_V2.md](./BUGS_V2.md)

---

## How to Use This File

Track project progress, epics, feature tickets, and milestones:
- **Epics Table**: High-level feature areas with status/owners
- **Feature Tickets**: Detailed requirements per epic
- **Milestones**: Release targets with dates
- **Done/Next/Risks**: Current progress snapshot
- **Backlog**: Prioritized future work

**Update Frequency**: Weekly or after major feature completions.

---

## 📊 Epics Overview

| ID | Title | Status | Owner | Target Date | Progress |
|----|-------|--------|-------|-------------|----------|
| EP-001 | Numeric Room Dimensions (SVG) | ✅ Complete | Engineer A | 2025-10-15 | 100% |
| EP-002 | Tile & Grout Inputs + SVG Cell | ✅ Complete | Engineer A | 2025-10-16 | 100% |
| EP-003 | Pattern Previews (Grid/Brick/Herringbone) | 🔄 In Progress | Engineer B | 2025-10-25 | 60% |
| EP-004 | Results SVG Pattern Fill + Counts | 📋 Planned | Engineer B | 2025-11-01 | 0% |
| EP-005 | Persistence (Save/Load) + Saved Projects | 📋 Planned | Engineer C | 2025-11-15 | 0% |
| EP-006 | A11y & Performance Pass | 📋 Planned | QA Team | 2025-11-30 | 0% |

**Legend**:
- ✅ **Complete**: All acceptance criteria met, deployed
- 🔄 **In Progress**: Active development, tickets in sprint
- 📋 **Planned**: Scoped, ready for sprint planning
- 🚫 **Blocked**: Dependencies or external factors blocking progress
- ⏸️ **Paused**: Deprioritized, awaiting resources

---

## 🎯 Epic Details & Feature Tickets

### EP-001: Numeric Room Dimensions (SVG)
**Status**: ✅ Complete
**Goal**: Enable users to input room dimensions with multi-unit support and live SVG preview
**Owner**: Engineer A
**Completed**: 2025-10-15

#### Feature Tickets

**FEAT-001.1: Unit Toggle Component**
- **Goal**: Users can switch between metric (mm/cm/m) and imperial (in/ft) units
- **Scope**:
  - shadcn/ui radio group component
  - Persist unit preference in Zustand store
  - Update all dimension displays on toggle
- **Acceptance Criteria**:
  - [x] Toggle between 5 units (mm/cm/m/in/ft)
  - [x] State persists across page reloads (localStorage)
  - [x] All dimension labels update in real-time
  - [x] WCAG AA compliant (keyboard nav, focus indicators)
- **Out of Scope**: Temperature units, custom unit definitions
- **Test Notes**: Unit test conversion edge cases (0, negatives, large numbers)

**FEAT-001.2: Dimension Input Form**
- **Goal**: Users input length and width with validation
- **Scope**:
  - react-hook-form + Zod schema validation
  - Min/max constraints (0.1m - 100m range)
  - Real-time error messages
  - Inline validation (no submit required)
- **Acceptance Criteria**:
  - [x] Form validates on blur and on submit
  - [x] Error messages descriptive (e.g., "Must be >0.1m")
  - [x] Accepts decimal inputs (e.g., 3.75)
  - [x] Handles unit conversion internally (always stores in mm)
- **Out of Scope**: Irregular shapes, diagonal measurements
- **Test Notes**: Test form validation with invalid inputs (negative, zero, huge numbers)

**FEAT-001.3: Live SVG Room Preview**
- **Goal**: Display rectangular room outline with accurate proportions
- **Scope**:
  - SVG `<rect>` with responsive scaling
  - Maintain aspect ratio (max 600px width)
  - Display area and perimeter labels
- **Acceptance Criteria**:
  - [x] SVG scales proportionally (no distortion)
  - [x] Area displayed in current unit (e.g., "12.5 m²")
  - [x] Perimeter displayed (e.g., "14.0 m")
  - [x] Accessible (aria-label on SVG, alt text equivalent)
- **Out of Scope**: 3D perspective, non-rectangular shapes
- **Test Notes**: Test edge cases (very long/narrow rooms, square rooms)

---

### EP-002: Tile & Grout Inputs + SVG Cell
**Status**: ✅ Complete
**Goal**: Users specify tile dimensions and grout width, see live tile cell preview
**Owner**: Engineer A
**Completed**: 2025-10-16

#### Feature Tickets

**FEAT-002.1: Tile Size Input**
- **Goal**: Users input tile length and width
- **Scope**:
  - Two number inputs (length, width) with unit conversion
  - Common tile sizes as presets (300×300mm, 600×600mm, 12×12in)
  - Validation (tiles must fit in room)
- **Acceptance Criteria**:
  - [x] Preset buttons populate inputs
  - [x] Custom tile sizes accepted (10mm - 1000mm range)
  - [x] Validation: tile size ≤ room dimensions
  - [x] Display warning if tile >50% of room size
- **Out of Scope**: Irregular tile shapes, mosaic tiles
- **Test Notes**: Test validation when tile larger than room

**FEAT-002.2: Grout Width Input**
- **Goal**: Users specify grout line width
- **Scope**:
  - Single number input with presets (2mm, 3mm, 5mm, 10mm)
  - Range: 0mm (no grout) - 20mm
  - Affects tile count calculation
- **Acceptance Criteria**:
  - [x] Presets populate input
  - [x] Custom grout width accepted (0-20mm)
  - [x] 0mm treated as "no grout" (affects calculations)
  - [x] Tooltip explains grout width impact
- **Out of Scope**: Grout color, epoxy vs cement grout
- **Test Notes**: Test 0mm grout edge case, large grout widths

**FEAT-002.3: Live SVG Tile Cell Preview**
- **Goal**: Display single tile + grout outline
- **Scope**:
  - SVG `<rect>` for tile with border for grout
  - Proportional scaling (max 200px)
  - Dimension labels on tile
- **Acceptance Criteria**:
  - [x] Tile renders with grout border
  - [x] Dimensions labeled (e.g., "300×300mm + 3mm grout")
  - [x] Updates in real-time as inputs change
  - [x] Accessible (aria-live region announces changes)
- **Out of Scope**: 3D tile rendering, texture patterns
- **Test Notes**: Visual regression tests for various tile sizes

---

### EP-003: Pattern Previews (Grid/Brick/Herringbone)
**Status**: 🔄 In Progress (60%)
**Goal**: Users select tiling pattern and see SVG thumbnail previews
**Owner**: Engineer B
**Target Date**: 2025-10-25

#### Feature Tickets

**FEAT-003.1: Pattern Selection UI** ✅ Complete
- **Goal**: Radio button selection with pattern thumbnails
- **Scope**:
  - Three options: Grid, Brick (50% offset), Herringbone (45°)
  - SVG thumbnails (100×100px) showing pattern visually
  - Pattern description text
- **Acceptance Criteria**:
  - [x] Three radio buttons with SVG thumbnails
  - [x] Accessible (keyboard nav, screen reader labels)
  - [x] Selected pattern highlighted (border + background)
  - [x] Pattern descriptions explain layout (e.g., "Brick: Offset each row by 50%")
- **Out of Scope**: Custom pattern designer, diagonal patterns
- **Test Notes**: Keyboard navigation and screen reader testing

**FEAT-003.2: Grid Pattern Algorithm** 🔄 In Progress
- **Goal**: Calculate tile placement for straight grid layout
- **Scope**:
  - Pure function in `tiling-engine/tiles.ts`
  - Returns array of `{x, y, width, height, isCut}` objects
  - Accounts for grout width between tiles
- **Acceptance Criteria**:
  - [ ] Tiles placed in rows/columns with grout spacing
  - [ ] Cut tiles identified at room edges
  - [ ] Full tile count accurate
  - [ ] Performance: <100ms for 1000+ tiles
- **Out of Scope**: Rotated grids, diagonal layouts
- **Test Notes**: Unit tests for edge rooms, large rooms (1000+ tiles)

**FEAT-003.3: Brick Pattern Algorithm** 📋 Planned
- **Goal**: Calculate tile placement for running bond layout
- **Scope**:
  - 50% offset on alternating rows
  - Half-tile cuts at row starts
  - Waste calculation (typically 15%)
- **Acceptance Criteria**:
  - [ ] Rows offset by 50% of tile width
  - [ ] Half-tiles placed at row starts
  - [ ] Full/cut tile counts accurate
  - [ ] Waste % calculated correctly
- **Out of Scope**: Third-offset, other bond patterns
- **Test Notes**: Verify offset accuracy, waste % calculations

**FEAT-003.4: Herringbone Pattern Algorithm** 📋 Planned
- **Goal**: Calculate tile placement for 45° zigzag layout
- **Scope**:
  - Tiles at 90° alternating angles
  - Triangle cuts at edges
  - Higher waste calculation (typically 20%)
- **Acceptance Criteria**:
  - [ ] Tiles alternate 90° angles
  - [ ] Triangle cuts identified at edges
  - [ ] Waste % reflects complexity
  - [ ] Performance optimized (memoization)
- **Out of Scope**: 30° herringbone, chevron patterns
- **Test Notes**: Complex geometry edge cases, performance benchmarks

---

### EP-004: Results SVG Pattern Fill + Counts
**Status**: 📋 Planned
**Goal**: Display complete room with tiles rendered via SVG `<pattern>`, show accurate counts
**Owner**: Engineer B
**Target Date**: 2025-11-01

#### Feature Tickets

**FEAT-004.1: SVG Pattern Fill Renderer**
- **Goal**: Render full tiled room using SVG `<pattern>` element
- **Scope**:
  - Create SVG `<pattern>` with tile + grout
  - Apply pattern as fill to room rect
  - Clip pattern to room boundaries
- **Acceptance Criteria**:
  - [ ] Pattern tiles entire room rect
  - [ ] Grout lines visible between tiles
  - [ ] No DOM bloat (single `<pattern>` instance)
  - [ ] Zoom/pan supported (future phase prep)
- **Out of Scope**: Interactive tile dragging, individual tile selection
- **Test Notes**: Performance test large rooms (100+ tiles), visual regression tests

**FEAT-004.2: Tile Count Calculation**
- **Goal**: Accurate full/cut tile counts with waste percentage
- **Scope**:
  - Pure function: `calculateTileCounts(room, tile, grout, pattern)`
  - Returns `{full: number, cut: number, total: number, waste: number}`
  - Pattern-specific waste %: Grid 10%, Brick 15%, Herringbone 20%
- **Acceptance Criteria**:
  - [ ] Full tiles counted (completely within room)
  - [ ] Cut tiles counted (partial tiles at edges)
  - [ ] Waste % added to total (pattern-dependent)
  - [ ] Edge cases handled (0 tiles, 1 tile rooms)
- **Out of Scope**: Cost estimation, grout quantity
- **Test Notes**: Unit tests for each pattern, edge cases (tiny/huge rooms)

**FEAT-004.3: Results Display Panel**
- **Goal**: Summary panel with counts, area, waste
- **Scope**:
  - Card displaying:
    - Total tiles needed (full + cut + waste)
    - Full vs cut breakdown
    - Waste percentage
    - Room area
  - Export results as PDF (future phase)
- **Acceptance Criteria**:
  - [ ] All values display in current unit
  - [ ] Responsive layout (mobile-friendly)
  - [ ] Accessible (screen reader announces counts)
  - [ ] Print-friendly styling
- **Out of Scope**: Cost calculator, shopping list generator
- **Test Notes**: Visual regression tests, screen reader testing

---

### EP-005: Persistence (Save/Load) + Saved Projects
**Status**: 📋 Planned
**Goal**: Users can save projects to localStorage and view/edit saved projects
**Owner**: Engineer C
**Target Date**: 2025-11-15

#### Feature Tickets

**FEAT-005.1: Save Project to LocalStorage**
- **Goal**: Persist project data to browser storage
- **Scope**:
  - Save button on results page
  - Zustand state serialized to JSON
  - LocalStorage key: `layitright:projects:${id}`
- **Acceptance Criteria**:
  - [ ] Save button triggers state serialization
  - [ ] Unique project ID generated (UUID)
  - [ ] Saved projects list updated
  - [ ] Confirmation toast displayed
- **Out of Scope**: Cloud sync, database persistence
- **Test Notes**: Test storage limits (5MB quota), multiple projects

**FEAT-005.2: Load Project from LocalStorage**
- **Goal**: Restore saved project state on load
- **Scope**:
  - Hydrate Zustand store from localStorage
  - Handle missing/corrupt data gracefully
  - Migrate old schema versions
- **Acceptance Criteria**:
  - [ ] Saved projects loaded on app init
  - [ ] State hydration restores all fields
  - [ ] Corrupt data shows error, doesn't crash
  - [ ] Schema migration preserves user data
- **Out of Scope**: Import/export JSON files
- **Test Notes**: Test corrupt JSON, old schema versions

**FEAT-005.3: Saved Projects List Page**
- **Goal**: View all saved projects with thumbnails
- **Scope**:
  - Card grid with project previews
  - Actions: View, Edit, Delete, Duplicate
  - Search/filter by date, pattern
- **Acceptance Criteria**:
  - [ ] All saved projects displayed
  - [ ] SVG thumbnails load quickly
  - [ ] Delete confirmation dialog
  - [ ] Responsive grid layout
- **Out of Scope**: Sharing projects, cloud backup
- **Test Notes**: Test many projects (100+), empty state

---

### EP-006: A11y & Performance Pass
**Status**: 📋 Planned
**Goal**: Comprehensive accessibility and performance audit with fixes
**Owner**: QA Team
**Target Date**: 2025-11-30

#### Feature Tickets

**FEAT-006.1: WCAG 2.1 AA Compliance Audit**
- **Goal**: Fix all accessibility violations
- **Scope**:
  - axe DevTools audit
  - Lighthouse Accessibility >95
  - Manual keyboard/screen reader testing
  - Fix issues from BUGS.md (#2, #5, #11, #12, #13, #14)
- **Acceptance Criteria**:
  - [ ] Zero axe violations
  - [ ] Lighthouse Accessibility >95
  - [ ] Keyboard nav works for all flows
  - [ ] Screen reader announces all content
  - [ ] Focus indicators meet 3:1 contrast
- **Out of Scope**: WCAG AAA compliance, braille support
- **Test Notes**: Test with NVDA, JAWS, VoiceOver; keyboard-only testing

**FEAT-006.2: Performance Optimization**
- **Goal**: Meet performance budgets
- **Scope**:
  - Lighthouse Performance >90
  - Bundle size <200KB
  - Time to Interactive (TTI) <3s
  - Fix critical issues from BUGS.md (#1, #3, #4, #6)
- **Acceptance Criteria**:
  - [ ] Lighthouse Performance >90
  - [ ] Main bundle <200KB gzipped
  - [ ] TTI <3s on mobile 3G
  - [ ] No layout shifts (CLS <0.1)
- **Out of Scope**: Server-side caching, CDN optimization
- **Test Notes**: Test on real mobile devices, throttled network

**FEAT-006.3: Responsive Design Fixes**
- **Goal**: Perfect responsive experience across viewports
- **Scope**:
  - Fix mobile issues from BUGS.md (#1, #3, #4, #6, #10)
  - Test breakpoints: 375px, 768px, 1024px, 1920px, 2560px
  - Touch target optimization (44×44px min)
- **Acceptance Criteria**:
  - [ ] No horizontal scroll on any viewport
  - [ ] Touch targets ≥44×44px
  - [ ] Font sizes scale responsively
  - [ ] Padding/margins scale appropriately
- **Out of Scope**: Foldable phone support, ultra-wide monitors
- **Test Notes**: Test on real devices, BrowserStack cross-browser

---

## 📅 Milestones

### M1: MVP Launch (2025-11-01)
**Goal**: Core wizard flow complete and deployed
**Included Epics**: EP-001, EP-002, EP-003, EP-004
**Success Criteria**:
- Users can complete full wizard flow
- Tile counts accurate for all patterns
- SVG previews render correctly
- No critical bugs (severity S1/S2)

### M2: Persistence & Polish (2025-11-30)
**Goal**: Save/load functionality and quality improvements
**Included Epics**: EP-005, EP-006
**Success Criteria**:
- Users can save/load projects
- WCAG 2.1 AA compliant
- Lighthouse scores >90 across all categories
- All high-priority bugs fixed

### M3: Advanced Features (Q1 2026)
**Goal**: Interactive canvas editor, cost estimation, sharing
**Included Epics**: EP-007 (Canvas), EP-008 (Costing), EP-009 (Sharing)
**Success Criteria**:
- Users can draw custom polygon layouts
- Cost estimates include tile + grout + labor
- Projects shareable via link

---

## ✅ Done

**2025-10-19**:
- ✅ Created V2 documentation structure
- ✅ Defined 6 core epics with feature tickets
- ✅ Established milestones and success criteria

**2025-10-16**:
- ✅ EP-002 completed: Tile & Grout inputs with SVG cell preview
- ✅ Unit conversion system tested and deployed
- ✅ BUGS.md created with 21 documented issues

**2025-10-15**:
- ✅ EP-001 completed: Numeric Room Dimensions with SVG preview
- ✅ Unit toggle component (mm/cm/m/in/ft)
- ✅ Dimension input form with validation

**2025-09-25**:
- ✅ Project initialized with Next.js 14 + TypeScript
- ✅ Tailwind CSS + shadcn/ui configured
- ✅ Testing infrastructure setup (Jest + Testing Library)

---

## 🚀 Next (Sprint Priority)

**This Week** (2025-10-20 - 2025-10-26):
1. Complete EP-003: Pattern algorithms (Brick, Herringbone)
2. Start EP-004: SVG pattern fill renderer
3. Fix critical bug #1 (mobile button height)

**Next Week** (2025-10-27 - 2025-11-02):
1. Complete EP-004: Results display with counts
2. E2E testing for full wizard flow
3. Fix high-priority bugs (#2-#6)

---

## ⚠️ Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| SVG pattern performance degradation with 1000+ tiles | High | Medium | Implement viewport culling, memoization, debouncing |
| Browser localStorage quota (5MB) limits saved projects | Medium | Low | Implement compression, warn at 80% quota, offer export |
| Herringbone algorithm complexity delays EP-003 | Medium | High | Allocate extra sprint, consider simplifying to 90° only |
| WCAG compliance audit reveals major refactoring needs | High | Medium | Start a11y testing early, fix incrementally |
| Mobile responsive bugs require CSS rewrite | Medium | Low | Test on real devices weekly, use BrowserStack |

---

## 📋 Backlog (Prioritized)

### High Priority
1. **FEAT-007.1**: Interactive polygon canvas editor (Konva.js)
2. **FEAT-008.1**: Cost estimation calculator (tile + grout prices)
3. **FEAT-009.1**: Share project via URL (shareable links)

### Medium Priority
4. **FEAT-010.1**: L-shaped room support (predefined template)
5. **FEAT-011.1**: Tile pattern variations (third-offset brick, chevron)
6. **FEAT-012.1**: Print-friendly layout (PDF export)

### Low Priority
7. **FEAT-013.1**: Material supplier integration (Home Depot API)
8. **FEAT-014.1**: 3D room visualization (Three.js)
9. **FEAT-015.1**: Multi-room projects (home-wide planning)

---

## 📈 Velocity Tracking

| Sprint | Planned Points | Completed Points | Velocity |
|--------|----------------|------------------|----------|
| Sprint 1 (Oct 1-15) | 13 | 13 | 100% |
| Sprint 2 (Oct 16-31) | 21 | 12 | 57% (in progress) |
| Sprint 3 (Nov 1-15) | 18 | - | - |

**Notes**:
- Sprint 2 velocity lower due to bug fixes (#1-#6) taking priority
- Adjust Sprint 3 to 15 points to account for testing overhead

---

## 🔗 Related Documentation

- **[CLAUDE_V2.md](./CLAUDE_V2.md)** - Tech stack, architecture, quality standards
- **[DECISIONS_V2.md](./DECISIONS_V2.md)** - ADRs for key technical decisions
- **[BUGS_V2.md](./BUGS_V2.md)** - Known issues and bug triage

---

**End of PROGRESS_V2.md**
