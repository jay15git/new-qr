export function LibraryPageStyles() {
  return (
    <style>{`
      [data-slot="library-page"][data-desktop-theme="dark"] [data-slot="library-shell"] {
        --desktop-inspector-fg-primary: rgba(255, 255, 255, 0.94);
        --desktop-inspector-fg-secondary: rgba(255, 255, 255, 0.72);
        --desktop-inspector-fg-tertiary: rgba(255, 255, 255, 0.56);
        --desktop-inspector-fg-muted: rgba(255, 255, 255, 0.42);
        --desktop-inspector-section-bg: rgba(255, 255, 255, 0.055);
        --desktop-inspector-control-hover-bg: rgba(255, 255, 255, 0.09);
        --desktop-inspector-control-active-bg: rgba(255, 255, 255, 0.13);
        --desktop-inspector-control-border-hover: rgba(255, 255, 255, 0.12);
        --desktop-inspector-option-selected-bg: rgba(255, 255, 255, 0.14);
        --desktop-inspector-option-selected-fg: rgba(255, 255, 255, 0.96);
        --desktop-inspector-field-bg: rgba(0, 0, 0, 0.22);
        --desktop-inspector-focus: rgba(255, 255, 255, 0.36);
        --desktop-inspector-dropdown-bg: rgba(12, 12, 16, 0.9);
        --desktop-inspector-dropdown-border: rgba(255, 255, 255, 0.08);
        --desktop-toolbar-fg: rgba(255, 255, 255, 0.72);
        --desktop-toolbar-fg-hover: rgba(255, 255, 255, 0.94);
        color: var(--desktop-inspector-fg-secondary);
      }

      [data-slot="library-page"][data-desktop-theme="light"] [data-slot="library-shell"] {
        --desktop-inspector-fg-primary: rgba(15, 23, 42, 0.90);
        --desktop-inspector-fg-secondary: rgba(15, 23, 42, 0.62);
        --desktop-inspector-fg-tertiary: rgba(15, 23, 42, 0.48);
        --desktop-inspector-fg-muted: rgba(15, 23, 42, 0.38);
        --desktop-inspector-section-bg: rgba(15, 23, 42, 0.032);
        --desktop-inspector-control-hover-bg: rgba(15, 23, 42, 0.06);
        --desktop-inspector-control-active-bg: rgba(15, 23, 42, 0.1);
        --desktop-inspector-control-border-hover: rgba(15, 23, 42, 0.16);
        --desktop-inspector-option-selected-bg: rgba(255, 255, 255, 0.96);
        --desktop-inspector-option-selected-fg: rgba(15, 23, 42, 0.94);
        --desktop-inspector-field-bg: rgba(255, 255, 255, 0.62);
        --desktop-inspector-focus: rgba(15, 23, 42, 0.36);
        --desktop-inspector-dropdown-bg: rgba(255, 255, 255, 0.84);
        --desktop-inspector-dropdown-border: rgba(15, 23, 42, 0.09);
        --desktop-toolbar-fg: rgba(15, 23, 42, 0.68);
        --desktop-toolbar-fg-hover: rgba(15, 23, 42, 0.9);
        color: var(--desktop-inspector-fg-secondary);
      }

      [data-slot="library-utility-toolbar"] {
        color: var(--desktop-toolbar-fg);
      }

      [data-slot="library-page"][data-desktop-theme="light"] [data-slot="library-utility-toolbar"] {
        background: rgba(255, 255, 255, 0.72) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.86) !important;
      }

      [data-slot="library-utility-toolbar"] button:hover {
        background: rgba(255, 255, 255, 0.11);
        color: var(--desktop-toolbar-fg-hover);
      }

      [data-slot="library-page"][data-desktop-theme="light"] [data-slot="library-utility-toolbar"] button:hover {
        background: rgba(15, 23, 42, 0.08) !important;
        color: var(--desktop-toolbar-fg-hover) !important;
      }
    `}</style>
  )
}
