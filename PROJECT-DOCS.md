# Brownza — Project Documentation

Generated as a reference for briefing another AI assistant on this codebase.
When asking for help elsewhere, paste the relevant section below **and**
attach the actual file(s) named in it — the other assistant will need the
real current code, this doc just tells it *where to look* and *how the
pieces connect*.

---

## 1. What this project is

Brownza is a Karachi "cloud bakery" storefront: browse a static menu (some
products sold as a single item, others in fixed size/pack **variants**),
add to cart, check out (online payment only — bank transfer + screenshot,
no cash on delivery), track the order status in real time, submit a
pre-order enquiry, and an admin dashboard to manage incoming orders. No user
accounts — customers are anonymous, identified only by whatever they type
at checkout.

## 2. Tech stack & conventions to know before touching code

- **Next.js 16**, App Router, Turbopack. **This is NOT the Next.js most
  training data knows** — `params`/`searchParams` are Promises you must
  `await`; middleware is a file called `proxy.ts` at the repo root (not
  `middleware.ts`) exporting a `proxy()` function. Check
  `node_modules/next/dist/docs/` before assuming any Next.js API shape.
- **Tailwind CSS v4** — theme tokens are CSS-first `@theme` variables in
  `app/globals.css` (`--color-primary`, `--color-muted`, `--color-dark`,
  `--color-header`, etc.), not a `tailwind.config.js`.
- **MongoDB Atlas + Mongoose** for orders and pre-order enquiries. The
  **product menu is static, hardcoded TypeScript data** (`data/products.ts`),
  never in MongoDB. Don't conflate the two.
- **Zustand** for all client-side ephemeral/persisted state (cart, location,
  menu search) — no Redux, no Context for these.
- **react-hook-form + Zod** for every form (checkout, pre-order, admin
  login).
- **sonner** for toasts, **framer-motion** for the few animated pieces
  (reveal-on-scroll, modals, location popup).
- No test suite exists. Verification = `npm run lint` + `npm run build` +
  manual/Playwright browser check.
- Admin auth is a single hardcoded username/password pair from env vars
  (`ADMIN_USERNAME`/`ADMIN_PASSWORD`) plus a JWT cookie — there is no user
  database.
- **Recurring lint gotcha**: the project's ESLint config bans calling
  `setState` synchronously in the body of a `useEffect`
  (`react-hooks/set-state-in-effect`). The established fixes already used
  throughout this codebase: (a) if it's just an SSR/hydration mount-gate,
  use the shared `useHydrated()` hook (`lib/use-hydrated.ts`,
  `useSyncExternalStore`-based) instead of a local `mounted` state+effect;
  (b) if it's "reset local state when a prop changes," adjust state
  *during render* by comparing against a ref/state-tracked previous value,
  per [React's documented pattern](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes), rather than in an effect; (c) if it's a
  genuine async load, wrap the effect body in an async IIFE so the
  setState calls are nested inside an async function rather than the
  effect's own synchronous body.

---

## 3. Storefront flow (customer-facing)

### 3.1 Menu / product browsing (`/products`, the effective homepage)

`next.config.ts` redirects `/` → `/products` (menu is the real landing
page).

| File | Purpose |
|---|---|
| `app/products/page.tsx` | Assembles the whole menu page: `ScrollToTopOnLoad`, hero, sticky category tabs, search bar, then `MenuContent` (which now includes Popular Favorites — see below). |
| `components/menu/scroll-to-top-on-load.tsx` | Renders nothing; on mount, sets `window.history.scrollRestoration = "manual"` and force-scrolls to `{top:0,left:0,behavior:"instant"}`. Exists because `/` → `/products` redirects and browser scroll restoration could otherwise land the page somewhere other than the top. Only used on `/products`. |
| `components/menu/menu-hero.tsx` | Auto-rotating cover-image carousel (`cover_1/2/3.png` from `public/images/products/`). Client component (interval + manual prev/next/dot controls). Deliberately **not** wrapped in the shared `Container` — uses its own wider `max-w-[1800px]` wrapper so it stays visually full-width at any zoom level. `aspect-[7/3]` box, `object-cover`. |
| `components/product/category-filter.tsx` | Pills: Favourites + one per category (`data/categories.ts`). Clicking **scrolls to that section's `id`** (`#favourites`, `#cookies`, `#brownies`, etc.) — it does **not** filter products out of the DOM; every category always stays rendered. Highlights the active pill via `IntersectionObserver` watching each section, and auto-centers the active pill in the scrollable row — but skips that auto-center scroll on the very first render (an `isFirstRun` ref guard), since `active` starts as `"favourites"` and would otherwise nudge the page on initial load. |
| `components/product/product-search.tsx` | Self-contained search box (icon + input + circular arrow submit button, one visual pill). Reads/writes `lib/menu-search-store.ts` directly — **no props**, so it can be positioned anywhere (currently: right under the category tabs) independent of where the filtered results render. Submit-triggered (button click or Enter) for a non-empty query — catalogue is static so there's nothing worth debouncing. **Exception:** clearing the field back to empty commits immediately (not on Enter), so the full menu reliably reappears the instant the box is emptied. |
| `lib/menu-search-store.ts` | Tiny Zustand store: `{ query, setQuery }`. The only reason this exists is to decouple the search box's position from the results' position in the page tree. |
| `components/product/menu-content.tsx` | Reads `query` from `menu-search-store`, and renders: (1) the **Popular Favorites** block first (`id="favourites"`, fed by a `featuredProducts` prop from the page, filtered by the same search predicate — folded in here from a formerly-standalone `popular-favorites.tsx`, now deleted, specifically so search covers it too), then (2) one section per category (`id={category.slug}`, heading, `ProductGrid` or a "No matches in X" message). Matching is name/description substring, case-insensitive. |
| `components/product/product-grid.tsx` / `product-card.tsx` / `product-card-skeleton.tsx` | Grid + individual card (image `aspect-square` — source photos are 1254×1254 — badge, name, serves, a "From" price when the product has variants, `ProductCardCta`). |
| `components/product/product-card-cta.tsx` | Branches on `product.variants`: none → renders the plain `ProductCardActions` (qty stepper + direct add-to-cart); some → renders a "Select options" button that opens `ProductVariantModal`. |
| `components/product/product-variant-modal.tsx` | Size/pack picker modal (radio pills + qty stepper + optional note textarea), built on the shared `Modal`. "Add to cart" calls the variant-aware `addItem(productId, qty, variantId, note)`. |
| `components/product/product-card-actions.tsx` / `quantity-selector.tsx` | The original direct add-to-cart path (no variants), writes to `lib/cart-store.ts`. |
| `data/categories.ts` / `data/products.ts` | The actual menu content. `getAllProducts()`, `getProductsByCategory(slug)`, `getFeaturedProducts(limit)`, `getProductBySlug`/`getProductById`, plus (new) `getVariant(product, variantId)` and `getStartingPrice(product)` (min variant price, or `product.price` if none). **Edit these two files to change what's for sale** — no DB, no CMS. Many products now carry a `variants` array — some prices are placeholder values flagged `// dummy — confirm ... price` pending real numbers. |

**To change the category-pill behavior or add a category:** edit
`data/categories.ts` (adds a pill + a section automatically) and
`components/product/category-filter.tsx`.
**To change search matching logic:** `components/product/menu-content.tsx`
(the `matches()`/`.filter(...)` logic).
**To change the hero images:** replace
`public/images/products/cover_{1,2,3}.png` and/or edit the `SLIDES` array
in `menu-hero.tsx`.
**To add/remove variants on a product:** `data/products.ts` (the
`variants` array on that product) — the card/modal/cart code all already
handle the variants-vs-flat-price branch generically.

### 3.2 Cart

| File | Purpose |
|---|---|
| `lib/cart-store.ts` | Zustand + `persist` (localStorage key from `lib/constants.ts` `CART_STORAGE_KEY`). State: `{ items: CartLine[] }` where a line is `{productId, variantId?, quantity, note?}` — **no price/name snapshot stored**, only references, so prices always come from live catalogue data. Lines are unique by **`productId` + `variantId`** (a helper `sameLine()` normalizes `undefined`/`null` so two variants of the same product are separate lines, and a variant-less product only matches other variant-less lines of itself). Actions: `addItem(productId, qty, variantId?, note?)`, `removeItem`, `setQuantity`, `increment`, `decrement` (auto-removes at 0), `clear` — all except `clear` take the optional `variantId`. Re-adding an existing line merges quantity and lets a newly-provided note overwrite the old one. Qty clamped to `[1, MAX_QUANTITY_PER_ITEM]`. |
| `lib/use-cart.ts` | Resolves cart lines against `data/products.ts`. `useDetailedCart()` → `{lines, totals, isEmpty}`; each line is `{product, variant?, quantity, unitPrice, lineTotal, note?}` — `unitPrice` comes from the resolved `variant.price` when present, else `product.price`. Totals: subtotal/delivery/total/itemCount — **delivery is now a flat `DELIVERY_CHARGE` on any non-empty cart** (the old free-delivery-above-threshold logic and `FREE_DELIVERY_THRESHOLD` constant are gone). `useCartCount()` (navbar badge). `useItemQuantity(productId, variantId?)`. |
| `components/cart/floating-cart-bar.tsx` | Persistent floating "View Cart" pill, portal-rendered into `document.body`, shown whenever the cart has items. Hidden on `/cart`, any `/checkout*`, `/pre-order*`, `/admin*`. Mounted globally via `SiteChrome`. Gated on `useHydrated()` (not a redundant local mounted-effect). |
| `components/cart/cart-view.tsx` | Top-level `/cart` UI. Uses `useHydrated()` to avoid an SSR/localStorage flash, shows `EmptyCart` or line items + `OrderSummary` + "Proceed to checkout" link. List `key` includes the variant id (`${product.id}:${variant?.id ?? "base"}`). |
| `components/cart/cart-item.tsx` | Shows `variant.label` in place of `product.serves` when a variant is selected, the resolved per-line `unitPrice`, and an italic "Note: …" line if present. |
| `components/cart/empty-cart.tsx`, `order-summary.tsx` | Presentational; `order-summary.tsx` is shared between cart and checkout. The "you've unlocked free delivery" progress-bar UI is gone — delivery is always shown as a flat charge now. |
| `app/cart/page.tsx` | Thin wrapper, `robots: {index:false}`. |

**To change the delivery fee:** `lib/constants.ts` (`DELIVERY_CHARGE`,
env-overridable via `NEXT_PUBLIC_DELIVERY_CHARGE`). There is no more
free-delivery threshold to configure — it was removed.

### 3.3 Checkout → order creation

This is the most important flow to understand for "change the order flow"
requests. **Cash on delivery has been removed — every order is online
payment (bank transfer + screenshot) only.**

| File | Purpose |
|---|---|
| `components/checkout/checkout-view.tsx` | **Orchestrator.** Renders the order-summary card *and* (now) the submit button + agreement disclaimer (moved here from the form). Tracks local `submitting` (fed by the form via `onSubmittingChange`) and `redirecting` (set once submission succeeds, to avoid flashing the empty-cart screen during navigation). `handlePlaceOrder(values, screenshotFile)`: (1) `POST /api/upload` (FormData) with the screenshot → `{url, publicId}`; (2) assembles `CreateOrderInput` (types/order.ts): `customer{name,phone,whatsapp,email}`, `delivery{address,city,notes}`, `items[{productId,productName,quantity,unitPrice}]` (`productName` becomes `"{product.name} — {variant.label}"` when a variant was picked), `payment{method:"ONLINE",screenshotUrl,screenshotPublicId}`, `subtotal`,`deliveryFee`,`total`; (3) `POST /api/orders`; (4) `saveLastOrder({id,orderNumber})` (`lib/last-order.ts`) so `/track` can find it; (5) `clear()`s the cart and **`router.push("/track")`** — checkout success no longer renders an inline confirmation screen, it redirects straight to order tracking. |
| `components/checkout/checkout-form.tsx` | react-hook-form + `zodResolver(checkoutSchema)`. Fields: fullName, phone, email, deliveryArea (prefilled from `useLocationStore`), address, notes. **No payment-method choice anymore** — a static "Online payment" info block replaces the old cod/online radio group, and a hidden input forces `paymentMethod: "online"`. Exports `CHECKOUT_FORM_ID` and renders `<form id={CHECKOUT_FORM_ID}>` — the actual submit `<button>` lives in `checkout-view.tsx` and is linked back via the HTML `form="…"` attribute, reporting `isSubmitting` up via the `onSubmittingChange` prop. "Use current location" → `detectDeliveryArea()` (`lib/geolocation.ts`). Screenshot is now **unconditionally** required (was conditional on payment method). |
| `lib/validations/checkout.ts` | `checkoutSchema` (Zod). `paymentMethod` stays typed `"cod"|"online"` deliberately (to avoid touching `types/order.ts`/`lib/validations/order.ts`/`lib/models/order.ts`, which share that shape) even though the UI never offers "cod" anymore — `checkoutDefaultValues.paymentMethod` is `"online"`. |
| `components/checkout/bank-details.tsx` | Static bank info card (`BANK_DETAILS` from `lib/constants.ts`), now always rendered (was conditional on payment method). |
| `components/checkout/screenshot-upload.tsx` | Controlled file picker + preview (object-URL). **Does not upload itself** — just holds the `File`; `checkout-view.tsx` does the actual upload. |
| `app/api/upload/route.ts` | `POST`, validates file type/size (≤8MB), calls `uploadPaymentScreenshot()`. |
| `lib/cloudinary.ts` | Cloudinary v2 client from env vars. `uploadPaymentScreenshot(buffer)` → uploads to folder `brownza/payments`, returns `{url, publicId}`. |
| `app/api/orders/route.ts` | `POST` (public, validates with `createOrderSchema` from `lib/validations/order.ts`, calls `createOrder()`) and `GET`/`DELETE` (admin-only, list/bulk-delete). |
| `lib/validations/order.ts` | `createOrderSchema` — server-side re-validation, **critically `.refine()`s that ONLINE orders must have `screenshotUrl`** even if the client gate were bypassed. Also `updateOrderSchema` (status/cancellationReason/verifyPayment) used by the admin PATCH endpoint. |
| `lib/services/order-service.ts` | **The hub.** `createOrder()` writes to Mongo, calls `emitOrderEvent()` (SSE) and `logActivity()`. See §5 for the rest of what lives here. |

**Note:** `components/checkout/order-success.tsx` and the `PlacedOrder` /
`PaymentMethod` types (in `types/index.ts`) were **deleted** — they were
the inline-success-screen path, now dead since checkout redirects to
`/track` instead.

**To change what fields checkout collects:** `checkout-form.tsx` +
`lib/validations/checkout.ts` + `types/order.ts` (`CreateOrderInput`) +
`lib/validations/order.ts` (`createOrderSchema`) + `lib/models/order.ts`
(Mongoose schema) — all four need to agree on shape.
**To bring cash-on-delivery back:** `checkout-form.tsx` (restore the
radio group and conditional screenshot requirement), `checkout-view.tsx`
(payment method no longer hardcoded to "online"),
`lib/validations/checkout.ts` (default value).

### 3.4 Order tracking (`/track`)

| File | Purpose |
|---|---|
| `components/track/order-tracker.tsx` | Client component. Reads `readLastOrder()` (`lib/last-order.ts`, localStorage) on mount (inside an async IIFE within the effect, to satisfy the set-state-in-effect lint rule — see §2); if none → "empty" state. Otherwise `GET /api/orders/track/{id}` once, then **subscribes to live updates via `useOrderStream(handleEvent, orderId)`** (`lib/hooks/use-order-stream.ts`) — **no more 5-second polling**. Any SSE event triggers a full refetch of the customer-safe view (simpler than hand-patching fields); a `cancelled` event additionally shows a `toast.error` with the cancellation reason (or a fallback), once, guarded by `announcedCancelRef`. Renders a timeline driven by `LIFECYCLE_STEPS`/`ORDER_STATUS_META` (`lib/order-status.ts`). Payment display is Online-only now (Verified/Awaiting verification) — the COD branch was removed. |
| `lib/last-order.ts` | localStorage helpers: `saveLastOrder`, `readLastOrder`, `clearLastOrder`. Key: `LAST_ORDER_KEY`. |
| `lib/hooks/use-order-stream.ts` | `useOrderStream(onEvent, orderId?)` — opens one `EventSource` at `/api/events` (or `/api/events?orderId=`), used by both the customer tracker and the admin dashboard. |
| `lib/events.ts` | In-memory `EventEmitter` pub/sub (see §7). |
| `app/api/events/route.ts` | SSE endpoint; public when `?orderId=` is given (see §7). |
| `app/api/orders/track/[id]/route.ts` | Public `GET`. Calls `getOrderTrackById(id)` → a **customer-safe** view (`OrderTrackView` in `types/order.ts`: no phone/full address, just `customerFirstName`, `deliveryArea`, items, totals, status). |

Tracking is now real-time end to end: `order-service.ts` emits an event on
every create/status-change/verify/cancel → `/api/events?orderId=` forwards
it to whichever browser tab has that order open → `order-tracker.tsx`
refetches and updates instantly. (The admin dashboard's `AdminRealtime`
uses the same SSE plumbing but subscribes to the unfiltered, admin-only
firehose — see §5.2/§7.)

### 3.5 Pre-order (`/pre-order`)

**No longer a stub — this now has a real backend.**

| File | Purpose |
|---|---|
| `components/pre-order/pre-order-form.tsx` | react-hook-form + `zodResolver(preOrderSchema)`. Fields: fullName, phone, email, orderType, description. On submit: `POST /api/pre-orders` with the form values as JSON; shows a toast + the existing success screen on `res.ok`, otherwise a toast with the server's `error` message (or a generic fallback) and stays on the form. |
| `lib/validations/pre-order.ts` | `ORDER_TYPES`, `preOrderSchema` (unchanged by this work — pre-existing). |
| `app/api/pre-orders/route.ts` | `POST`, `runtime="nodejs"`. Validates body with `preOrderSchema.safeParse` → 400 `{error, issues}` on failure. Calls `createPreOrder({fullName, phone, email, orderType, description})` (`lib/services/pre-order-service.ts`) → 201 `{preOrder}`. Catches errors → 500. |
| `lib/models/pre-order.ts` | Mongoose schema: `fullName`, `phone`, `email?`, `orderType` (enum `ORDER_TYPES`), `description`, `status` (enum `["new","contacted","closed"]`, default `"new"`), timestamps. Indexes: `{createdAt:-1}`, `{status:1, createdAt:-1}`. Exports the `PreOrder` model (re-registration-guarded) plus `PreOrderDoc`/`PreOrderType`/`PreOrderStatus`. |
| `lib/services/pre-order-service.ts` | `createPreOrder(input)` — connects to DB, `PreOrder.create(input)`, returns the plain object. `listPreOrders()` — `PreOrder.find().sort({createdAt:-1}).lean()`. **No admin UI consumes `listPreOrders()` yet** — if asked to surface pre-orders in the admin dashboard, that's the function to call from a new page/route. |

### 3.6 Site chrome (navbar, footer, location picker)

| File | Purpose |
|---|---|
| `components/layout/site-chrome.tsx` | Client gate: if `pathname.startsWith("/admin")`, renders **only** `children` (admin has its own header — see §5). Otherwise renders navbar + children + footer + `FloatingCartBar` + floating buttons + location gate. |
| `components/layout/navbar.tsx` | Scrolls away with the page (not sticky). Floating circular logo overlapping the bottom edge (absolutely positioned, `left-5` on mobile → `left-1/2` centered at `md+`). Left cluster (location pill + phone pill) is `hidden md:flex` — **must stay hidden below `md`**, the floating logo sits at the left edge there and will intercept clicks on anything wider. Below `md`, compact icon-only location/phone buttons live in the right cluster instead. Phone shown in intl format (`CONTACT.phoneDisplayIntl`, "+92..."). Background uses the `bg-header` Tailwind utility (from the `--color-header` theme token, `#f2e9e2`). The cart icon is hidden on `/cart` and any `/checkout*` route (redundant there). |
| `components/layout/footer.tsx` | Brand block (bigger logo via `<Logo size="lg" />`) + Explore nav + category links (`/products#slug` anchors) + contact (phone/email/address="Karachi") + Follow Us (Instagram + Facebook only) + a combined copyright/credit row: `© {year} All rights reserved.` and "Powered by" + the actual Techmorph Innovation logo image (`public/company_logo/tI-logo.png`), linking to `TECHMORPH_URL = "https://techmorphinnovation.site"`. |
| `components/common/logo.tsx` | Shared brand lockup (image + wordmark). `size?: "md"|"lg"` prop — `"lg"` used only in the footer, `"md"` (default) everywhere else including navbar. |
| `components/common/container.tsx` | Shared page gutter. Padding was tightened: `px-5 sm:px-8 lg:px-10` → `px-2.5 sm:px-4 lg:px-5`. |
| `components/location/location-gate.tsx` | The delivery-area popup. Shows automatically on first visit (`useLocationStore.area === null`). Can also be **reopened on demand** (navbar location button calls `openPicker()`) — when reopened with an existing saved area, it's dismissible (✕ button + backdrop click); the true first-visit case is not dismissible. Always centered now (dropped the mobile bottom-sheet-style `items-end` variant). Tries `detectDeliveryArea()` (geolocation + Nominatim reverse-geocode) non-blockingly while the user can also pick manually. |
| `lib/location-store.ts` | Zustand + `persist` (only `{area, label}` persisted — `pickerOpen` is transient UI state, explicitly excluded via `partialize`). `label` is the raw geocoded place name (more specific than the coarse `area` enum), used for display. |
| `lib/geolocation.ts` | `detectDeliveryArea()` — browser geolocation → OpenStreetMap Nominatim reverse-geocode → `matchArea()` maps the free-text place name to one of `DELIVERY_AREAS`. |
| `lib/constants.ts` | `CONTACT` (phone/whatsapp/email/instagram/facebook — `phoneDisplayIntl` for the compact pill vs `phoneDisplay` for the fuller local format), `DELIVERY_AREAS`/`DEFAULT_DELIVERY_AREA`, `DELIVERY_CHARGE` (always applied, no threshold anymore), `BANK_DETAILS`, `NAV_LINKS`, storage keys. |

---

## 4. Shared UI primitive worth knowing about — `components/ui/modal.tsx`

Now portal-rendered into `document.body` (was inline) — critical because
`position: fixed` resolves against the nearest *transformed* ancestor, and
product cards use `hover:-translate-y-1`; without the portal, a modal
opened while its triggering card was mid-hover would be pinned to that
card's box instead of the viewport. Gains a scrollable bottom-sheet-style
layout on mobile (`max-h-[92vh]`, rounded top corners only) with full
rounding + a smaller max-height only from `sm` up. Its own mount-gate
reuses `useHydrated()` (not a redundant local effect). Used directly by
`ProductVariantModal` and by admin dialogs (`CancelOrderModal`, etc.).

---

## 5. Admin dashboard (`/admin/*`)

*(Unchanged by the most recent round of work — included here for
completeness.)*

### 5.1 Auth

| File | Purpose |
|---|---|
| `lib/admin-token.ts` | Framework-agnostic (no `next/headers` — importable from `proxy.ts`). `ADMIN_COOKIE = "brownza_admin_token"`, 7-day expiry. `verifyAdminCredentials(user,pass)` checks against env vars `ADMIN_USERNAME`/`ADMIN_PASSWORD` (**no user DB — single hardcoded account**). `signAdminToken`/`verifyAdminToken` (JWT via `JWT_SECRET` env var). |
| `lib/auth.ts` | Re-exports `admin-token.ts` + adds `next/headers`-based `getAdminSession()`/`isAdminAuthenticated()` for use in Server Components/Route Handlers. |
| `proxy.ts` | Next 16's middleware-equivalent (file must be named `proxy.ts`, exports `proxy()`). Matcher `/admin/:path*`. Lets `/admin/login` through; everything else redirects to login if the cookie is missing/invalid. |
| `app/api/admin/login/route.ts` / `logout/route.ts` | Set/clear the httpOnly cookie (`secure` flag is protocol-aware via `x-forwarded-proto`, so local HTTP dev still works). |
| `app/admin/login/page.tsx`, `components/admin/login-form.tsx`, `logout-button.tsx` | The login UI + logout action. |

Admin API routes (orders, events, etc.) **each independently** check
`getAdminSession()` too — the proxy guards page navigation, not the API.

### 5.2 Layout & navigation

| File | Purpose |
|---|---|
| `app/admin/(dashboard)/layout.tsx` | Server layout; redirects to login if unauthenticated. Mounts `AdminRealtime` (SSE subscription for live order notifications) + `AdminNav` (3 links: Dashboard / Today's Orders / All Orders) + `LogoutButton`. |
| `components/admin/admin-realtime.tsx` | Subscribes to `/api/events` (admin firehose, no `orderId`). On `order.created`: plays a notification sound (short if tab focused, longer Foodpanda-style if `document.hidden`, via `lib/notification-sound.ts`) and shows a toast, then `router.refresh()`. |
| `components/admin/admin-nav.tsx` | Sidebar links, active-state via `usePathname`. |

### 5.3 Dashboard (`/admin`) — analytics only

| File | Purpose |
|---|---|
| `app/admin/(dashboard)/page.tsx` | Top stat cards (Total Revenue, Monthly Revenue, Total Delivered, Average Order Value) + `AnalyticsPanel`. Deliberately has **no** pending/today's-work info — that lives on the Today's Orders page. |
| `lib/services/order-service.ts` → `getDashboardStats()`, `getAnalytics()` | Single aggregation pipelines each (MongoDB `$facet`). |
| `components/admin/analytics-panel.tsx`, `stat-card.tsx` | Presentational. |

### 5.4 Today's Orders (`/admin/orders`) vs All Orders (`/admin/all-orders`)

| File | Purpose |
|---|---|
| `app/admin/(dashboard)/orders/page.tsx` | **Today only** (`getTodayStats()` + `listOrders({todayOnly:true, sort:"operational"})`). 9 stat cards (pending/accepted/preparing/ready/out-for-delivery/delivered/cancelled/today's orders/today's revenue) + `OrdersTable` **without** delete, with View → details. |
| `app/admin/(dashboard)/all-orders/page.tsx` | Full history, `sort:"recent"`, search + status filter (`OrderSearch`) + pagination (`Pagination`) + `OrdersTable` **with** `showDelete` + `DeleteAllOrdersButton`. |
| `components/admin/orders-table.tsx` | Shared compact table: Order # (link) / Time / Total / Payment badge / Status badge / View icon / `StatusSelect` / (optional) `DeleteOrderButton`. Sticky header, contained scroll (no page-level horizontal scroll). |
| `components/admin/order-search.tsx` | Debounced (400ms) search + status `Select`, URL-driven (`?search=&status=`), works on both order pages via `usePathname()`. |
| `components/admin/pagination.tsx` | URL-driven `?page=`. |
| `components/admin/status-select.tsx` | Single status dropdown; options from `ALLOWED_TRANSITIONS` (`lib/order-status.ts`); picking "cancelled" opens `CancelOrderModal`, anything else PATCHes directly. Terminal statuses render a read-only badge. |
| `components/admin/cancel-order-modal.tsx` | Confirmation + reason textarea before PATCHing a cancellation. |
| `components/admin/delete-order-button.tsx` / `delete-all-orders-button.tsx` / `confirm-dialog.tsx` | Destructive-action confirmations; DELETE endpoints also clean up Cloudinary screenshots server-side. |
| `components/admin/order-status-badge.tsx` | Colored badge per `ORDER_STATUS_META`. |

**`lib/order-status.ts`** is the single source of truth for lifecycle rules:
`ALLOWED_TRANSITIONS` (pending→[accepted,cancelled];
accepted→[preparing,ready,out-for-delivery,delivered,cancelled]; forward-skip
allowed from accepted onward, backward/terminal blocked), `ORDER_STATUS_META`
(colors), `ACTION_LABEL`, `LIFECYCLE_STEPS` (for the tracker timeline),
`canTransition()`, `isTerminal()`. **Change order statuses/lifecycle here
first**, then propagate to `types/index.ts` (`ORDER_STATUSES`),
`lib/models/order.ts` (schema enum), and `lib/validations/order.ts`.

### 5.5 Order details (`/admin/orders/[id]`)

Everything about one order lives here: Order info + `StatusSelect`,
Customer, Delivery, Products table, Payment (screenshot + always-visible
`VerifyPaymentButton` for ONLINE orders), Order summary.

| File | Purpose |
|---|---|
| `components/admin/verify-payment-button.tsx` | PATCHes `{verifyPayment:true}` → `verifyOrderPayment()` in `order-service.ts` → updates badge immediately + triggers customer tracker update (now instantly, via the SSE event — see §3.4). |

### 5.6 The service hub — `lib/services/order-service.ts`

This file is the center of gravity for anything order-related. Exports:

- `createOrder(input)` — writes to Mongo, `emitOrderEvent()`, `logActivity()`.
- `updateOrderStatus(id, status, cancellationReason?)` — validates via
  `canTransition()`, throws `InvalidTransitionError` if illegal, updates,
  emits event + logs activity.
- `verifyOrderPayment(id)` — sets `payment.paymentVerified`/`paymentVerifiedAt`.
- `listOrders(options: ListOrdersOptions)` — `{status?, search?, page,
  pageSize, todayOnly?, sort?: "operational"|"recent"}`. "operational" sort
  groups pending/active orders first, delivered/cancelled pushed to the
  bottom; "recent" is a plain `createdAt` descending sort. Single `$facet`
  aggregation for data+count.
- `getTodayStats()` — today's counts by status + today's revenue.
- `getOrderById(id)` / `getOrderTrackById(id)` (customer-safe projection).
- `getDashboardStats()` / `getAnalytics()` — aggregation-based.
- `deleteOrder(id)` / `deleteAllOrders()` — also deletes the associated
  Cloudinary screenshot(s) via a shared `deleteCloudinaryByPublicIds()`
  helper, and the matching `Activity` documents.

### 5.7 Notifications

| File | Purpose |
|---|---|
| `lib/notification-sound.ts` | `playNotificationSound(long: boolean)` — Web Audio oscillator beeps, no audio asset. Short pattern if the admin tab is focused, longer Foodpanda/Uber-Eats-style pattern if backgrounded (`document.hidden`). |
| `components/ui/sonner.tsx` | Toast container, `visibleToasts={3}`, bottom-right, newest on top. |

---

## 6. Data layer (MongoDB)

| File | Purpose |
|---|---|
| `lib/db/mongoose.ts` | Connection caching on `globalThis._mongoose` (survives Next.js dev HMR). `connectToDatabase()` — call this at the top of any function touching Mongo. |
| `lib/models/order.ts` | The `Order` schema. Fields: `orderNumber` (unique), `customer{name,phone,whatsapp,email?}`, `delivery{address,city,notes?}`, `items[{productId,productName,quantity,unitPrice}]`, `payment{method:"COD"|"ONLINE",screenshotUrl?,screenshotPublicId?,paymentVerified,paymentVerifiedAt}`, `subtotal/deliveryFee/total`, `status` (enum, default `"pending"`), `cancellationReason?`, timestamps. Indexes on `createdAt`, `{status,createdAt}`, `{payment.method,payment.paymentVerified}`, `customer.phone` — tuned for the admin list/filter/search/stats queries. **Don't add indexes or change this schema without also updating `order-service.ts`'s aggregations and `lib/validations/order.ts`.** Note: the schema still supports `"COD"` even though the checkout UI no longer offers it (see §3.3) — a deliberate, minimal-footprint choice. |
| `lib/models/pre-order.ts` | The `PreOrder` schema (new) — see §3.5. Separate collection from orders; no relation between the two. |
| `lib/models/activity.ts` | Audit-log model: `{type, orderId, orderNumber, message, createdAt}`. `ACTIVITY_TYPES`: order.created/accepted, status.updated, payment.verified, order.cancelled, order.delivered. (Pre-orders don't write to this log.) |
| `lib/services/activity-service.ts` | `logActivity()` (never throws — logs and swallows errors so it can't break the primary order action) and `getRecentActivity(limit)`. |
| `lib/services/pre-order-service.ts` | `createPreOrder(input)`, `listPreOrders()` — see §3.5. |
| `types/order.ts` | The order-domain TypeScript types: `OrderRecord`, `OrderEvent` (SSE payload shape), `OrderTrackView`, `CreateOrderInput`, `DashboardStats`, `AnalyticsData`, `ActivityRecord`. |
| `types/index.ts` | Storefront types: `Product` (now with optional `variants?: readonly ProductVariant[]`), `ProductVariant {id,label,price}`, `Category`, `CartLine`/`DetailedCartLine`/`CartTotals` (both cart-line types now carry `variantId?`/`variant?` and `note?`), `ORDER_STATUSES`/`OrderStatus`. **`PlacedOrder` and `PaymentMethod` were removed** (dead code after checkout stopped rendering an inline success screen — see §3.3). |
| `lib/validations/order.ts` | `createOrderSchema` (server-side re-validation of `POST /api/orders`, enforces online-needs-screenshot) and `updateOrderSchema` (status/cancellationReason/verifyPayment). |
| `lib/validations/pre-order.ts` | `ORDER_TYPES`, `preOrderSchema` — used by both the form and the API route. |

## 7. Real-time plumbing (SSE) — in-memory, used by both admin and customers now

| File | Purpose |
|---|---|
| `lib/events.ts` | In-memory `EventEmitter` pub/sub, cached on `globalThis._orderEvents` (survives HMR). `emitOrderEvent(event)` / `subscribeOrderEvents(listener)`. **Single-instance only** — would need Redis or similar to work across multiple server instances/serverless. |
| `app/api/events/route.ts` | `GET`, SSE response. No `?orderId` → admin-only firehose (checks `getAdminSession()`). With `?orderId=` → **public**, filtered to that order — this is now actively used by the customer-facing order tracker (see §3.4), not just admin. 25s heartbeat ping, `retry: 3000`. |
| `lib/hooks/use-order-stream.ts` | `useOrderStream(onEvent, orderId?)` — opens one `EventSource`, used by both `AdminRealtime` (no `orderId`) and `order-tracker.tsx` (with `orderId`). |

---

## 8. SEO / app shell / config

| File | Purpose |
|---|---|
| `config/site.ts` | `siteConfig`: name, title, description, `url` (**placeholder** `https://brownza.com` — swap before real deploy), ogImage, locale, keywords. Consumed by metadata, JSON-LD, sitemap. (The footer credit link no longer uses this — it points at `TECHMORPH_URL` instead, see §3.6.) |
| `app/layout.tsx` | Root layout: fonts, global `metadata` (favicon comes from the Next.js file-convention `app/icon.png`/`app/apple-icon.png`, no explicit `metadata.icons` override), mounts `Navbar`/`Footer`/`Toaster`/`JsonLd`/`LocationGate`/`FloatingActions` via `SiteChrome`. |
| `components/seo/json-ld.tsx` | schema.org `Bakery` structured data. |
| `app/robots.ts` | Disallows `/cart`, `/checkout`, `/admin`, `/api`. |
| `app/sitemap.ts` | Only `/products` and `/pre-order` — categories are in-page anchors, not separate routes, so they're not listed separately. |
| `app/manifest.ts` | PWA manifest. |
| `next.config.ts` | `serverExternalPackages:["mongoose"]`, `/` → `/products` redirect, Cloudinary + Unsplash allowed as remote image hosts. |

## 9. Shared UI primitives (`components/ui/*.tsx`)

Small themed wrappers, mostly one file = one Radix primitive or native
element: `badge`, `button` (both `cva`-based with variants), `input`,
`label`, `modal` (see §4 — portal-rendered, mobile bottom-sheet layout),
`radio-group`, `select`, `separator`, `skeleton`, `sonner` (toast
container), `textarea`. These are pure presentation — safe to restyle
without touching logic elsewhere.

---

## 10. Quick recipes — "if asked to change X, touch these files"

| Change requested | Files to touch |
|---|---|
| Add/remove/rename a menu category | `data/categories.ts`, `data/products.ts` (assign products to it) |
| Add/remove/reprice a product | `data/products.ts` only |
| Add/remove size-pack variants on a product | `data/products.ts` (`variants` array on that product) — card/modal/cart already branch on its presence generically |
| Change delivery fee | `lib/constants.ts` (`DELIVERY_CHARGE`) — there's no free-delivery threshold anymore |
| Change delivery areas list | `lib/constants.ts` (`DELIVERY_AREAS`), `lib/geolocation.ts` (`matchArea` aliases) |
| Change checkout form fields | `checkout-form.tsx` + `checkout-view.tsx` (submit button/disclaimer live here now) + `lib/validations/checkout.ts` + `types/order.ts` + `lib/validations/order.ts` + `lib/models/order.ts` (keep all in sync) |
| Bring back cash-on-delivery | `checkout-form.tsx` (restore the radio group + conditional screenshot requirement), `checkout-view.tsx`, `lib/validations/checkout.ts` (default value) — the `"cod"|"online"` union and `lib/models/order.ts`'s `"COD"|"ONLINE"` enum already support it, nothing to change there |
| Change order status lifecycle | `lib/order-status.ts` first, then `types/index.ts`, `lib/models/order.ts`, `lib/validations/order.ts` |
| Change admin auth / add real user accounts | `lib/admin-token.ts`, `lib/auth.ts`, `proxy.ts`, `app/api/admin/login/route.ts` |
| Surface pre-orders in the admin dashboard | New admin page/route calling `listPreOrders()` (`lib/services/pre-order-service.ts`) — the data layer already exists, just no UI consumes it yet |
| Change what happens after checkout success | `components/checkout/checkout-view.tsx` (`handlePlaceOrder`'s success branch — currently `clear()` + `router.push("/track")`) |
| Change order tracking's real-time behavior | `components/track/order-tracker.tsx` (`handleEvent`) + `lib/hooks/use-order-stream.ts` / `app/api/events/route.ts` if the transport itself needs to change |
| Change the hero carousel images | `public/images/products/cover_*.png` + `components/menu/menu-hero.tsx` |
| Change navbar/footer contact info, socials | `lib/constants.ts` (`CONTACT`), `components/layout/footer.tsx`, `components/layout/navbar.tsx` |
| Change favicon/logo | Replace `app/icon.png` / `app/apple-icon.png` (Next.js file-convention — no code change needed) |
| Change page gutter/spacing globally | `components/common/container.tsx` |

---

*Constraints that have applied throughout this project's admin-panel and
storefront phases and are worth telling any assistant up front: don't
redesign the storefront wholesale, don't change the MongoDB architecture
casually, don't touch authentication without being asked, and the menu is
static seeded data — never move it into MongoDB. Checkout's fundamental
shape (online-only, redirect-to-track) and order tracking's transport
(SSE, not polling) were both deliberately changed in the most recent round
of work — treat those as the current baseline, not as things still open
for casual reinterpretation.*
