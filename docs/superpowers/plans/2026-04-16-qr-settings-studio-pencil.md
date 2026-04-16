# QR Settings Studio Pencil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first high-fidelity Pencil design for the QR settings split-studio workspace described in the approved design spec.

**Architecture:** Create a desktop-only Pencil composition that establishes the page shell, section rail, preview stage, and active control panel, then layer in the most important interaction states: `Content`, `Style` with expanded gradients, and `Logo` with upload state. Keep the artifact focused on layout, hierarchy, and control mapping rather than exhaustive component permutations.

**Tech Stack:** Pencil MCP, `.pen` document operations, design spec in `docs/superpowers/specs/2026-04-16-qr-settings-studio-design.md`

---

### Task 1: Set Up The Pencil Workspace

**Files:**
- Read: `docs/superpowers/specs/2026-04-16-qr-settings-studio-design.md`
- Create or update: active Pencil document for the QR settings studio concept

- [ ] **Step 1: Inspect the active Pencil editor and available schema**

Read the active editor state and schema so the design uses valid node types, layout properties, and existing document context.

- [ ] **Step 2: Establish a desktop artboard for the studio**

Create or reuse a top-level frame sized for desktop presentation and name it clearly for this concept, such as `QR Settings Studio`.

- [ ] **Step 3: Set the base page atmosphere**

Apply a warm editorial background, generous outer padding, and a wide horizontal layout that supports left navigation, center preview, and right controls.

### Task 2: Build The Persistent Studio Shell

**Files:**
- Update: active Pencil document

- [ ] **Step 1: Create the left rail**

Add a narrow vertical navigation area with the six sections in order: `Content`, `Style`, `Corners`, `Background`, `Logo`, `Encoding`. Mark `Content` as active and style the rail quietly.

- [ ] **Step 2: Create the center preview stage**

Add a large preview surface with a framed QR display area, a subdued metadata row, and nearby actions for export/reset placement.

- [ ] **Step 3: Create the right control panel shell**

Add a structured editing panel with a section heading area, descriptive text, grouped control rows, and inset zones for advanced controls.

### Task 3: Design The Content Section State

**Files:**
- Update: active Pencil document

- [ ] **Step 1: Populate the right panel for `Content`**

Lay out inputs for text/URL, render type, width, height, and outer margin using a premium control hierarchy rather than generic stacked cards.

- [ ] **Step 2: Tune spacing and visual hierarchy**

Refine labels, support text, row groupings, and field sizing so the panel reads as composed and immediately understandable.

### Task 4: Add The Style And Logo Key States

**Files:**
- Update: active Pencil document

- [ ] **Step 1: Duplicate the shell for a `Style` state**

Create a second frame or variant that keeps the same shell but swaps the active section to `Style`.

- [ ] **Step 2: Show expanded gradient controls**

Populate the right panel with dot style, color, gradient toggle, type, rotation, and two-stop gradient controls in an elegant expanded state.

- [ ] **Step 3: Duplicate the shell for a `Logo` state**

Create a third frame or variant with `Logo` active and the right panel populated for the image workflow.

- [ ] **Step 4: Show populated upload state**

Represent source mode, upload area, current asset state, size, margin, and image treatment toggles so the logo workflow is visually clear.

### Task 5: Represent The Remaining Sections And Review

**Files:**
- Update: active Pencil document

- [ ] **Step 1: Add lightweight representations for `Corners`, `Background`, and `Encoding`**

Show enough of each section in the shell or adjacent variants that the system coverage is visible without fully detailing every state.

- [ ] **Step 2: Review the overall document against the approved spec**

Check that the design clearly reads as a premium studio, preserves the existing control categories, and keeps the preview central.

- [ ] **Step 3: Capture a screenshot or otherwise inspect the result visually**

Use Pencil screenshot output to verify balance, spacing, and readability before presenting it to the user.

