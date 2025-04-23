# Cypress Component Testing

## CSS Handling

The original global CSS file (`/src/ui/style/global.css`) uses advanced CSS features that require the `lightningcss` module for processing. This can cause issues when running Cypress component tests, as the module might not be properly installed or might have compatibility issues with certain environments.

To address this, we've created a simplified version of the global CSS file specifically for Cypress component tests (`cypress-global.css`). This file contains basic styles that mimic the essential parts of the original global.css file but without the advanced CSS features that require lightningcss.

### Tailwind CSS

If your components rely on Tailwind CSS classes, you may need to:

1. Import Tailwind CSS separately in your component tests
2. Add specific utility classes needed for your tests to the `cypress-global.css` file
3. Use inline styles or class-based styling in your component tests

### Troubleshooting

If you encounter CSS-related issues when running Cypress component tests:

1. Make sure `lightningcss` is installed as a dev dependency in your project
2. Check if the simplified CSS file (`cypress-global.css`) includes all the styles needed for your components
3. Consider adding more styles to the simplified CSS file as needed

### Original Error

This solution addresses the following error:

```
Error: Cannot find module '../lightningcss.darwin-arm64.node'
```

which occurs when Cypress tries to process the original global CSS file with advanced CSS features.
