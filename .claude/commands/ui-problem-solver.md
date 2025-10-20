# /ui-problem-solver - UI Issue Diagnosis & Fix Workflow

**Purpose**: Automated workflow to diagnose UI/UX issues, validate acceptance criteria, implement fixes, and review results with comprehensive visual validation.

**Syntax**: `/ui-problem-solver "<issue description or ticket ID>"`

**Example**: `/ui-problem-solver "Login form not responsive on mobile"` or `/ui-problem-solver "TICKET-123"`

---

## =Ë Context Check

Before starting, I will:

1. Check current context usage (target: <150k tokens available)
2. Warn if context >150k tokens and suggest `/compact`
3. Load required documentation: `CLAUDE_V2.md`, `PROGRESS_V2.md`, `BUGS_V2.md`

**Context Budget**: This workflow requires ~30-50k tokens. If current usage >140k, I will halt and ask you to run `/compact` first.

---

## = Workflow Overview

```
User Input (Issue Description)
    “
[STEP 1] Issue Analysis ’ Extract Ticket Details & Acceptance Criteria
    “
[STEP 2] Playwright Navigation ’ Real Browser Inspection
    “
[STEP 3] Visual Diagnosis ’ Capture Screenshots & Identify Problems
    “
[STEP 4] Root Cause Analysis ’ Determine Technical Issues
    “
[STEP 5] Implementation ’ Fix Code Issues
    “
[STEP 6] Validation ’ Verify Fix Works
    “
[STEP 7] UI/UX Review ’ Invoke Designer Review & Rating
    “
[STEP 8] Documentation ’ Update BUGS_V2.md & Summary
```

**Total Estimated Time**: 10-25 minutes (depending on issue complexity)

---

## =Í Step-by-Step Workflow

### STEP 1: Issue Analysis ’ Extract Ticket Details

**Goal**: Parse issue description and extract key information

**Process**:

1. **Parse Input**: Extract from issue description:
   - Component/Page affected
   - Device/Browser context (mobile/tablet/desktop)
   - Expected vs actual behavior
   - Severity (critical/high/medium/low)

2. **Search BUGS_V2.md**: Check if issue already tracked
   - If found, reference existing bug ID
   - Extract acceptance criteria and reproduction steps

3. **Create Issue Context**:
   ```
   ISSUE CONTEXT:
   - Component: {component_name}
   - Page/URL: {page_path}
   - Severity: {level}
   - Device: {device_context}
   - Expected: {expected_behavior}
   - Actual: {actual_behavior}
   - Acceptance Criteria: [to be determined via browser inspection]
   ```

4. **Present to user for confirmation** before proceeding

**Output**: Issue context document, confirmed with user

---

### STEP 2: Playwright Navigation ’ Real Browser Inspection

**Agent**: Auto-use Playwright MCP tools

**Goal**: Navigate to the affected component/page and capture current state

**Process**:

1. **Start Browser Session**:
   ```
   browser_install() if needed
   browser_navigate(url: "http://localhost:3000/{page_path}")
   browser_wait_for(text: "page loaded") or time: 3
   ```

2. **Take Initial Screenshot**:
   ```
   browser_take_screenshot(filename: "initial-state-{device}.png")
   - Capture at: mobile (375px), tablet (768px), desktop (1920px)
   ```

3. **Get Page Snapshot**:
   ```
   browser_snapshot() ’ Accessibility tree with element references
   - Identifies interactive elements (buttons, inputs, links)
   - Shows ARIA labels and semantic structure
   ```

4. **Console Messages Check**:
   ```
   browser_console_messages(onlyErrors: true)
   - Identifies JavaScript errors or warnings
   ```

5. **Network Requests** (optional):
   ```
   browser_network_requests() ’ Check for failed requests
   - Identifies 404s, 5xx errors, timeouts
   ```

**Output**: Screenshots, snapshot, error logs, network analysis

---

### STEP 3: Visual Diagnosis ’ Identify Problems

**Agent**: `frontend-architect` (visual analysis)

**Goal**: Analyze screenshots and identify specific visual/UX issues

**Process**:

1. **Compare Against Design**:
   - Reference `.superdesign/design_iterations/` approved design
   - Check: layout, colors, typography, spacing, shadows
   - Identify deviations from design

2. **Responsive Behavior**:
   - Check mobile (375px) layout
   - Check tablet (768px) layout
   - Check desktop (1920px) layout
   - Identify breakpoint failures

3. **Interactive Elements**:
   - Check hover states (buttons, links, cards)
   - Check focus indicators (tab navigation)
   - Check disabled states
   - Verify touch targets (e44px)

4. **Accessibility Issues**:
   - Color contrast (e4.5:1 for text)
   - ARIA labels present
   - Keyboard navigation works
   - Screen reader compatibility

5. **Create Diagnosis Report**:
   ```
   VISUAL DIAGNOSIS:

   Issues Found:
   1. Layout broken on mobile:
      - Description: Grid layout stacks incorrectly
      - Location: ProfileCard component
      - Severity: High
      - Expected: 2-column layout at 375px
      - Actual: 1-column, content overflow

   2. Color contrast failure:
      - Description: Button text too light
      - Location: CTA button
      - Severity: High (WCAG violation)
      - Ratio: 3.2:1 (need e4.5:1)

   3. Touch target too small:
      - Description: Close button only 32px
      - Location: Modal header
      - Severity: Medium
      - Expected: e44px

   Root Causes (Hypotheses):
   - Missing Tailwind breakpoint class (md:)
   - Color variable misconfiguration
   - CSS padding insufficient
   ```

**Output**: Diagnosis report with specific issues and locations

---

### STEP 4: Root Cause Analysis ’ Technical Investigation

**Agent**: `tech-lead-orchestrator` (architecture/code analysis)

**Goal**: Pinpoint exact code issues causing the problems

**Process**:

1. **File Inspection**:
   - Read component file: `src/components/{component}/`
   - Check: Tailwind classes, CSS, inline styles
   - Identify missing breakpoints, color mappings

2. **State/Props Inspection**:
   - Check Zustand store for state
   - Check component props and defaults
   - Identify data flow issues

3. **CSS Analysis**:
   - Check `src/app/globals.css` for theme variables
   - Check component-specific CSS files
   - Identify conflicting styles

4. **Create Root Cause Analysis**:
   ```
   ROOT CAUSE ANALYSIS:

   Issue #1: Grid layout breaks on mobile
   - Root Cause: Missing 'flex flex-col lg:grid lg:grid-cols-2' on grid container
   - File: src/components/ProfileCard/ProfileCard.tsx:45
   - Current: <div className="grid grid-cols-2">
   - Should Be: <div className="flex flex-col lg:grid lg:grid-cols-2">
   - Type: Tailwind breakpoint missing

   Issue #2: Button text contrast
   - Root Cause: Using --primary color (RGB 243,198,35 = yellow) for text on light background
   - File: src/app/globals.css:158
   - Current: color: var(--layit-yellow);
   - Should Be: color: var(--layit-royal-blue);
   - Type: Color variable misuse

   Issue #3: Touch target too small
   - Root Cause: Button padding only p-2 instead of p-3
   - File: src/components/Modal/Modal.tsx:32
   - Current: <button className="p-2 w-8 h-8">
   - Should Be: <button className="p-3 w-10 h-10">
   - Type: CSS sizing issue
   ```

**Output**: Root cause analysis with file locations and fixes needed

---

### STEP 5: Implementation ’ Fix Code Issues

**Agent**: `frontend-developer-nextjs` or `code-reviewer` (code fixing)

**Goal**: Implement fixes for identified issues

**Process**:

1. **Prioritize Fixes**:
   - Critical issues first (accessibility, functionality)
   - High issues second (major visual deviations)
   - Medium/Low issues third (polish)

2. **Implement Each Fix**:
   ```typescript
   // Example Fix Pattern:

   // BEFORE:
   <div className="grid grid-cols-2">

   // AFTER (with explanation):
   <div className="flex flex-col lg:grid lg:grid-cols-2">
     {/* Mobile: stacked vertically, Desktop: 2 columns */}
   ```

3. **For Each Fix**:
   - Edit the specific file
   - Add inline comments explaining the change
   - Keep changes minimal and focused
   - Avoid scope creep (only fix reported issues)

4. **Run Quality Checks**:
   ```bash
   npm run type-check  # TypeScript validation
   npm run lint        # ESLint
   npm run build       # Build check
   ```

5. **Use TodoWrite** to track individual fixes:
   ```
   - TASK: Fix grid layout on mobile (ProfileCard.tsx:45)
   - TASK: Fix button contrast (globals.css:158)
   - TASK: Fix touch target size (Modal.tsx:32)
   ```

**Output**: Fixed code, passing quality checks

---

### STEP 6: Validation ’ Verify Fixes Work

**Goal**: Confirm fixes resolve the original issues

**Process**:

1. **Browser Refresh** (Playwright):
   ```
   browser_navigate(url: "http://localhost:3000/{page_path}")
   browser_wait_for(time: 2)  // Wait for HMR
   ```

2. **Take After Screenshots**:
   ```
   browser_take_screenshot(filename: "after-fix-mobile.png")
   browser_take_screenshot(filename: "after-fix-tablet.png")
   browser_take_screenshot(filename: "after-fix-desktop.png")
   ```

3. **Compare Before/After**:
   - Layout now responsive? 
   - Colors have correct contrast? 
   - Touch targets e44px? 
   - No console errors? 

4. **Interactive Testing**:
   ```
   // Test hover states
   browser_hover(element: "{button_ref}")
   browser_take_screenshot(filename: "hover-state.png")

   // Test focus indicators
   browser_press_key(key: "Tab")
   browser_take_screenshot(filename: "focus-state.png")

   // Test responsive resize
   browser_resize(width: 375, height: 812)  // iPhone size
   browser_take_screenshot(filename: "mobile-after.png")
   ```

5. **Create Validation Report**:
   ```
   VALIDATION REPORT:

    Fix #1: Grid layout responsive
      - Mobile (375px): Correctly stacked vertically
      - Desktop (1920px): Correctly shows 2 columns
      - Before: [screenshot], After: [screenshot]

    Fix #2: Button contrast
      - Contrast ratio: 7.2:1 (need e4.5:1)
      - Before: [screenshot], After: [screenshot]

    Fix #3: Touch target size
      - Button now 44x44px
      - Before: [screenshot], After: [screenshot]

    All quality checks passing
      - TypeScript: 0 errors
      - ESLint: 0 errors
      - Build: Success
   ```

**Output**: Before/after screenshots, validation report

---

### STEP 7: UI/UX Review ’ Invoke Designer Review

**Agent**: `ui-ux-designer` (visual design review with Playwright MCP)

**Goal**: Get comprehensive UI/UX rating and ensure design consistency

**Process**:

1. **Invoke UI/UX Designer Agent**:
   ```
   Prompt: Review this fixed component and provide comprehensive UI/UX rating:

   Component: {component_name}
   Issue: {original_issue}
   Fixes Applied: {list_of_fixes}

   Using Playwright MCP:
   1. Navigate to http://localhost:3000/{page_path}
   2. Take screenshots at mobile (375px), tablet (768px), desktop (1920px)
   3. Evaluate:
      - Design Accuracy: Does it match `.superdesign/design_iterations/` approved design?
      - Responsive Design: Works well at all breakpoints?
      - Color & Typography: Matches theme?
      - Spacing & Alignment: Proper Tailwind spacing?
      - Interactive States: Hover, focus, active, disabled states?
      - Accessibility: WCAG 2.1 AA compliant?
      - User Experience: Intuitive and delightful?

   Provide:
   - Overall Rating: 1-5 stars (5=perfect, 1=needs major work)
   - Category Ratings:
     * Visual Accuracy: X/5
     * Responsiveness: X/5
     * Accessibility: X/5
     * UX Delight: X/5
   - Issues Found (if any)
   - Recommendations
   - Before/After Screenshots
   ```

2. **Designer Reviews and Rates**:
   - Takes screenshots at key breakpoints
   - Compares against approved design
   - Evaluates all categories
   - Provides star rating and feedback

3. **Capture Rating**:
   ```
   UI/UX REVIEW RESULTS:

   Overall Rating: PPPP (4/5)

   Category Scores:
   - Visual Accuracy: 5/5  Matches design perfectly
   - Responsiveness: 4/5   Minor spacing issue on tablet
   - Accessibility: 5/5  WCAG 2.1 AA compliant
   - UX Delight: 4/5  Smooth interactions, good feedback

   Screenshots:
   - Mobile (375px): [visual_check]
   - Tablet (768px): [visual_check]
   - Desktop (1920px): [visual_check]

   Recommendations:
   - Minor: Adjust tablet spacing (add md:gap-6 to grid)
   - (Optional improvement, not blocking)
   ```

4. **If Issues Found**:
   - Log to temporary list
   - Ask user: "Fix now or accept with known issues?"
   - If "fix now", loop back to Step 5
   - If "accept", note in documentation

**Output**: UI/UX rating (1-5 stars), screenshots, feedback

---

### STEP 8: Documentation & Summary

**Goal**: Update documentation and provide completion summary

**Process**:

#### 8A: Update BUGS_V2.md

1. **If Bug Entry Exists**:
   ```markdown
   ### Bug #XXX: {title}

   **Status**:  Fixed
   **Fixed Date**: {today}
   **Fixed By**: Claude Code
   **Component**: {component}

   **Resolution**:
   - Fix #1: {description} (File:Line)
   - Fix #2: {description} (File:Line)
   - Fix #3: {description} (File:Line)

   **Validation**:
   -  Before/After screenshots confirm fix
   -  Quality checks passing
   -  UI/UX Review: {rating}/5

   **Changed Files**:
   - src/components/{component}/Component.tsx
   - src/app/globals.css
   ```

2. **If New Bug Entry Needed**:
   ```markdown
   ### Bug #{id}: {title}

   **Status**:  Fixed
   **Severity**: {level}
   **Component**: {component}
   **Fixed**: {date}

   **Issue**: {description}
   **Root Cause**: {analysis}
   **Resolution**: {fixes_applied}
   **Changed Files**: [list]
   ```

#### 8B: Generate Completion Summary

```markdown
##  UI Issue Fixed & Reviewed

**Issue**: {original_issue_description}
**Component**: {component_name}
**Severity**: {level}

### =Ê Fix Metrics

- **Issues Fixed**: {count}
- **Files Changed**: {count}
- **Quality Checks**:  Passed (TypeScript, ESLint, Build)
- **UI/UX Review**: P{rating}/5 stars

### =' Fixes Applied

1. **{Fix Title}** (Priority: Critical)
   - File: `src/components/Component.tsx:45`
   - Change: {brief_description}
   - Impact: {what_improved}

2. **{Fix Title}** (Priority: High)
   - File: `src/app/globals.css:158`
   - Change: {brief_description}
   - Impact: {what_improved}

### =ø Before/After

**Before Fix**:
- [screenshot showing issue]
- Problem: {description}

**After Fix**:
- [screenshot showing resolution]
- Fixed: {description}

### ( UI/UX Review Results

**Overall Rating**: PPPP (4/5)

**Scores**:
- Visual Accuracy: 5/5
- Responsiveness: 4/5
- Accessibility: 5/5
- UX Delight: 4/5

**Review Notes**: {designer_feedback}

### =Ý Documentation Updated

-  BUGS_V2.md (Status: Fixed)
-  Screenshots attached

###  Quality Gate Results

-  TypeScript: 0 errors
-  ESLint: 0 errors
-  Build: Successful
-  Accessibility: No violations
-  UI/UX: Approved (4/5 stars)

### =€ Next Steps

1. Review fixes in browser: `npm run dev`
2. Test on your device/browser
3. If satisfied, commit and push
4. If issues remain, run `/ui-problem-solver` again with feedback

**Total Time**: {actual_minutes} minutes
**Status**: =â Ready for deployment
```

**Output**: Documentation updated, summary displayed

---

## =e User Interaction Points

You will be asked to confirm/provide input at:

1. **After Issue Analysis**: Confirm issue context before browser inspection
2. **During Diagnosis**: Provide feedback if diagnosis doesn't match your observations
3. **After Root Cause**: Approve fixes before implementation
4. **If UI/UX Issues**: Decide whether to fix immediately or accept
5. **Final Summary**: Review and confirm all fixes are satisfactory

**At any point, you can**:

- Type "pause" to halt workflow
- Type "show screenshots" to see before/after comparison
- Type "fix this [specific issue]" to prioritize a particular fix
- Type "reject rating" if UI/UX review seems incorrect

---

## ™ Technical Configuration

### Required MCP Tools

-  `playwright` - Browser navigation, screenshots, console inspection
-  `frontend-architect` - Visual analysis
-  `tech-lead-orchestrator` - Root cause analysis
-  `frontend-developer-nextjs` - Implementation
-  `ui-ux-designer` - Visual review with Playwright

### Device/Breakpoint Testing

```
Mobile:    375px (iPhone SE)
Tablet:    768px (iPad)
Desktop:   1920px (Full HD)
```

### Quality Gate Requirements

-  TypeScript: Zero errors
-  ESLint: Zero errors
-  Build: Successful
-  Screenshots: Confirm fix visually
-  UI/UX Review: e3/5 stars (acceptable)

---

## <¯ Success Metrics

A successful `/ui-problem-solver` run should result in:

-  **Issue Diagnosed**: Visual diagnosis completed
-  **Root Cause Found**: Specific code location identified
-  **Fixes Implemented**: Code changes applied
-  **Fixes Validated**: Before/after screenshots confirm resolution
-  **UI/UX Reviewed**: Professional design review completed with rating
-  **Quality Passed**: All gates passing
-  **Documentation Updated**: BUGS_V2.md reflects fix
-  **Summary Provided**: Metrics, screenshots, next steps

**Average Completion Time**: 10-25 minutes

**Token Usage**: ~30-50k tokens (requires 140k+ available)

---

## =€ Quick Start

1. Ensure you have at least 140k tokens: `/context`
2. If needed, compact: `/compact`
3. Run: `/ui-problem-solver "describe your UI issue or reference ticket ID"`
4. Follow prompts to approve diagnosis and fixes
5. Review UI/UX rating and before/after screenshots
6. Test locally with `npm run dev`
7. Commit changes when satisfied

---

**End of /ui-problem-solver specification**
