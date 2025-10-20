# LayItRight - Bugs & Known Issues V2

**Last Updated**: 2025-10-19
**Version**: 2.0
**Related Docs**: [CLAUDE_V2.md](./CLAUDE_V2.md) | [PROGRESS_V2.md](./PROGRESS_V2.md) | [DECISIONS_V2.md](./DECISIONS_V2.md)

---

## How to Use This File

Track bugs, known issues, and quality problems:
- **Bugs Table**: All reported issues with severity/status
- **Triage Policy**: How bugs are prioritized
- **Filing Guidelines**: How to write effective bug reports

**Update Frequency**: After each bug triage session (daily during sprints).

---

## 📊 Bugs Overview

**Total Bugs**: 21
**By Severity**: 🔴 Critical: 1 | 🟠 High: 5 | 🟡 Medium: 9 | 🔵 Low: 6
**By Status**: Open: 21 | In Progress: 0 | Fixed: 0 | Closed: 0

**By Area**:
- Responsive Design: 6 bugs
- Accessibility: 5 bugs
- Visual Design: 4 bugs
- Layout/Spacing: 4 bugs
- Content/UX: 2 bugs

---

## 🐛 Bugs Table

| ID | Title | Severity | Status | Area | Reported | Assigned | Viewport |
|----|-------|----------|--------|------|----------|----------|----------|
| [#1](#bug-1-excessive-button-height-on-mobile) | Excessive button height on mobile | 🔴 Critical | Open | Responsive | 2025-10-16 | - | Mobile 375px |
| [#2](#bug-2-missing-h1-heading) | Missing H1 heading | 🟠 High | Open | A11y | 2025-10-16 | - | All |
| [#3](#bug-3-button-padding-not-responsive) | Button padding not responsive | 🟠 High | Open | Responsive | 2025-10-16 | - | Mobile 375px |
| [#4](#bug-4-button-text-wrapping-on-mobile) | Button text wrapping on mobile | 🟠 High | Open | Responsive | 2025-10-16 | - | Mobile 375px |
| [#5](#bug-5-missing-skip-navigation-link) | Missing skip navigation link | 🟠 High | Open | A11y | 2025-10-16 | - | All |
| [#6](#bug-6-font-size-not-scaling-on-mobile) | Font size not scaling on mobile | 🟠 High | Open | Responsive | 2025-10-16 | - | Mobile 375px |
| [#7](#bug-7-no-visual-focus-indicator-enhancement) | No visual focus indicator enhancement | 🟡 Medium | Open | A11y | 2025-10-16 | - | All |
| [#8](#bug-8-desktop-page-doesnt-scroll-on-standard-viewport) | Desktop page doesn't scroll on standard viewport | 🟡 Medium | Open | Layout | 2025-10-16 | - | Desktop 1920 |
| [#9](#bug-9-split-container-layout-break-at-tablet) | Split container layout break at tablet | 🟡 Medium | Open | Responsive | 2025-10-16 | - | Tablet 768 |
| [#10](#bug-10-hero-section-padding-not-responsive) | Hero section padding not responsive | 🟡 Medium | Open | Responsive | 2025-10-16 | - | Mobile 375 |
| [#11](#bug-11-non-semantic-generic-containers) | Non-semantic generic containers | 🟡 Medium | Open | A11y | 2025-10-16 | - | All |
| [#12](#bug-12-feature-list-not-marked-as-list) | Feature list not marked as list | 🟡 Medium | Open | A11y | 2025-10-16 | - | All |
| [#13](#bug-13-no-reduced-motion-preference-handling) | No reduced motion preference handling | 🟡 Medium | Open | A11y | 2025-10-16 | - | All |
| [#14](#bug-14-missing-aria-labels-on-header) | Missing ARIA labels on header | 🟡 Medium | Open | A11y | 2025-10-16 | - | All |
| [#15](#bug-15-inconsistent-border-width-scale) | Inconsistent border width scale | 🔵 Low | Open | Visual | 2025-10-16 | - | All |
| [#16](#bug-16-tile-pattern-card-inconsistent-border-color) | Tile pattern card inconsistent border color | 🔵 Low | Open | Visual | 2025-10-16 | - | Desktop 1920 |
| [#17](#bug-17-inconsistent-vertical-spacing) | Inconsistent vertical spacing | 🔵 Low | Open | Layout | 2025-10-16 | - | All |
| [#18](#bug-18-wide-desktop-layout-not-optimized) | Wide desktop layout not optimized | 🔵 Low | Open | Layout | 2025-10-16 | - | Desktop 2560 |
| [#19](#bug-19-feature-cards-height-inconsistency) | Feature cards height inconsistency | 🔵 Low | Open | Visual | 2025-10-16 | - | Desktop 1920 |
| [#20](#bug-20-footer-border-inconsistency) | Footer border inconsistency | 🔵 Low | Open | Visual | 2025-10-16 | - | All |
| [#21](#bug-21-no-loading-state-for-tile-animation) | No loading state for tile animation | 🔵 Low | Open | Content | 2025-10-16 | - | All |

---

## 🔴 Critical Bugs

### Bug #1: Excessive Button Height on Mobile
**Severity**: 🔴 Critical
**Status**: Open
**Component**: CTA Button (`.cta-mega`)
**Area**: Responsive Design
**Reported**: 2025-10-16
**Affected Viewports**: Mobile (375px)

**Description**:
The "START PROJECT NOW" button has excessive height (172px) on mobile viewports, consuming 26% of the screen height. This is caused by fixed padding (`py-8` = 32px vertical) and large font size (24px) that don't scale down for mobile.

**Reproduction Steps**:
1. Open home page on mobile device (375px width)
2. Observe CTA button height
3. Button takes up 172px of 667px viewport (26%)

**Expected Behavior**:
Button should have mobile-friendly height (44-56px) with responsive padding and font scaling.

**Actual Behavior**:
Button consumes excessive vertical space, forcing unnecessary scrolling and poor UX.

**Evidence**:
- Screenshot: `button-mobile-375.png`
- Measurements: Height 172px, padding 32px vertical, font 24px

**Impact**:
- Creates unusable mobile experience
- Poor touch target optimization (too large)
- Violates mobile-first design principles

**Related Issues**: #3 (padding), #4 (text wrapping), #6 (font sizing)
**Related ADRs**: [ADR-008](./DECISIONS_V2.md#adr-008-accessibility-and-performance-budgets) (touch targets)

**Proposed Fix**:
```css
/* Mobile-first responsive button */
.cta-mega {
  @apply px-4 py-3 text-base;  /* Mobile: 16px padding, 16px font */
}

@media (min-width: 768px) {
  .cta-mega {
    @apply px-8 py-4 text-lg;   /* Tablet: 32px padding, 18px font */
  }
}

@media (min-width: 1024px) {
  .cta-mega {
    @apply px-16 py-8 text-2xl; /* Desktop: 64px padding, 24px font */
  }
}
```

---

## 🟠 High Priority Bugs

### Bug #2: Missing H1 Heading
**Severity**: 🟠 High
**Status**: Open
**Component**: Hero Section
**Area**: Accessibility
**Reported**: 2025-10-16
**Affected Viewports**: All

**Description**:
Main heading "LAY-IT-RIGHT" uses `<h2>` tag instead of `<h1>`. Page has no `<h1>` element, violating WCAG 2.1 SC 2.4.6 (Headings and Labels).

**Reproduction Steps**:
1. Open home page
2. Inspect heading element
3. Verify tag is `<h2>`, not `<h1>`

**Expected Behavior**:
Page should have exactly one `<h1>` element as main heading.

**Actual Behavior**:
No `<h1>` found; heading hierarchy starts with `<h2>`.

**Evidence**:
- Browser evaluation: `document.querySelectorAll('h1').length === 0`

**Impact**:
- Poor SEO (search engines prioritize H1 content)
- Accessibility violation (screen readers expect H1)
- WCAG 2.1 SC 2.4.6 failure

**Related ADRs**: [ADR-008](./DECISIONS_V2.md#adr-008-accessibility-and-performance-budgets) (WCAG compliance)

**Proposed Fix**:
```tsx
// Change from:
<h2 className="hero-title">LAY-IT-RIGHT</h2>

// To:
<h1 className="hero-title">LAY-IT-RIGHT</h1>
```

---

### Bug #3: Button Padding Not Responsive
**Severity**: 🟠 High
**Status**: Open
**Component**: CTA Button (`.cta-mega`)
**Area**: Responsive Design
**Reported**: 2025-10-16
**Affected Viewports**: Mobile (375px)

**Description**:
Button uses fixed padding `px-16 py-8` (64px horizontal, 32px vertical) that doesn't scale for mobile. On 375px viewport, 64px padding on each side leaves only 247px for content (311px usable width - 64px padding).

**Reproduction Steps**:
1. Open home page on mobile (375px)
2. Inspect button padding
3. Measure: 64px left + 64px right = 128px total horizontal padding

**Expected Behavior**:
Padding should scale responsively (e.g., `px-4` on mobile, `px-8` on tablet, `px-16` on desktop).

**Actual Behavior**:
Fixed 64px padding wastes mobile screen space.

**Evidence**:
- Screenshot: `button-mobile-375.png`
- Calculation: 375px width - 64px margin - 128px padding = 247px content

**Impact**:
- Wasted mobile screen space
- Poor UX (cramped button text)
- Violates mobile-first principles

**Related Issues**: #1 (button height), #4 (text wrapping)

**Proposed Fix**:
See Bug #1 proposed fix (responsive padding).

---

### Bug #4: Button Text Wrapping on Mobile
**Severity**: 🟠 High
**Status**: Open
**Component**: CTA Button text
**Area**: Responsive Design
**Reported**: 2025-10-16
**Affected Viewports**: Mobile (375px)

**Description**:
Button text "START PROJECT NOW" wraps onto multiple lines due to fixed padding (128px total) and large font (24px). This creates unbalanced button appearance and reduces call-to-action effectiveness.

**Reproduction Steps**:
1. Open home page on mobile (375px)
2. Observe button text
3. Text wraps to 2-3 lines

**Expected Behavior**:
Text should remain on single line or font size should adjust responsively.

**Actual Behavior**:
Text wraps awkwardly across multiple lines.

**Evidence**:
- Screenshot: `button-scrolled-mobile.png`

**Impact**:
- Reduces button readability
- Weakens call-to-action effectiveness
- Poor visual design

**Related Issues**: #1 (button height), #3 (padding), #6 (font sizing)

**Proposed Fix**:
1. Reduce font size on mobile (16px vs 24px)
2. Reduce padding (see Bug #1 fix)
3. Alternative: Use `white-space: nowrap` and reduce font to fit

---

### Bug #5: Missing Skip Navigation Link
**Severity**: 🟠 High
**Status**: Open
**Component**: Page Header
**Area**: Accessibility
**Reported**: 2025-10-16
**Affected Viewports**: All

**Description**:
No "Skip to main content" link for keyboard and screen reader users to bypass header. This forces keyboard users to tab through header navigation to reach content, violating WCAG 2.1 SC 2.4.1 (Bypass Blocks).

**Reproduction Steps**:
1. Open home page
2. Tab through page with keyboard
3. No skip link appears

**Expected Behavior**:
First focusable element should be "Skip to main content" link, visually hidden until focused.

**Actual Behavior**:
No skip link present.

**Evidence**:
- Browser evaluation: `hasSkipLink = false`

**Impact**:
- Keyboard users must tab through all header elements
- WCAG 2.1 SC 2.4.1 violation (Bypass Blocks)
- Poor screen reader UX

**Related ADRs**: [ADR-008](./DECISIONS_V2.md#adr-008-accessibility-and-performance-budgets) (WCAG compliance)

**Proposed Fix**:
```tsx
// Add to layout.tsx:
<a
  href="#main-content"
  className="skip-link sr-only focus:not-sr-only"
>
  Skip to main content
</a>
<header>...</header>
<main id="main-content">...</main>

// CSS:
.skip-link {
  position: absolute;
  top: 0;
  left: 0;
  padding: 1rem;
  background: var(--primary);
  z-index: 100;
}

.skip-link.sr-only:focus {
  clip: auto;
  height: auto;
  width: auto;
}
```

---

### Bug #6: Font Size Not Scaling on Mobile
**Severity**: 🟠 High
**Status**: Open
**Component**: Hero heading, Button text
**Area**: Responsive Design
**Reported**: 2025-10-16
**Affected Viewports**: Mobile (375px)

**Description**:
Hero heading uses fixed 48px font (12.8% of mobile viewport height) and button uses fixed 24px without responsive scaling. This causes oversized text that appears disproportionately large on mobile.

**Reproduction Steps**:
1. Open home page on mobile (375px)
2. Observe hero heading size (48px)
3. Observe button text size (24px)

**Expected Behavior**:
Font should scale down proportionally on mobile (e.g., 28px heading, 16px button on mobile).

**Actual Behavior**:
Large fixed font sizes remain on mobile.

**Evidence**:
- Mobile screenshots show oversized text
- Calculation: 48px / 375px = 12.8% of viewport width

**Impact**:
- Poor readability (text too large)
- Excessive space consumption
- Violates responsive typography best practices

**Related Issues**: #1 (button height), #4 (text wrapping)

**Proposed Fix**:
```css
/* Hero heading responsive */
.hero-title {
  @apply text-2xl;  /* Mobile: 24px */
}

@media (min-width: 768px) {
  .hero-title {
    @apply text-4xl;  /* Tablet: 36px */
  }
}

@media (min-width: 1024px) {
  .hero-title {
    @apply text-5xl;  /* Desktop: 48px */
  }
}
```

---

## 🟡 Medium Priority Bugs

### Bugs #7-#14
See [BUGS.md](../BUGS.md) for full details on medium priority bugs:
- #7: No visual focus indicator enhancement
- #8: Desktop page doesn't scroll on standard viewport
- #9: Split container layout break at tablet
- #10: Hero section padding not responsive
- #11: Non-semantic generic containers
- #12: Feature list not marked as list
- #13: No reduced motion preference handling
- #14: Missing ARIA labels on header

**Quick Summary**:
- **Accessibility** (4 bugs): Focus indicators, semantic HTML, ARIA labels, reduced motion
- **Layout** (2 bugs): Desktop scrolling, tablet grid layout
- **Responsive** (2 bugs): Hero padding, split container

---

## 🔵 Low Priority Bugs

### Bugs #15-#21
See [BUGS.md](../BUGS.md) for full details on low priority bugs:
- #15: Inconsistent border width scale
- #16: Tile pattern card inconsistent border color
- #17: Inconsistent vertical spacing
- #18: Wide desktop layout not optimized
- #19: Feature cards height inconsistency
- #20: Footer border inconsistency
- #21: No loading state for tile animation

**Quick Summary**:
- **Visual Design** (4 bugs): Border consistency, card heights, color inconsistency
- **Layout** (2 bugs): Vertical spacing, wide desktop optimization
- **Content/UX** (1 bug): Loading state for animations

---

## 📋 Triage Policy

### Severity Definitions

#### 🔴 Critical (S1)
- **Definition**: Blocks primary user flow, causes data loss, or creates security vulnerability
- **Examples**: App crashes, payment failures, XSS vulnerabilities
- **SLA**: Fix within 24 hours
- **Priority**: Halt all other work

#### 🟠 High (S2)
- **Definition**: Major functionality broken, WCAG violations, significant UX degradation
- **Examples**: Missing H1, broken forms, mobile unusable
- **SLA**: Fix within 1 week
- **Priority**: Schedule in current sprint

#### 🟡 Medium (S3)
- **Definition**: Minor functionality issues, inconsistent behavior, quality degradation
- **Examples**: Missing focus indicators, layout inconsistencies
- **SLA**: Fix within 2 weeks
- **Priority**: Schedule in next sprint

#### 🔵 Low (S4)
- **Definition**: Cosmetic issues, edge cases, nice-to-have improvements
- **Examples**: Inconsistent spacing, color mismatches
- **SLA**: Fix when convenient
- **Priority**: Backlog (no sprint commitment)

### Triage Process

**Weekly Triage** (Mondays 10am):
1. Review all new bugs filed since last triage
2. Assign severity (S1-S4) based on definitions
3. Assign area (responsive, a11y, visual, layout, content)
4. Assign owner (if sprint work)
5. Update status (open, in progress, fixed, closed)

**Emergency Triage** (S1 only):
- Immediate Slack notification
- Drop current work
- Fix within 24 hours

---

## ✅ How to File a Great Bug Report

Use this template when filing new bugs:

### Bug Report Template

```markdown
## Bug Title
Brief, descriptive title (e.g., "Button text wrapping on mobile 375px")

## Severity
🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low

## Component/Area
Which component or page? (e.g., CTA Button, Hero Section, Wizard Step 2)

## Environment
- **Viewport**: Mobile 375px | Tablet 768px | Desktop 1920px
- **Browser**: Chrome 118, Firefox 119, Safari 17, Edge 118
- **OS**: Windows 11, macOS 14, iOS 17, Android 13

## Reproduction Steps
1. Open page X
2. Click button Y
3. Observe behavior Z

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Evidence
- Screenshots: `bug-screenshot.png`
- Browser console errors: [paste errors]
- Logs: [paste relevant logs]

## Impact
- **Users Affected**: % of users or user segments
- **Frequency**: Always, Sometimes (50%), Rarely (<10%)
- **Business Impact**: Revenue loss, user complaints, accessibility lawsuit risk

## Related Issues
- Duplicate of: #123
- Blocked by: #456
- Related: #789

## Proposed Fix (Optional)
Suggest solution if known (code snippet, design mockup, etc.)
```

### Good Bug Report Example

**Title**: Button text wrapping on mobile 375px

**Severity**: 🟠 High

**Component**: CTA Button (`.cta-mega`)

**Environment**:
- Viewport: Mobile 375px
- Browser: Chrome 118, Safari 17
- OS: iOS 17, Android 13

**Reproduction Steps**:
1. Open home page on mobile device (375px width)
2. Scroll to CTA button "START PROJECT NOW"
3. Observe text wrapping to multiple lines

**Expected**: Button text remains on single line

**Actual**: Text wraps to 2-3 lines, creating unbalanced appearance

**Evidence**:
- Screenshot: `button-mobile-375.png`
- Measurements: Button width 375px, padding 128px, content 247px

**Impact**:
- 100% of mobile users affected (375px-768px range)
- Always occurs
- Weakens call-to-action effectiveness, may reduce conversion rate

**Related**: #1 (button height), #3 (padding), #6 (font sizing)

**Proposed Fix**:
Reduce font size to 16px and padding to `px-4 py-3` on mobile viewports.

---

## 📊 Bug Metrics & Trends

### Current Sprint (Sprint 2: Oct 16-31)

**Bug Velocity**:
- Opened: 21 bugs (from home page audit)
- Fixed: 0 bugs
- Closed: 0 bugs
- Net Change: +21 bugs

**Burn Down**:
```
Week 1 (Oct 16-19): 21 open bugs
Week 2 (Oct 20-26): Target 15 open bugs (fix 6 high-priority)
Week 3 (Oct 27-31): Target 10 open bugs (fix 5 medium-priority)
```

### Bug Aging

| Age | Count | Oldest Bug |
|-----|-------|------------|
| <1 week | 21 | All from 2025-10-16 |
| 1-2 weeks | 0 | - |
| >2 weeks | 0 | - |

---

## 🔗 Related Documentation

- **[CLAUDE_V2.md](./CLAUDE_V2.md)** - Quality standards, code review checklist
- **[PROGRESS_V2.md](./PROGRESS_V2.md)** - EP-006 (A11y & Performance Pass)
- **[DECISIONS_V2.md](./DECISIONS_V2.md)** - ADR-008 (A11y & Performance Budgets)

---

**End of BUGS_V2.md**
