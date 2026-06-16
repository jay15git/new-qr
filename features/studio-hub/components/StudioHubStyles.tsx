export function StudioHubStyles() {
  return (
    <style>{`
      [data-slot="studio-hub"][data-desktop-theme="dark"] [data-slot="studio-hub-shell"],
      [data-slot="studio-hub"][data-desktop-theme="dark"] [data-slot="studio-hub-header"] {
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

      [data-slot="studio-hub"][data-desktop-theme="light"] [data-slot="studio-hub-shell"],
      [data-slot="studio-hub"][data-desktop-theme="light"] [data-slot="studio-hub-header"] {
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

      [data-slot="studio-hub"] {
        background-image: radial-gradient(
          circle at 1px 1px,
          color-mix(in oklab, var(--desktop-inspector-fg-muted) 28%, transparent) 1px,
          transparent 0
        );
        background-size: 24px 24px;
      }

      [data-slot="studio-library-strip"] {
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        mask-image: linear-gradient(
          to right,
          transparent,
          black 12px,
          black calc(100% - 12px),
          transparent
        );
      }

      [data-slot="studio-library-strip"]::-webkit-scrollbar {
        display: none;
      }

      [data-slot="studio-hub-scrollbar"][data-state="hidden"] {
        opacity: 0;
      }

      [data-slot="studio-hub-scrollbar"] {
        transition: opacity 150ms ease;
      }

      [data-slot="studio-hub-scroll-thumb"] {
        background: rgba(255, 255, 255, 0.24);
      }

      [data-slot="studio-hub-scroll-thumb"]:hover {
        background: rgba(255, 255, 255, 0.38);
      }

      [data-slot="studio-hub"][data-desktop-theme="light"] [data-slot="studio-hub-scroll-thumb"] {
        background: rgba(15, 23, 42, 0.24);
      }

      [data-slot="studio-hub"][data-desktop-theme="light"] [data-slot="studio-hub-scroll-thumb"]:hover {
        background: rgba(15, 23, 42, 0.38);
      }
    `}</style>
  )
}
