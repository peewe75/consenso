# Design System Strategy: The Sovereign Interface

### 1. Overview & Creative North Star
The design system is built upon the Creative North Star of **"The Digital Vault."** In a world of volatile data and intrusive interfaces, this system treats user privacy as a sacred, tangible asset. We move beyond the "app" feel toward an editorial, high-end PWA experience that conveys authority and calm.

The visual language rejects the frantic, "flat" aesthetic of modern web apps. Instead, we use **Atmospheric Depth**: a sophisticated layering of deep indigo surfaces, high-contrast editorial typography, and intentional asymmetry. By utilizing extreme typographic scales and "Ghost Borders," we create an interface that feels carved out of light and shadow rather than constructed with boxes.

---

### 2. Colors & Surface Architecture
We utilize a monochromatic base of deep charcoals and indigos to maintain a "Dark Mode Only" premium feel. 

- **The "No-Line" Rule:** Standard 1px solid dividers are strictly prohibited for sectioning. To separate content, designers must use the **Spacing Scale** (e.g., `spacing.8`) or a shift in surface tokens.
- **Surface Hierarchy & Nesting:** Treat the UI as physical layers.
    - **Base:** `background` (#131318).
    - **Sectioning:** `surface_container_low` (#1B1B20).
    - **Interaction Cards:** `surface_container` (#1F1F24).
    - **Floating Elements:** `surface_bright` (#39393E).
- **The "Glass & Gradient" Rule:** All primary cards must utilize the `surface` linear gradient (180deg, #22223A to #1A1A24). To create a "Sovereign" feel, apply a `backdrop-blur` of 12px to floating modals, allowing the background radial indigo glow (18% opacity) to bleed through the interface.
- **Signature Textures:** Main CTAs should not be flat. Use a subtle inner-glow gradient from `primary` (#C0C1FF) to `primary_container` (#8083FF) to give buttons a tactile, "lit from within" quality.

---

### 3. Typography: Editorial Authority
We use **Inter** exclusively, but we treat it with the discipline of a printed broadsheet.

- **Display & Headlines:** The `display-lg` (56px) is our signature. Use it with a `0.95` line-height and `bold` weight. It should feel massive and authoritative, often bleeding toward the edge of the screen to create intentional asymmetry.
- **Body & Utility:** `body-lg` (16px) is the standard for trust. For legal disclaimers and metadata, use `label-sm` (11px) with increased letter spacing (+0.02em) to maintain legibility.
- **Hierarchy of Trust:** Bold, oversized headlines convey "The Truth." Small, widely-spaced labels convey "The Detail." This contrast is what makes the system feel premium.

---

### 4. Elevation & Depth
In this system, elevation is a product of light, not just shadows.

- **The Layering Principle:** Depth is achieved by "stacking" surface tiers. Place a `surface_container_lowest` (#0E0E13) input field inside a `surface_container` (#1F1F24) card to create a recessed, high-fidelity look.
- **Ambient Shadows:** For floating elements, use a "Shadow-Glow." Instead of black, use a `primary` tinted shadow at 6% opacity with a 40px blur. This mimics the glow of a high-end OLED display.
- **The "Ghost Border":** While the user request specifies 1px borders, these must be implemented as "Ghost Borders" using `outline_variant` (#464554) at **20% opacity**. This provides a structure that is felt rather than seen, maintaining the "Calm" aesthetic.

---

### 5. Components

#### The ConsentButton (Signature Component)
The centerpiece of the experience. A large circular button (min 80x80px) utilizing a dual-ring system.
- **Outer Ring:** A 1.8px stroke `primary` ring that fills clockwise as the user holds/interacts.
- **Inner Core:** A `surface_bright` glassmorphic circle with a Lucide-style "Shield" icon.
- **State:** On completion, the ring transitions to `tertiary` (Success #4EDEA3) with a haptic pulse.

#### Buttons (Pill-Shaped)
- **Primary:** `min-h: 56px`, `rounded-full`. Background: Gradient (Indigo). Text: `on_primary`.
- **Secondary:** `min-h: 56px`, `rounded-full`. Background: Transparent with a 1px Ghost Border. 
- **Tertiary:** Text-only, `label-md` weight, used for "Cancel" or "Go Back" actions.

#### High-Fidelity Inputs
- **Radius:** `rounded.DEFAULT` (1rem/16px).
- **Style:** Background `surface_container_lowest`. On focus, the Ghost Border increases to 40% opacity with a subtle `primary` outer glow.
- **Labels:** Always use `label-md` floating 8px above the input field. Never use placeholders as labels.

#### Cards & Lists
- **Radius:** 24px - 30px (`rounded.lg` or `rounded.md`).
- **Separation:** Strictly forbid dividers. Use a `spacing.4` gap between card elements. If a list is dense, use alternating `surface_container` and `surface_container_low` backgrounds.

---

### 6. Do's and Don'ts

#### Do:
- **Use White Space as a Tool:** Give the 56px headlines room to breathe. Don't crowd the top of the screen.
- **Embrace Asymmetry:** Align primary text to the left but allow the ConsentButton to sit off-center or centered-bottom for ergonomic reach.
- **Haptic Intentionality:** Every interaction with a component should feel "heavy" and meaningful.

#### Don't:
- **Don't use 100% Opaque Borders:** This breaks the "Digital Vault" immersion.
- **Don't use Pure Black:** Always use `background` (#131318) to keep the indigo-depth alive.
- **Don't use sharp corners:** Privacy is soft and protective; ensure all corners adhere to the `Roundedness Scale`.