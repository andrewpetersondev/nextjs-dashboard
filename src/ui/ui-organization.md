Here’s a pragmatic way to organize src/ui when you’re already moving most feature components under features/<feature>/components. The goal: keep src/ui as a lightweight, feature-agnostic “design system” and shared composition layer.

Guiding principles
- Feature-owned UI lives in features/<feature>/components (and only used by that feature).
- src/ui contains generic, reusable, feature-agnostic building blocks.
- Pages (src/app) compose feature components and shared UI.
- No cross-feature imports. If a component becomes reused by multiple features, promote it from features/* to src/ui.

Recommended structure for src/ui
- atoms/: lowest-level primitives, no app-specific logic
    - Button, Input, Select, TextArea
    - Typography (H1/H2/H3, Text)
    - Badge, Avatar, Tooltip
- molecules/: small compositions of atoms
    - FormField, LabeledInput, SearchBox
    - ModalHeader/Footer, CardHeader/Body
- layout/: page-wide layout primitives
    - Container, Grid, Stack, Divider, PageHeader, Sidebar
- navigation/: reusable navigation pieces
    - Breadcrumbs, Tabs, Pagination, Menu, NavLink
- data-display/: generic visualizations that don’t know domain
    - Table (head/body/cell), EmptyState, Stat, Progress, TagList
- feedback/: status and loading UI
    - Spinner, Skeleton, Toast/Alert, ErrorBoundary, RetryBoundary
- overlays/: dialogs and drawers
    - Modal, Drawer, Popover, Dialog, ConfirmDialog
- forms/: generic form wiring
    - Form, Fieldset, FormError, SubmitButton
- media/: images and icons wrappers
    - ImageWithFallback, Icon wrapper (if you standardize icon props)
- utilities/: small helpers that are UI-only
    - VisuallyHidden, ClientOnly, Portal
- styles/: global CSS, theme tokens, CSS vars, tailwind config adapters
- providers/: UI context and top-level providers
    - ThemeProvider, TooltipProvider, DialogProvider
- patterns/ (optional): reusable, app-tailored but still feature-agnostic compositions
    - ResourceList, ResourceCard, MasterDetail, Wizard

Example layout
```plain text
src/ui/
  atoms/
    button.tsx
    input.tsx
    typography/
      h1.tsx
      h2.tsx
      h3.tsx
  molecules/
    form-field.tsx
    search-box.tsx
  layout/
    container.tsx
    grid.tsx
    page-header.tsx
  navigation/
    breadcrumbs.tsx
    pagination.tsx
    tabs.tsx
  data-display/
    table/
      table.tsx
      table-head.tsx
      table-row.tsx
      table-cell.tsx
    empty-state.tsx
    stat.tsx
  feedback/
    spinner.tsx
    skeleton.tsx
    alert.tsx
  overlays/
    modal.tsx
    drawer.tsx
    dialog.tsx
  forms/
    form.tsx
    form-error.tsx
    submit-button.tsx
  providers/
    theme-provider.tsx
  utilities/
    visually-hidden.tsx
    client-only.tsx
  styles/
    theme.css
```


What moves out of src/ui into features
- Anything that knows about a domain type (Invoice, Customer, Revenue, etc.).
- Smart components that fetch feature data.
- Visualizations with domain-specific mapping (e.g., “RevenueChart” that expects revenue buckets).
- Feature dashboards/panels that bind to feature DTOs.

Naming and import conventions
- Prefer PascalCase for components; kebab or dot-suffixes for variants if needed (button.primary.tsx).
- Keep one component per file unless it’s tightly coupled subcomponents.
- Use index.ts barrels inside each folder for clean imports:
    - export * from "./button"
    - export * from "./table"
- Keep types next to the component if they are UI-only. If multiple components share a UI type, put it in the nearest shared folder (e.g., data-display/types.ts).

Co-location and tests
- Tests and stories live next to the component:
    - button.tsx
    - button.test.tsx
    - button.stories.tsx
- CSS-in-JS or module.css files co-located with the component if not using Tailwind exclusively.

Promotion/demotion workflow
- Start in features/<feature>/components.
- If another feature needs it and the component is domain-agnostic, move it to src/ui and replace feature imports.
- If a src/ui component accrues domain knowledge, move it back under a feature (or extract a generic core to src/ui and keep a thin domain wrapper in the feature).

Page composition rule of thumb
- src/app routes import:
    - feature components from features/<feature>/components
    - generic UI from src/ui
- Keep cross-feature composition in route or higher-level layout components, not inside features.

A few practical tips
- Prefer generic props in src/ui; pass domain values already formatted or mapped from the feature layer.
- For loading UX, place generic Skeletons/Spinners in src/ui/feedback and compose feature-specific skeletons in features/* if necessary.
- If you adopt a headless UI approach, place headless primitives in src/ui and theme-specific wrappers (if any) alongside them.

If you share a small sample of what’s currently under src/ui, I can map each file to its likely target and provide a concrete migration checklist.
