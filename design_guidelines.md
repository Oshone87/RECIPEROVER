# Crypto Investment Platform - Design Guidelines

## Design Approach: Reference-Based (Financial Platforms)

**Primary References:** Coinbase, Robinhood, Stripe Dashboard
**Reasoning:** Financial platforms require trust, clarity, and professional aesthetics while maintaining modern visual appeal. Users need confidence in data accuracy and security.

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- **Background:** 222 15% 8% (deep charcoal)
- **Surface:** 222 12% 12% (elevated cards)
- **Primary Brand:** 220 90% 56% (professional blue - trust & stability)
- **Success/Growth:** 142 76% 45% (vibrant green for positive metrics)
- **Warning/Caution:** 38 92% 50% (amber for important notices)
- **Text Primary:** 0 0% 98%
- **Text Secondary:** 0 0% 65%

**Light Mode:**
- **Background:** 0 0% 98%
- **Surface:** 0 0% 100%
- **Primary Brand:** 220 90% 56% (consistent blue)
- **Text Primary:** 222 15% 8%

### B. Typography

**Font Family:**
- Primary: Inter (Google Fonts) - modern, readable for financial data
- Numeric: JetBrains Mono (for precise financial figures, crypto addresses)

**Scale:**
- Hero Headlines: text-5xl to text-6xl, font-bold
- Section Headers: text-3xl to text-4xl, font-semibold
- Card Titles: text-xl, font-semibold
- Body Text: text-base (16px)
- Financial Data: text-lg to text-2xl, font-mono
- Helper Text: text-sm, text-gray-400

### C. Layout System

**Spacing Units:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 or p-8
- Section spacing: py-12 to py-20 (desktop), py-8 to py-12 (mobile)
- Card gaps: gap-6 or gap-8

**Container Widths:**
- Full sections: max-w-7xl
- Dashboard content: max-w-6xl
- Forms/modals: max-w-md to max-w-lg

---

## Component Library

### 1. Landing Page

**Hero Section:**
- Height: 85vh minimum
- Large background image: Abstract crypto/finance imagery with dark gradient overlay (180deg, from rgba(0,0,0,0.7) to rgba(0,0,0,0.5))
- Centered content with bold headline (text-5xl), subheadline (text-xl), and primary CTA
- Floating trust indicators: "Trusted by 50K+ investors" badge

**Tier Cards (Silver/Gold/Platinum):**
- Grid: grid-cols-1 md:grid-cols-3 gap-8
- Glass-morphism effect: backdrop-blur-sm with subtle border
- Each card: minimum 280px width, p-8, rounded-2xl
- Highlight: Platinum tier with subtle glow effect (shadow-xl shadow-blue-500/20)
- Content hierarchy: Tier name → Minimum investment → APR (largest, color-coded green) → Feature list → CTA button

**Live Chart Preview:**
- Full-width container with max-w-5xl
- Chart height: 400px on desktop, 280px mobile
- Dark theme with grid lines (rgba(255,255,255,0.05))
- Asset selector tabs above chart

**How It Works Section:**
- 3-step horizontal flow with numbered badges
- Icons in circular containers (w-16 h-16)
- Arrow connectors between steps (hidden on mobile, shown on desktop)

### 2. Dashboard Layout

**Top Stats Bar:**
- Full-width with gradient background (from-blue-600 to-blue-700)
- Display: Total Balance (large, text-4xl), Available Balance, Active Investments
- "Deposit Funds" primary button (top-right)

**Main Content (2-Column on Desktop):**
- **Left (60%):** Large live chart (600px height minimum)
  - Asset switcher tabs (BTC/ETH/USDT) above chart
  - Timeframe selector (1D, 7D, 30D, 1Y)
- **Right (40%):** Portfolio snapshot cards
  - Active investments list with progress bars
  - Upcoming payouts calendar view

**Transaction History:**
- Full-width table below main content
- Alternating row colors for readability
- Columns: Date, Type, Asset, Amount, Status (with color-coded badges)

### 3. Investment Flow Modal

**Layout:**
- Centered modal: max-w-2xl, backdrop-blur-md background
- Multi-step indicator at top (Step 1/4, 2/4, etc.)
- Progress bar showing completion

**Step Screens:**
- Step 1: Tier cards (smaller, horizontal layout)
- Step 2: Amount input with large numpad-style number input
- Step 3: Asset selection (BTC/ETH/USDC cards with logos)
- Step 4: Period slider with live calculation display
- Summary panel (sticky): Shows selected tier, amount, asset, returns estimate

### 4. Forms (Login/Signup)

**Layout:**
- Centered card: max-w-md, p-8 to p-12
- Logo at top, form title below
- Input fields: h-12, rounded-lg, with focus ring (ring-2 ring-blue-500)
- Submit button: Full-width, h-12
- Links: "Forgot password?" and "Sign up" in muted color

### 5. Admin Page

**Table Layout:**
- Full-width with horizontal scroll on mobile
- Header: sticky top-0 with darker background
- Status badges: Rounded-full, px-3 py-1 with color coding
  - KYC Approved: green
  - Pending: amber
  - Rejected: red

---

## Images

**Hero Section:**
- Large hero image (1920x1080 minimum)
- Subject: Abstract cryptocurrency visualization, blockchain nodes, or digital finance concept
- Treatment: Dark overlay gradient for text legibility
- Position: background-cover, center

**Tier Cards (Optional):**
- Small icons or abstract patterns representing each tier
- Silver: Metallic silver gradient
- Gold: Warm gold gradient
- Platinum: Cool platinum/chrome gradient

**Dashboard:**
- No large images; focus on data visualization and charts
- Small crypto logos for asset selection (BTC, ETH, USDT)

---

## UI Patterns

### Data Visualization
- **Charts:** Dark theme with minimal gridlines, prominent candlesticks (green up, red down)
- **Metrics Cards:** Large number (text-3xl), label below (text-sm), optional trend indicator (arrow + percentage)

### Interactive Elements
- **Buttons:** rounded-lg, h-11 or h-12, font-medium
  - Primary: bg-blue-600 hover:bg-blue-700
  - Secondary: border border-gray-700 hover:bg-gray-800
  - On images: backdrop-blur-md with translucent background
- **Cards:** rounded-xl to rounded-2xl, transition-all duration-200, hover:shadow-xl
- **Inputs:** h-12, rounded-lg, bg-gray-900 (dark mode), focus:ring-2

### Animations
- **Minimal Usage:** Subtle hover lifts (transform scale-105), fade-ins for modals
- **Chart Animations:** Smooth line drawing on load
- **NO:** Auto-playing animations, parallax effects, or distracting motion

---

## Responsive Behavior

**Breakpoints:**
- Mobile-first approach
- md: 768px (tier cards 1→3 columns, dashboard 1→2 columns)
- lg: 1024px (full desktop layout)

**Mobile Optimizations:**
- Stack all multi-column layouts to single column
- Chart height: 280px (vs 600px desktop)
- Sticky navigation header
- Bottom sheet modals instead of centered

---

## Trust & Security Signals

- SSL badge in footer
- "Bank-level encryption" indicator near login
- Two-factor authentication badge (even if not implemented)
- Display regulatory compliance logos (placeholder)
- Timestamp all transactions with timezone