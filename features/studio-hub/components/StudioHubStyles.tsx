export function StudioHubStyles() {
  return (
    <style>{`
      [data-slot="studio-hub"][data-desktop-theme="dark"] [data-slot="studio-hub-shell"],
      [data-slot="studio-hub"][data-desktop-theme="dark"] [data-slot="studio-hub-header"],
      body:has([data-slot="studio-hub"][data-desktop-theme="dark"]) {
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
        --desktop-inspector-dropdown-bg: rgb(23, 24, 29);
        --desktop-inspector-dropdown-border: rgba(255, 255, 255, 0.08);
        --desktop-toolbar-fg: rgba(255, 255, 255, 0.72);
        --desktop-toolbar-fg-hover: rgba(255, 255, 255, 0.94);
        --drafting-shadow-rest: 0 0 18px 2px #00000010, 0 3px 8px 1px #00000009;
        --drafting-shadow-hover: 0 0 24px 3px #00000016, 0 4px 10px 1px #0000000e;
        --drafting-option-card-bg: #101216;
        --drafting-option-card-shadow-rest: 0 0 10px 0 #00000010, 0 2px 4px 0 #00000009;
        --drafting-option-card-shadow-hover: 0 0 16px 1px #00000014, 0 3px 8px 0 #0000000c;
        color: var(--desktop-inspector-fg-secondary);
      }

      [data-slot="studio-hub"][data-desktop-theme="light"] [data-slot="studio-hub-shell"],
      [data-slot="studio-hub"][data-desktop-theme="light"] [data-slot="studio-hub-header"],
      body:has([data-slot="studio-hub"][data-desktop-theme="light"]) {
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
        --desktop-inspector-dropdown-bg: rgb(255, 255, 255);
        --desktop-inspector-dropdown-border: rgba(15, 23, 42, 0.09);
        --desktop-toolbar-fg: rgba(15, 23, 42, 0.68);
        --desktop-toolbar-fg-hover: rgba(15, 23, 42, 0.9);
        --drafting-shadow-rest: 0 0 10px 0 rgb(0 0 0 / 0.05), 0 2px 4px 0 rgb(0 0 0 / 0.03);
        --drafting-shadow-hover: 0 0 18px 1px rgb(0 0 0 / 0.07), 0 4px 10px 0 rgb(0 0 0 / 0.04);
        --drafting-option-card-bg: #ffffff;
        --drafting-option-card-shadow-rest: 0 0 10px 0 rgb(0 0 0 / 0.08), 0 2px 4px 0 rgb(0 0 0 / 0.06);
        --drafting-option-card-shadow-hover: 0 0 16px 1px rgb(0 0 0 / 0.1), 0 3px 8px 0 rgb(0 0 0 / 0.08);
        color: var(--desktop-inspector-fg-secondary);
      }

      body:has([data-slot="studio-hub"]) [data-slot="hub-dropdown-menu"] {
        background: var(--drafting-option-card-bg) !important;
        border-color: transparent !important;
        color: var(--desktop-inspector-fg-secondary) !important;
        box-shadow: var(--drafting-option-card-shadow-rest) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        --tw-ring-color: transparent !important;
      }

      body:has([data-slot="studio-hub"]) [data-slot="hub-dropdown-menu"] [data-slot="dropdown-menu-item"] {
        color: var(--desktop-inspector-fg-tertiary) !important;
      }

      body:has([data-slot="studio-hub"]) [data-slot="hub-dropdown-menu"] [data-slot="dropdown-menu-item"] svg {
        color: currentColor !important;
      }

      body:has([data-slot="studio-hub"]) [data-slot="hub-dropdown-menu"] [data-slot="dropdown-menu-item"]:is(:focus, [data-highlighted]) {
        background-color: var(--desktop-inspector-control-hover-bg) !important;
        color: var(--desktop-inspector-fg-primary) !important;
      }

      body:has([data-slot="studio-hub"]) [data-slot="hub-dropdown-menu"] [data-slot="dropdown-menu-item"]:is(:focus, [data-highlighted]) * {
        color: inherit !important;
      }

      body:has([data-slot="studio-hub"]) [data-slot="hub-dropdown-menu"] [data-slot="dropdown-menu-item"][data-hub-item-active] {
        background-color: var(--desktop-inspector-option-selected-bg) !important;
        color: var(--desktop-inspector-option-selected-fg) !important;
      }

      body:has([data-slot="studio-hub"]) [data-slot="hub-dropdown-menu"] [data-slot="dropdown-menu-item"][data-hub-item-active]:is(:focus, [data-highlighted]) {
        background-color: var(--desktop-inspector-option-selected-bg) !important;
        color: var(--desktop-inspector-option-selected-fg) !important;
      }

      [data-slot="studio-hub"] [data-slot="studio-library-empty"],
      [data-slot="studio-hub"] [data-slot="library-empty-state"],
      [data-slot="studio-hub"] [data-slot="library-no-matches"] {
        border-color: transparent !important;
        border-style: solid !important;
        background: var(--desktop-inspector-section-bg) !important;
        box-shadow: var(--drafting-shadow-rest) !important;
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
