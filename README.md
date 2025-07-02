# @arcmantle/vite-plugin-ce-auto-import

A Vite plugin that automatically imports required web components based on their usage in your code. This plugin scans your source files for custom element tags and automatically injects the necessary import statements, eliminating the need to manually import each web component.

## Features

- 🔍 **Automatic Detection**: Scans files for custom element usage and automatically imports required components
- 🏷️ **Multiple Tag Patterns**: Supports `@customElement`, `@injectableElement`, and `customElements.define` patterns
- 📁 **Directory-based**: Configurable directories to scan for component definitions
- 🎯 **Prefix Filtering**: Filter components by tag name prefixes (e.g., `mm-`, `pl-`)
- ⚡ **Smart Caching**: Built-in caching system for improved performance
- 🎛️ **Flexible Configuration**: Whitelist/blacklist patterns for both component scanning and file processing

## Installation

```bash
npm install @arcmantle/vite-plugin-ce-auto-import
# or
pnpm add @arcmantle/vite-plugin-ce-auto-import
# or
yarn add @arcmantle/vite-plugin-ce-auto-import
```

## Usage

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { componentAutoImporter } from '@arcmantle/vite-plugin-ce-auto-import';

export default defineConfig({
  plugins: [
    componentAutoImporter({
      directories: [{ path: './src/components' }],
      prefixes: [/mm-/],
      loadWhitelist: [/\.ts$/],
      loadBlacklist: [/\.demo/],
    }),
  ],
});
```

## Configuration

### AutoImportPluginProps

| Property | Type | Description |
|----------|------|-------------|
| `directories` | `Array<{ path: string; whitelist?: RegExp[]; blacklist?: RegExp[]; }>` | Directories to scan for component definitions |
| `prefixes` | `RegExp[]` | Array of regex patterns to match tag name prefixes |
| `loadWhitelist` | `RegExp[]` | Files that should be processed by the plugin |
| `loadBlacklist` | `RegExp[]` | Files that should be excluded from processing |
| `cache` | `Map<string, string>` | Optional custom cache for tag-to-file mappings |

### Directory Configuration

Each directory entry supports:

- `path`: The directory path to scan
- `whitelist`: Optional array of regex patterns for files to include
- `blacklist`: Optional array of regex patterns for files to exclude

## How It Works

1. **Build Start**: The plugin scans specified directories for component definitions using these patterns:
   - `@customElement('tag-name')`
   - `@injectableElement('tag-name')`
   - `customElements.define('tag-name', ...)`

2. **File Processing**: When processing files, the plugin:
   - Checks if the file matches whitelist/blacklist criteria
   - Scans for closing tags matching configured prefixes (e.g., `</mm-button>`)
   - Looks up component import paths from the cache
   - Injects import statements at the top of the file

3. **Import Injection**: Generated imports look like:

   ```typescript
   /* Component imports injected from: @arcmantle/vite-plugin-ce-auto-import */
   import './components/button/button.component.js';
   import './components/dialog/dialog.component.js';
   /*  */

   // Your original code here...
   ```

## Examples

### Basic Configuration

```typescript
componentAutoImporter({
  directories: [{ path: './src/components' }],
  prefixes: [/my-/],
  loadWhitelist: [/\.(ts|js)$/],
})
```

### Advanced Configuration

```typescript
componentAutoImporter({
  directories: [
    {
      path: './src/components',
      whitelist: [/\.component\.ts$/],
      blacklist: [/\.test\.ts$/]
    },
    {
      path: './src/widgets',
      whitelist: [/\.widget\.ts$/]
    }
  ],
  prefixes: [/mm-/, /widget-/],
  loadWhitelist: [/\.ts$/],
  loadBlacklist: [/\.demo\.ts$/, /\.test\.ts$/],
})
```

### Multiple Prefixes

```typescript
componentAutoImporter({
  directories: [{ path: './src' }],
  prefixes: [
    /^app-/,      // matches app-header, app-footer
    /^ui-/,       // matches ui-button, ui-input
    /^layout-/,   // matches layout-grid, layout-flex
  ],
  loadWhitelist: [/\.ts$/],
})
```

## Component Definition Patterns

The plugin recognizes these component definition patterns:

### @customElement Decorator

```typescript
import { customElement } from 'lit/decorators.js';

@customElement('my-button')
export class MyButton extends LitElement {
  // component implementation
}
```

### @injectableElement Decorator

```typescript
import { injectableElement } from '@arcmantle/lit-utilities';

@injectableElement('my-dialog')
export class MyDialog extends LitElement {
  // component implementation
}
```

### customElements.define

```typescript
customElements.define('my-input', class extends HTMLElement {
  // component implementation
});
```

## Use Cases

### Component Libraries

Perfect for component libraries where you want automatic imports:

```typescript
// Before: Manual imports required
import './components/button.js';
import './components/input.js';
import './components/dialog.js';

// Your template using the components
const template = html`
  <my-button>Click me</my-button>
  <my-input placeholder="Enter text"></my-input>
  <my-dialog>Modal content</my-dialog>
`;

// After: Automatic imports based on usage
const template = html`
  <my-button>Click me</my-button>
  <my-input placeholder="Enter text"></my-input>
  <my-dialog>Modal content</my-dialog>
`;
// Imports are automatically injected!
```

### Large Applications

For applications with many custom elements across multiple directories:

```typescript
componentAutoImporter({
  directories: [
    { path: './src/components' },      // UI components
    { path: './src/widgets' },         // Complex widgets
    { path: './src/pages' },          // Page-level components
  ],
  prefixes: [/app-/, /ui-/, /page-/],
  loadWhitelist: [/\.(ts|js)$/],
  loadBlacklist: [/\.test\.(ts|js)$/, /\.stories\.(ts|js)$/],
})
```

## Performance

- **Caching**: The plugin uses intelligent caching to avoid re-scanning unchanged files
- **Selective Processing**: Only processes files matching whitelist criteria
- **Build-time**: All scanning happens at build time, no runtime overhead

## Requirements

- Node.js >= 22
- Vite >= 7.0.0

## Dependencies

- **globby**: Fast glob matching for directory scanning
- **oxc-walker**: High-performance JavaScript/TypeScript AST walker
- **magic-string**: Efficient string manipulation with source maps

## License

Apache-2.0

## Contributing

This package is part of the Arcmantle Weave monorepo. Contributions are welcome!
