# eui-cli

A terminal lookup tool for [Elastic UI (EUI)](https://eui.elastic.co) components. Search any component from the Cursor terminal, get the import, key props, variants, and a direct docs link — all without leaving the editor.

## Install

```bash
git clone https://github.com/your-username/eui-cli.git
cd eui-cli
npm install
chmod +x eui.js
npm link
```

## Usage

```bash
eui <component>
```

**Examples**

```bash
eui button
eui flyout
eui modal
eui empty state
eui flex --all      # show all flex-related components
eui --list          # browse everything by category
```

**What you get**

```
EuiFlyout  Containers

Import
import { EuiFlyout, EuiFlyoutHeader, EuiFlyoutBody, EuiFlyoutFooter } from '@elastic/eui';
// https://eui.elastic.co/docs/components/containers/flyout/

Key props
onClose=function   required — fired on dismiss
type='overlay'|'push'  overlay or push layout mode
size='s'|'m'|'l'|number  panel width
...

Variants
1. Overlay (default)   covers page with mask, traps focus
2. Push                page stays interactive, adds body padding
3. Resizable           drag handle to resize width
...

Docs  https://eui.elastic.co/docs/components/containers/flyout/

import + docs copied

Copy variant reference? (1, 2, 3 · enter to skip) › 2

✓ Push
Use the Push variant of EuiFlyout — type="push" keeps the page interactive
by adding body padding instead of an overlay mask.
Docs: https://eui.elastic.co/docs/components/containers/flyout/#push-flyout
```

The **import + docs URL are always copied to clipboard** automatically. If you pick a variant number, the clipboard is updated with the import, a plain-English description of that variant, and the direct docs anchor — ready to paste into Cursor.

## How it works in Cursor

1. Open the terminal inside Cursor with `` Cmd+` ``
2. Run `eui <component>`
3. Read the output, pick a variant if needed
4. `Cmd+V` anywhere in your code or the Cursor chat

## Adding components or variants

The entire catalogue lives in `eui-index.json`. Each entry follows this shape:

```json
"EuiMyComponent": {
  "import": "import { EuiMyComponent } from '@elastic/eui';",
  "docs": "https://eui.elastic.co/docs/components/...",
  "category": "Layout",
  "aliases": ["my component", "alternate search term"],
  "keyProps": [
    { "name": "propName", "values": "'a'|'b'", "desc": "what it does" }
  ],
  "variants": [
    {
      "name": "Variant name",
      "desc": "short description shown in the list",
      "url": "https://eui.elastic.co/docs/components/.../#anchor",
      "note": "Use EuiMyComponent with ... — plain English instruction for Cursor."
    }
  ]
}
```

No code changes needed — just edit the JSON and the CLI picks it up immediately.

## Coverage

59 components · 215 variants across Layout, Containers, Navigation, Display, Forms, Tables, Data Grid, Templates, and Editors.
