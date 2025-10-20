# LayItRight Git Workflow Guide

## Commit Message Format

All commits must follow this format for consistency and automatic changelog generation:

```
<type>(<scope>): <subject> - LIT-<ticket-number>

<body>

<footer>
```

### Type
Required. Must be one of:
- **feat**: A new feature
- **fix**: A bug fix
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **style**: Changes that do not affect the meaning of code (formatting, missing semicolons, etc.)
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process, dependencies, or tooling
- **docs**: Documentation only changes
- **ci**: Changes to CI configuration files and scripts
- **revert**: Reverts a previous commit

### Scope
Optional but recommended. The area of code affected:
- `wizard`: Project creation wizard
- `canvas`: Drawing/visualization canvas
- `tiles`: Tiling engine and calculations
- `ui`: UI components
- `auth`: Authentication
- `api`: API endpoints
- `db`: Database
- `config`: Configuration files
- `deps`: Dependencies

### Subject
- Use imperative mood ("add feature" not "added feature")
- Don't capitalize first letter
- No period (.) at the end
- Maximum 50 characters
- Use the ticket number: LIT-001, LIT-002, etc.

### Body (Optional)
- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line
- Use bullet points when listing changes
- Reference related tickets: "Fixes LIT-123", "Related to LIT-124"

### Footer (Optional)
- Reference issues that this commit closes: `Closes #issue-number`
- Breaking changes: `BREAKING CHANGE: description`

## Examples

### Simple Fix
```
fix(dimensions-step): convert units correctly when switching - LIT-001

When users switch from meters to centimeters, the input values
now properly convert using the convert-units library.

Fixes: LIT-001
```

### New Feature
```
feat(canvas): add interactive polygon drawing with drag support - LIT-045

- Added VertexNode component for draggable polygon vertices
- Implemented constraint system to keep vertices within canvas bounds
- Added real-time polygon updates during vertex dragging
- Added visual feedback for hover/drag states

Integrates with: LIT-043, LIT-044
```

### Refactoring
```
refactor(tiles): extract pattern rendering to separate component - LIT-078

Move tile pattern logic out of main canvas component for better
maintainability and testability.

Related: LIT-072
```

### Performance Optimization
```
perf(preview): optimize SVG rendering with viewport culling - LIT-089

Large tile patterns now use virtualization to prevent rendering
1000s of DOM nodes. Improves FPS from 45 to 60 on mobile.
```

### Documentation
```
docs: add canvas builder implementation plan

Document the complete implementation strategy for the Konva.js-based
canvas system with all phases, requirements, and technical details.
```

## Branch Naming Convention

Create feature branches with this format:
```
<type>/<ticket>-<short-description>
```

Examples:
```
feat/LIT-001-fix-unit-conversion
fix/LIT-045-mobile-layout
refactor/LIT-078-canvas-components
```

## Branch Strategy

1. **master**: Production-ready code
   - Always stable and deployable
   - Protected branch - requires PR review
   - All commits must be tagged with release version

2. **develop**: Development branch (if using)
   - Integration point for features
   - Source branch for feature branches

3. **Feature branches**: Created from `master`
   - Format: `feat/LIT-XXX-description`
   - Deleted after merge

## Pull Request Process

### Creating a PR
1. Push your feature branch to remote
2. Create PR from feature branch → `master`
3. Fill in the PR template (see `.github/pull_request_template.md`)
4. Link related tickets/issues
5. Add labels: `type`, `priority`, `status`

### PR Requirements
- [ ] Code follows project style guide
- [ ] All tests pass (run `npm test`)
- [ ] No console.log statements left in production code
- [ ] TypeScript types are properly defined
- [ ] Accessibility standards met (WCAG 2.1 AA minimum)
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Changes are documented

### Code Review
- At least 1 approval before merge
- Address all review comments
- Re-request review after changes

## Commit Best Practices

### Do ✅
- Commit frequently with logical chunks
- Write descriptive commit messages
- Reference tickets/issues in commits
- Keep commits focused on one change
- Use present tense ("add feature" not "added feature")

### Don't ❌
- Commit directly to master
- Mix multiple unrelated changes in one commit
- Use vague messages like "fix", "update", "changes"
- Leave console.log or debug code
- Commit node_modules or build artifacts
- Include sensitive information (API keys, passwords)

## Reverting Commits

If you need to revert a commit:

```bash
git revert <commit-hash>
```

This creates a new commit that undoes the changes. For feature branches not yet pushed:

```bash
git reset --soft HEAD~1  # Undo last commit, keep changes staged
git reset --hard HEAD~1  # Undo last commit, discard changes
```

## Tagging Releases

Tag releases with semantic versioning:

```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Initial production release"
git push origin v1.0.0
```

Format: `v<major>.<minor>.<patch>`

## Useful Commands

```bash
# View commit history
git log --oneline -10
git log --graph --oneline --all

# Show changes in a commit
git show <commit-hash>

# Search commits by message
git log --grep="LIT-001"

# Squash last N commits
git reset --soft HEAD~N
git commit -m "new message"

# Create new branch from current state
git checkout -b feature/LIT-xxx-description

# Sync branch with latest master
git fetch origin
git rebase origin/master
```

## Continuous Integration

All commits trigger CI checks:
- ESLint validation
- TypeScript type checking
- Unit tests with Jest
- Build verification
- Code coverage analysis

Commits must pass all checks before merging to master.

## Questions?

Refer to this guide or consult the team lead for clarification on commit conventions.
