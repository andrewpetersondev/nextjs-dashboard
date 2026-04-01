---
apply: by file patterns
patterns: src/**/*.tsx, src/**/*.ts
---

# UI Design Standards

These rules define how the user interface should feel, behave, and evolve across the product.

## Goal

Build interfaces that are:

- clear before clever
- visually calm
- easy to scan
- consistent across screens
- responsive by default
- accessible by default
- polished in small details

If a UI choice improves novelty but hurts clarity, choose clarity.

---

## Design Priorities

When making UI decisions, prefer this order:

1. **Usability**
2. **Consistency**
3. **Accessibility**
4. **Visual polish**
5. **Delight**

A beautiful interface that is hard to use is a failure.

---

## Core Principles

### 1. Keep the interface simple

- Show only what the user needs right now.
- Reduce visual noise.
- Avoid crowded layouts.
- Prefer one strong primary action over several competing actions.

### 2. Make hierarchy obvious

- Use size, weight, spacing, and contrast to signal importance.
- Primary content should be immediately visible.
- Secondary and supporting information should be visually quieter.
- Group related elements together.

### 3. Be consistent

- Reuse patterns, spacing, button styles, input styles, and feedback behavior.
- Similar actions should look and behave the same.
- If a pattern already exists, extend it instead of inventing a new one.

### 4. Respect accessibility

- Keyboard support is required.
- Focus states must be clearly visible.
- Color alone must never be the only signal.
- Interactive elements need accessible names.
- Contrast must remain readable in all themes and states.

### 5. Design for responsiveness

- Layouts must work on small, medium, and large screens.
- Nothing should depend on a wide viewport unless explicitly justified.
- Avoid fixed widths when flexible sizing is possible.
- Test long text, large content, and dense data states.

---

## Visual Style

### General style direction

Prefer a UI that is:

- modern
- clean
- structured
- calm
- trustworthy

### Spacing

- Use consistent spacing scales.
- Prefer generous whitespace over cramped layouts.
- Separate sections clearly.
- Avoid arbitrary one-off spacing values unless needed to fix a specific alignment issue.

### Typography

- Use typography to create hierarchy, not decoration.
- Keep line lengths readable.
- Use strong headings, clear labels, and muted supporting text.
- Avoid excessive font weights or too many text sizes in one view.

### Color

- Use color intentionally and sparingly.
- Reserve strong colors for important actions, status, and emphasis.
- Do not rely on saturated colors everywhere.
- Error, warning, success, and info states must be distinct and consistent.

### Borders, shadows, and surfaces

- Use subtle surfaces and restrained shadows.
- Prefer clean separation with spacing and borders before heavy decoration.
- Rounded corners should feel consistent across the product.
- Avoid over-styled cards unless they serve a purpose.

---

## Layout Standards

### Page structure

Most screens should follow a clear structure:

- page header
- supporting description or controls
- main content
- secondary content or empty state
- footer actions only if necessary

### Alignment

- Align text, controls, and content consistently.
- Avoid jagged layout edges unless intentionally used.
- Keep form labels, helper text, and error text aligned with inputs.

### Density

- Dense interfaces are acceptable only when the content requires it.
- Even dense layouts need breathing room and clear grouping.
- If a page feels hard to scan, reduce density before adding decoration.

---

## Components

### Reuse before creating

Before creating a new component:

- check whether an existing component already solves the problem
- extend a reusable component if possible
- only create a new component when the existing pattern cannot be adapted cleanly

### Component design rules

- Prefer small, composable components.
- Components should do one job well.
- Keep props intentional and minimal.
- Avoid “god components” with too many responsibilities.
- Prefer controlled state patterns where appropriate.
- Keep styling predictable and reusable.

### Visual consistency

- Buttons, inputs, dropdowns, modals, tables, badges, and alerts must share the same design language.
- If one component receives a visual update, similar components should be reviewed for consistency.

---

## Forms

Forms are critical UI. They should feel predictable and forgiving.

### Form principles

- Labels should be clear and concise.
- Helper text should explain, not repeat.
- Required fields should be obvious.
- Validation should be understandable.
- Errors should appear near the relevant field.
- Avoid punishing users for recoverable mistakes.

### Form layout

- Group related fields together.
- Prefer vertical form flow unless a horizontal layout improves comprehension.
- Keep action buttons near the form they affect.
- Do not clutter forms with unnecessary helper content.

### Inputs

- Inputs should have visible focus states.
- Disabled, read-only, loading, and error states must be visually distinct.
- Placeholder text is not a substitute for labels.
- Input sizes should remain consistent across the app.

### Validation and feedback

- Validate as early as reasonable.
- Show actionable messages.
- Avoid technical or blame-oriented wording.
- Use field-level errors for field-specific problems.
- Use form-level errors for submission or cross-field problems.

---

## Buttons and Actions

### Action hierarchy

Every screen should make the primary action easy to identify.

- Primary action: strongest emphasis
- Secondary action: visible but quieter
- Tertiary action: minimal emphasis
- Destructive actions: clearly distinct and carefully placed

### Button rules

- Use clear, verb-first labels.
- Be specific: “Save changes” is better than “Save” when context matters.
- Don’t use too many primary buttons on one screen.
- Avoid ambiguous icon-only buttons unless the meaning is obvious and accessible.

### Destructive actions

- Use destructive styling only when the action cannot be reversed easily.
- Put destructive actions away from safe actions.
- When needed, confirm dangerous actions with clear language.

---

## Navigation

### Navigation principles

- Navigation should be predictable.
- The active section should be obvious.
- Users should always know where they are.
- Avoid deep nesting unless the information structure truly requires it.

### Sidebar and menus

- Keep labels short and meaningful.
- Group related destinations.
- Highlight the current location clearly.
- Avoid burying important destinations behind multiple layers.

---

## Tables and Lists

### Data presentation

- Use tables when users need to compare structured data.
- Use lists or cards when scanning is more important than column alignment.
- Do not use tables for content that is not actually tabular.

### Table standards

- Keep headers meaningful.
- Align numeric content consistently.
- Support empty, loading, and no-results states.
- Avoid horizontal overflow unless necessary.
- Keep row interactions obvious and consistent.

### List standards

- Make each item scannable.
- Use hierarchy within each row or card.
- Keep metadata visually subordinate to the main item title.

---

## Empty, Loading, and Error States

Every screen must account for these states.

### Empty states

- Explain why the view is empty.
- Suggest the next action when useful.
- Avoid dead ends.
- Keep the tone helpful and calm.

### Loading states

- Show progress clearly.
- Prefer skeletons or structured placeholders when content is expected.
- Avoid abrupt layout shifts.

### Error states

- Make the problem understandable.
- Tell the user what they can do next.
- Don’t expose internal technical details unless the user can act on them.
- Keep error styling consistent across the app.

---

## Feedback and Motion

### Feedback

- All important actions should acknowledge success, failure, or progress.
- Feedback should be timely and not excessive.
- Toasts and inline feedback should be used intentionally, not everywhere.

### Motion

- Motion should clarify change, not decorate it.
- Keep transitions subtle and fast.
- Avoid motion that slows down routine tasks.
- Respect reduced-motion preferences.

---

## Responsiveness

### Responsive behavior rules

- Design mobile-first unless a desktop-first layout is clearly justified.
- Ensure content wraps gracefully.
- Avoid assuming hover is available.
- Ensure tap targets are large enough.
- Test long labels, translation expansion, and narrow widths.

### Overflow handling

- Handle overflow intentionally.
- Long text should wrap, truncate, or scroll in a controlled way.
- Do not let content break the layout.

---

## Accessibility Standards

Accessibility is not optional.

### Required expectations

- Every interactive element must be keyboard accessible.
- Visible focus indicators must exist and be easy to see.
- Semantic HTML should be preferred over ARIA when possible.
- Images should have appropriate alt text or be decorative.
- Buttons and links must have clear, descriptive labels.

### Color and contrast

- Text must remain readable against its background.
- State differences should not depend on color only.
- Disabled states should remain understandable, not invisible.

### Screen reader support

- Labels and descriptions should be meaningful.
- Announce important state changes when needed.
- Keep the accessible tree clean and intentional.

---

## Content Style

### Writing in the UI

- Use clear, human language.
- Prefer short sentences.
- Avoid jargon where possible.
- Keep labels action-oriented.
- Be consistent in tone.

### Microcopy rules

- Error messages should help the user recover.
- Empty states should guide the next step.
- Helper text should reduce uncertainty.
- Avoid overly playful copy in critical flows.

---

## Dashboard-Specific Guidelines

Since this is a dashboard-style product, prioritize:

- fast scanning
- clear status indicators
- concise summaries
- strong information hierarchy
- efficient navigation
- readable data presentation

Dashboards should feel organized, not busy.

---

## Review Checklist

Before shipping a UI change, ask:

- Is the purpose of the screen immediately clear?
- Is the primary action obvious?
- Is the layout easy to scan?
- Does the design stay consistent with existing patterns?
- Are loading, empty, and error states handled?
- Does it work on mobile and desktop?
- Is it keyboard accessible?
- Are focus states visible?
- Does the UI still work with long content?
- Would this feel polished to a user?

If several answers are uncertain, the UI is not ready yet.

---

## Anti-Patterns

Avoid these patterns:

- decorative complexity without function
- inconsistent spacing or button styles
- too many competing colors
- unclear icon-only actions
- forms with poor feedback
- dense content with no structure
- custom one-off components when a shared pattern exists
- layouts that only work at one screen size
- relying on color alone to communicate meaning
- hiding important actions or status information

---

## Rule of Thumb

If there is a tradeoff between:

- pretty and clear
- novel and consistent
- clever and usable

choose the option that is clearer, more consistent, and easier to use.

## Final Principle

UI should reduce effort for the user.

Every screen should make the next step obvious.