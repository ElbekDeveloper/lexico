<!--
SYNC IMPACT REPORT
==================
Version change: [template / unversioned] → 1.0.0
Modified principles: N/A — first fill of the template
Added sections:
  - Core Principles I–V (all new)
  - Technology Stack & Conventions (new)
  - Branching, PRs & Collaboration (new)
  - Governance (new)
Removed sections: N/A
Templates reviewed:
  - .specify/templates/plan-template.md ✅ Constitution Check section derives gates from these principles; no structural changes required
  - .specify/templates/spec-template.md ✅ Aligns with SDD principle; mandatory sections match PR requirements
  - .specify/templates/tasks-template.md ✅ Task categories (setup, foundational, user stories) align with feature-based architecture principle
Deferred TODOs: None — all placeholders resolved
-->

# Lexi Constitution

## Core Principles

### I. Spec-Driven Development (SDD) (NON-NEGOTIABLE)

Every feature MUST have a Spec Kit SDD specification approved before any implementation
begins. The workflow MUST follow: `/speckit-specify` → `/speckit-clarify` →
`/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. No implementation code MAY
be written for a feature without a linked `spec.md`. Every PR MUST include a link to
its originating spec file located at `specs/<###-feature-name>/spec.md`.

**Rationale**: SDD prevents scope creep, ensures shared understanding before coding
starts, and makes acceptance criteria testable before a single line of implementation
is written. Linking the spec to every PR preserves a permanent audit trail of intent.

### II. Angular Signals-First Architecture (NON-NEGOTIABLE)

The application MUST use Angular 18+ standalone components exclusively. NgModules are
PROHIBITED. State MUST be managed via Angular signals; external state libraries (NgRx,
etc.) are NOT permitted without a constitutional amendment. Derived state MUST use
`computed()`. Components MUST declare `changeDetection: ChangeDetectionStrategy.OnPush`.
The `input()`, `output()`, and `inject()` functions MUST be used; their decorator
equivalents (`@Input`, `@Output`, constructor injection) are PROHIBITED. `@HostBinding`
and `@HostListener` decorators are PROHIBITED — host bindings MUST live in the `host`
object of `@Component` or `@Directive`. `ngClass` and `ngStyle` MUST NOT be used;
`class` and `style` bindings MUST be used instead. `standalone: true` MUST NOT be set
inside decorators (it is the Angular 20+ default). TypeScript `strict` mode MUST be
enforced; the `any` type is PROHIBITED — use `unknown` for uncertain types.

**Rationale**: A consistent signals-based reactive model reduces cognitive overhead,
eliminates zone.js overhead under OnPush, and keeps components predictably fast.
Strict TypeScript catches entire classes of bugs at compile time.

### III. Accessible by Default (NON-NEGOTIABLE)

Every UI component and page MUST pass all AXE accessibility checks with zero violations.
WCAG 2.1 AA compliance is the minimum acceptable standard. Focus management, visible
focus indicators, sufficient color contrast (≥ 4.5:1 for normal text, ≥ 3:1 for large
text), and correct ARIA roles/attributes are non-negotiable. Accessibility review MUST
be part of every PR checklist before approval.

**Rationale**: Lexi serves internal users who may rely on assistive technologies.
Inaccessible UIs create legal and ethical risk, and retrofitting accessibility is
significantly more expensive than building it in from the start.

### IV. Performance-Governed Delivery

All shipped code MUST meet the following Core Web Vitals targets measured on a
representative device profile:

- **LCP** (Largest Contentful Paint): < 2.5 s
- **CLS** (Cumulative Layout Shift): < 0.1
- **INP** (Interaction to Next Paint): < 200 ms

`NgOptimizedImage` MUST be used for all static images (base64 inline images are
exempt). Feature routes MUST be lazy-loaded. Performance regressions that violate
these targets MUST be resolved before merging to `develop`.

**Rationale**: Chat applications are interaction-heavy; a slow INP directly degrades
perceived responsiveness. CLS violations erode visual trust in a productivity tool.
Enforcing these at merge time prevents slow compounding degradation over time.

### V. Feature-Based, Lazy-Loaded Architecture

Source code MUST be organized by feature under `src/app/features/<feature-name>/`.
Each feature MUST be a self-contained unit with its own lazy-loaded route. Components
MUST have a single responsibility. Shared utilities and UI primitives MUST live in
`src/app/shared/`. Cross-feature communication MUST go through services, signals, or
router state — never through direct component-to-component coupling. SCSS is the
required stylesheet language; inline styles are PROHIBITED except for dynamic
style bindings.

**Rationale**: Feature isolation enables parallel development, reduces merge conflicts,
and makes lazy loading straightforward. Consistent SCSS keeps the styling contract
predictable and allows global theming without specificity battles.

## Technology Stack & Conventions

- **Framework**: Angular 18+ — standalone components only, no NgModules
- **Language**: TypeScript with `strict: true`; `any` is PROHIBITED; use `unknown` for
  uncertain types; prefer type inference where the type is obvious
- **Styling**: SCSS; component styles MUST reference paths relative to the component
  TS file; global themes and variables in `src/styles/`
- **Templates**: Native control flow (`@if`, `@for`, `@switch`) MUST be used;
  structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`) are PROHIBITED
- **Images**: `NgOptimizedImage` for all static images; base64 inline images are exempt
- **Forms**: Reactive forms MUST be used; template-driven forms are PROHIBITED
- **Observables**: The `async` pipe MUST be used in templates; manual `subscribe()`
  calls MUST be paired with explicit teardown (takeUntilDestroyed, unsubscribe)
- **Globals**: Template expressions MUST NOT assume globals such as `new Date()`;
  inject a service or use a signal for runtime values
- **Linting / Formatting**: ESLint + Prettier configurations at repo root MUST be
  respected; PRs MUST have zero lint errors

## Branching, PRs & Collaboration

- **Protected branches**: `master` and `develop` — direct pushes are PROHIBITED
- **Branch naming MUST follow**: `feature/<description>`, `fix/<description>`,
  `release/<version>`
- **Commit format**: Conventional Commits MUST be used for every commit
  (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, etc.)
- **PR requirements**:
  - Link to the originating spec file (`specs/<###-feature-name>/spec.md`) is MANDATORY
  - All CI checks MUST pass: lint, type-check, unit tests, AXE accessibility audit
  - At least one peer review approval REQUIRED before merging
- **Merge strategy**: Squash-merge to `develop`; merge-commit to `master` for releases

## Governance

This constitution supersedes all other project practices and conventions unless a
higher-authority legal or compliance requirement applies. All contributors MUST read
this document before submitting their first PR.

**Amendment procedure**:

1. Open a `docs:` PR proposing the change with clear rationale and impact assessment.
2. Obtain at least two maintainer approvals.
3. Update `LAST_AMENDED_DATE` and increment `CONSTITUTION_VERSION` per the policy below.
4. Announce the amendment in the team channel before merging.

**Versioning policy**:

- **MAJOR**: Removal or backward-incompatible redefinition of a NON-NEGOTIABLE principle.
- **MINOR**: New principle or section added, or material guidance expansion.
- **PATCH**: Clarifications, wording fixes, non-semantic refinements.

All PRs and code reviews MUST verify compliance with the principles above. Any
necessary deviation from a principle MUST be justified in the PR description and
tracked in the `Complexity Tracking` table of the feature plan.

For runtime development guidance, refer to `.claude/CLAUDE.md` (agent-specific rules)
and `CLAUDE.md` (project-level instructions).

**Version**: 1.0.0 | **Ratified**: 2026-04-28 | **Last Amended**: 2026-04-28
