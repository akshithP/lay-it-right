# /build-feature - Full Feature Development Workflow

**Purpose**: Automate the complete lifecycle of building a frontend feature from idea to deployment, with integrated design, implementation, testing, and documentation updates.

**Syntax**: `/build-feature "<feature description>"`

**Example**: `/build-feature Add dark mode toggle to settings page`

---

## � Context Check

Before starting, I will:

1. Check current context usage (target: <150k tokens available)
2. Warn if context >150k tokens and suggest `/compact` or `/context`
3. Load required documentation: `CLAUDE_V2.md`, `PROGRESS_V2.md`, `DECISIONS_V2.md`, `BUGS_V2.md`

**Context Budget**: This workflow requires ~40-60k tokens. If current usage >140k, I will halt and ask you to run `/compact` first.

---

## <� Workflow Overview

```
User Input
    �
[STEP 1] Requirements Analysis � Feature Ticket
    �
[STEP 2] UI/UX Design � Layout + Theme Approval
    �
[STEP 3] Technical Planning � Subtasks + Implementation
    �
[STEP 4] Code Review & QA � Accessibility + Tests
    �
[STEP 5] Documentation Updates � PROGRESS/DECISIONS/BUGS
    �
[STEP 6] Summary & Next Steps
```

**Total Estimated Time**: 15-30 minutes (depending on feature complexity)

---

## =� Step-by-Step Workflow

### STEP 1: Requirements Analysis � Feature Ticket

**Agent**: `requirements-analyst`

**Goal**: Transform user input into structured feature ticket

**Process**:

1. Invoke `requirements-analyst` agent with prompt:

   ```
   Analyze this feature request and create a comprehensive feature ticket:

   Feature: {user_input}

   Project Context:
   - Tech Stack: Next.js 14 + React + TypeScript + Tailwind + shadcn/ui
   - State: Zustand + Immer
   - Forms: react-hook-form + Zod
   - Testing: Jest + Testing Library
   - Standards: SOLID, DRY, KISS, WCAG 2.1 AA

   Generate:
   1. Feature Title (clear, concise)
   2. Description (what & why)
   3. User Story (As a [user], I want [goal], so that [benefit])
   4. Technical Details:
      - Components needed
      - State management approach
      - Data flow
      - Dependencies
   5. Acceptance Criteria (functional, visual, performance, a11y)
   6. Out of Scope (what NOT to include)
   7. Estimated Complexity (S/M/L/XL)
   8. Test Coverage Requirements
   ```

2. Present ticket to user for **approval/refinement**
3. If approved, assign Epic ID and Feature ID:
   - Format: `FEAT-{epic}.{feature}` (e.g., FEAT-003.5)
   - Epic derived from existing epics in PROGRESS_V2.md or create new

**Output**: Feature ticket in structured format, saved to memory

---

### STEP 2: UI/UX Design Phase

**Agent**: ` ui-ux-designer` (for responsive design focus)

**Goal**: Create approved design with layout and theme variations using superdesign

**Process**:

#### 2A: Layout Design (3 Variations)

1. Invoke `ui-ux-designer` agent with prompt:

   ```
   Create 3 layout variations for this feature using superdesign prompt/instructions:

   Feature: {ticket_title}
   Requirements: {acceptance_criteria}

   For each layout:
   - ASCII wireframe showing component structure
   - Mobile-first responsive approach (375px � 768px � 1920px)
   - Touch targets e44�44px
   - Accessibility considerations
   - Component hierarchy

   Format as:
   Layout A: [description]
   [ASCII wireframe]
   Pros: ...
   Cons: ...

   Layout B: ...
   Layout C: ...
   ```

2. Present 3 layouts to user
3. **User selects preferred layout** (A, B, or C)

#### 2B: Theme Design (3 Variations)

1. Use `generateTheme` MCP tool with selected layout and superdesign
2. Generate 3 theme variations:

   - **Theme 1**: Neo-brutalism (bold borders, flat colors, high contrast)
   - **Theme 2**: Modern minimalist (subtle shadows, soft colors, clean)
   - **Theme 3**: Accessible high-contrast (WCAG AAA compliant colors)

3. Present themes with color swatches, font choices, spacing
4. **User confirms final theme** (1, 2, or 3)

#### 2C: Animation Design

1. Define micro-interactions using concise syntax:
   ```
   button: 150ms [S1�0.98�1] press, 200ms [shadow�] hover
   toggle: 300ms ease-out [X0�20, bg�accent]
   modal: 250ms ease-out [Y+40�0, �0�1]
   ```
2. Ensure `prefers-reduced-motion` respected

**Output**:

- Design reference (layout + theme + animations)
- Saved to `.superdesign/design_iterations/{feature_id}_approved.html`

---

### STEP 3: Technical Planning & Implementation

**Agents**: `tech-lead-orchestrator` (planning) � `frontend-developer-nextjs` or `react-component-architect` (implementation)

**Goal**: Break down feature into subtasks and implement with quality

**Process**:

#### 3A: Technical Planning

1. Invoke `tech-lead-orchestrator` agent with prompt:

   ```
   Review this feature ticket and design:

   Ticket: {feature_ticket}
   Design: {design_reference}

   Create implementation plan:
   1. Component breakdown (hierarchy)
   2. File structure (where to create/edit files)
   3. State management approach (Zustand slices)
   4. Form handling (if applicable, use react-hook-form + Zod)
   5. Testing strategy (unit + integration tests)
   6. Accessibility checklist (ARIA, keyboard nav, screen reader)
   7. Performance considerations (code splitting, memoization)
   8. Dependencies (new packages needed?)

   Break into subtasks:
   - SUBTASK-1: [description]
   - SUBTASK-2: [description]
   - ...
   ```

2. Present plan to user for **approval**

#### 3B: Implementation

1. Invoke `frontend-developer-nextjs` agent with plan:

   ```
   Implement this feature following the plan:

   Plan: {implementation_plan}
   Design: {design_reference}

   Requirements:
   - TypeScript strict mode (no 'any')
   - SOLID principles (Single Responsibility, Open/Closed)
   - DRY (extract reusable logic to hooks/utils)
   - KISS (simple over clever)
   - Accessibility:
     * Semantic HTML (<section>, <nav>, <button>)
     * ARIA labels where needed
     * Keyboard navigation (Tab, Enter, Esc)
     * Focus indicators (3:1 contrast)
   - Responsive (mobile-first Tailwind classes)
   - Unit tests (Jest + Testing Library)

   For each component:
   1. Create TypeScript interfaces for props
   2. Implement with accessibility attributes
   3. Write 2-3 unit tests (happy path + edge cases)
   4. Add JSDoc comments for public APIs

   Use TodoWrite to track implementation progress.
   ```

2. Agent implements feature:

   - Creates/edits files in `src/` directory
   - Writes tests in `__tests__/` or co-located `*.test.tsx`
   - Updates Zustand stores if state needed
   - Adds Zod schemas if forms involved

3. Run quality checks:
   ```bash
   npm run type-check  # TypeScript validation
   npm run lint        # ESLint
   npm test           # Jest tests
   ```

**Output**:

- Implemented feature code
- Unit tests (>80% coverage for new code)
- Git branch: `feature/{feature_id}-{slug}`

---

### STEP 4: Code Review & QA

**Agents**: `ui-ux-designer` (visual review) + built-in code review

**Goal**: Validate implementation meets design and quality standards

**Process**:

#### 4A: Visual Review (Playwright)

1. Invoke `ui-ux-designer` agent with Playwright MCP:

   ```
   Review the implemented feature visually:

   Feature: {feature_ticket}
   Design Reference: {design_reference}
   URL: http://localhost:3000/{feature_path}

   Check:
   1. Layout matches approved design
   2. Responsive breakpoints (375px, 768px, 1920px)
   3. Colors, fonts, spacing match theme
   4. Animations work as specified
   5. Touch targets e44�44px
   6. Focus indicators visible

   Take screenshots at each breakpoint.
   Rate visual accuracy (1-5): [score]
   List discrepancies: [issues]
   ```

2. If issues found, log to temporary list

#### 4B: Accessibility Audit

1. Run axe DevTools scan:

   ```typescript
   // Via Playwright MCP
   await page.goto(featureUrl);
   const violations = await page.evaluate(() => {
     return axe.run();
   });
   ```

2. Check:

   - Zero critical/serious violations
   - Keyboard navigation works (Tab order, Enter/Space, Esc)
   - Screen reader compatibility (ARIA labels)
   - Color contrast e4.5:1 (text), e3:1 (UI)

3. If violations found, log to temporary list

#### 4C: Performance Check

1. Check bundle size:

   ```bash
   npm run build
   # Verify main bundle <200KB
   ```

2. Lighthouse audit (optional):
   ```
   Performance: e90
   Accessibility: e95
   ```

**Output**:

- Review summary (pass/fail + issues)
- If issues: Create bug entries for BUGS_V2.md

---

### STEP 5: Documentation Updates

**Goal**: Update all relevant project documentation

**Process**:

#### 5A: Update PROGRESS_V2.md

1. Add feature ticket to appropriate epic:

   ```markdown
   **FEAT-{epic}.{id}: {title}**  Complete

   - **Goal**: {description}
   - **Scope**: {scope}
   - **Acceptance Criteria**:
     - [x] {criterion_1}
     - [x] {criterion_2}
   - **Completed**: {date}
   ```

2. Update epic progress percentage

#### 5B: Update DECISIONS_V2.md (if applicable)

If feature involves architectural decision:

```markdown
## ADR-{number}: {decision_title}

**Date**: {date}
**Status**:  Accepted
**Category**: Frontend / UX / Architecture
**Related**: [FEAT-{epic}.{id}](./PROGRESS_V2.md#feat-{epic}{id})

### Context

{why_decision_needed}

### Decision

{what_was_chosen}

### Alternatives Considered

{other_options_with_pros_cons}

### Consequences

**Positive**: ...
**Negative**: ...
```

#### 5C: Update BUGS_V2.md (if issues found)

If QA found issues:

```markdown
### Bug #{id}: {title}

**Severity**: =� Medium
**Status**: Open
**Component**: {component_name}
**Area**: {area}
**Reported**: {date}
**Related Feature**: FEAT-{epic}.{id}

**Description**: {issue_description}
**Reproduction Steps**: ...
**Expected**: ...
**Actual**: ...
**Impact**: ...
```

#### 5D: Update CLAUDE_V2.md (if major change)

If feature changes architecture or adds new patterns:

- Update "Architecture" section
- Update "Core Modules" if new module added
- Update "Runbook" if new commands needed

**Output**: All docs updated, committed to feature branch

---

### STEP 6: Git Workflow & Summary

**Goal**: Commit changes and provide summary

**Process**:

#### 6A: Git Commit

1. Create feature branch (if not exists):

   ```bash
   git checkout -b feature/{feature_id}-{slug}
   ```

2. Stage and commit:

   ```bash
   git add .
   git commit -m "feat({area}): {title}

   - Implemented {component_list}
   - Added unit tests (coverage {percentage}%)
   - Updated documentation (PROGRESS_V2, DECISIONS_V2)
   - Accessibility: WCAG 2.1 AA compliant

   Closes #{feature_id}

   > Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

3. **Ask user**: Push to remote? Create PR?

#### 6B: Generate Summary

Present completion summary:

```markdown
##  Feature Implementation Complete

**Feature ID**: FEAT-{epic}.{id}
**Title**: {title}
**Status**:  Implemented & Reviewed

### =� Metrics

- **Components Created**: {count} files
- **Lines of Code**: ~{loc}
- **Test Coverage**: {percentage}%
- **Accessibility**: {axe_violations} violations (target: 0)
- **Visual Accuracy**: {score}/5

### <� Design

- **Layout**: {layout_choice}
- **Theme**: {theme_choice}
- **Reference**: `.superdesign/design_iterations/{feature_id}_approved.html`

### =� Documentation Updated

-  PROGRESS_V2.md (FEAT-{epic}.{id} added)
-  DECISIONS_V2.md (ADR-{number} added, if applicable)
-  BUGS_V2.md ({bug_count} issues logged, if any)

### = Links

- **Branch**: `feature/{feature_id}-{slug}`
- **Design Reference**: `.superdesign/design_iterations/{feature_id}_approved.html`
- **Test Report**: Coverage {percentage}%

### =� Next Steps

1. Review implementation in browser: `npm run dev`
2. Run tests: `npm test`
3. Push to remote: `git push -u origin feature/{feature_id}-{slug}`
4. Create PR (optional): `gh pr create --title "{title}" --body "Implements FEAT-{epic}.{id}"`
5. If issues found, address bugs logged in BUGS_V2.md

**Estimated Time to Complete**: {actual_minutes} minutes
```

**Output**: Summary displayed, feature ready for deployment

---

## <� User Interaction Points

You will be asked to confirm/approve at these steps:

1.  **After Ticket Generation**: Review and approve feature ticket
2.  **After Layout Options**: Select preferred layout (A, B, or C)
3.  **After Theme Options**: Select preferred theme (1, 2, or 3)
4.  **After Technical Plan**: Approve implementation approach
5.  **After QA Review**: Decide on bug fixes (fix now vs log for later)
6.  **Before Git Push**: Confirm push to remote and PR creation

**At any point, you can**:

- Type "pause" to halt workflow
- Type "skip [step]" to bypass a step (not recommended)
- Type "redo [step]" to regenerate a step's output

---

## =� Technical Configuration

### Required MCP Tools

-  `sequential-thinking` - Multi-step reasoning
-  `magic` - UI component generation via 21st.dev
-  `context7` - Framework documentation lookup
-  `playwright` - Browser testing and visual review
-  `generateTheme` - Theme generation tool

### File Structure Expectations

```
src/
  components/
    {feature}/           # New feature components
      FeatureComponent.tsx
      FeatureComponent.test.tsx
  stores/
    {feature}-store.ts   # Zustand store (if needed)
  lib/
    validations.ts       # Zod schemas (if forms)

.superdesign/
  design_iterations/
    {feature_id}_layout_a.html
    {feature_id}_layout_b.html
    {feature_id}_layout_c.html
    {feature_id}_approved.html

docs/
  PROGRESS_V2.md         # Updated with feature ticket
  DECISIONS_V2.md        # Updated with ADRs
  BUGS_V2.md            # Updated with QA issues
  CLAUDE_V2.md          # Updated if architecture changed
```

### Quality Gates (Must Pass)

-  TypeScript: Zero errors (`npm run type-check`)
-  ESLint: Zero errors (`npm run lint`)
-  Tests: All passing (`npm test`)
-  Coverage: e80% for new code
-  Accessibility: Zero critical axe violations
-  Bundle Size: <200KB main bundle

**If any gate fails**: Workflow pauses, issues logged to BUGS_V2.md, asks user to fix or continue with issues.

---

## =� Example Walkthrough

**User Input**: `/build-feature Add dark mode toggle to layout settings`

### Step 1: Ticket Generated

```
FEAT-006.1: Dark Mode Toggle for Layout Settings

Description: Add a toggle switch to settings page allowing users to switch between light/dark theme.

Technical Details:
- Component: DarkModeToggle (shadcn/ui Switch)
- State: Zustand theme store (light/dark/system)
- Persistence: LocalStorage (theme preference)
- CSS: Tailwind dark mode classes

Acceptance Criteria:
- [x] Toggle switches between light/dark/system modes
- [x] Preference persists across sessions
- [x] System preference respected if "system" selected
- [x] Smooth transition animation (200ms)
- [x] Accessible (keyboard, screen reader)
```

**User approves** 

### Step 2: Design Phase

**Layout Options** (3 ASCII wireframes presented)

User selects **Layout B** (compact inline toggle)

**Theme Options**:

- Theme 1: Neo-brutalism (bold switch, high contrast)
- Theme 2: Modern (subtle switch, smooth gradient)
- Theme 3: Accessible (clear labels, WCAG AAA)

User selects **Theme 2** 

**Animations**:

```
toggle: 300ms ease-out [X0�28, bg�accent]
icon: 200ms [R360�, �0.7�1]
```

### Step 3: Implementation

**Plan Approved**:

- Create `DarkModeToggle.tsx` in `src/components/settings/`
- Create `theme-store.ts` in `src/stores/`
- Update `layout.tsx` to apply theme class
- Write 3 unit tests

**Implementation**: Agent creates files, writes tests, runs checks

### Step 4: QA

**Visual Review** (Playwright screenshots):  5/5 accuracy
**Accessibility**:  0 violations
**Performance**:  Bundle +2KB (acceptable)

### Step 5: Documentation

-  PROGRESS_V2.md updated (FEAT-006.1 added)
-  DECISIONS_V2.md updated (ADR-009: Dark mode implementation strategy)

### Step 6: Summary

```
 Feature Implementation Complete

Feature ID: FEAT-006.1
Status:  Implemented & Reviewed
Test Coverage: 92%
Time: 18 minutes

Next: Push to remote and create PR
```

---

## =' Troubleshooting

**Issue**: Context too high (>150k tokens)
**Solution**: Run `/compact` first, then retry `/build-feature`

**Issue**: Design generation fails
**Solution**: Fallback to manual wireframe description, skip `.superdesign` file generation

**Issue**: Tests fail during implementation
**Solution**: Workflow pauses, shows failing tests, asks user to fix or continue with warnings

**Issue**: Agent not available
**Solution**: Fallback to native Claude capabilities with reduced specialization

**Issue**: Git conflicts
**Solution**: Workflow pauses, shows conflict files, asks user to resolve manually

---

## <� Success Metrics

A successful `/build-feature` run should result in:

-  **Feature Ticket**: Created in PROGRESS_V2.md with all details
-  **Design Approved**: Layout + Theme + Animations defined
-  **Code Implemented**: Components, tests, state management
-  **Quality Passed**: TypeScript, ESLint, Jest, Accessibility
-  **Documentation Updated**: PROGRESS_V2, DECISIONS_V2, BUGS_V2
-  **Git Committed**: Feature branch with clear commit message
-  **Summary Provided**: Metrics, links, next steps

**Average Completion Time**: 15-30 minutes (depending on feature complexity)

**Token Usage**: ~40-60k tokens (requires 140k+ available)

---

## =� Quick Start

1. Ensure you have at least 140k tokens available: `/context`
2. If needed, compact context: `/compact`
3. Run: `/build-feature "your feature description"`
4. Follow prompts to approve ticket, select design, and confirm implementation
5. Review summary and test locally
6. Push to remote and create PR when ready

**Pro Tip**: For complex features (XL complexity), consider breaking into multiple smaller features to stay within token limits.

---

**End of /build-feature specification**
