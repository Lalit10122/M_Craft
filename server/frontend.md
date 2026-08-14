# Frontend Addendum — UI for the 7 New Backend Features + Dummy Data Setup

**Purpose:** This file covers ONLY the frontend work needed for the 7 features just added to the backend (Returns/Refunds, COD, Notifications, Search, GST Invoices, Abandoned Cart, Low-Stock Alerts), plus a dummy-data layer so the frontend can be built and demoed before/independent of the live backend. Hand this alongside `Frontend_Build_Spec_Aurelia_Jewels.md` to Antigravity.

---

## 1. Dummy Data Layer (Build & Demo Before Backend Is Fully Wired)

Since you want this production-ready but testable with dummy data first, set up a **mock API layer that's easy to switch off** — never leave dummy data silently active in a real deployment.

**Approach: Mock Service Worker (MSW)**
- Install `msw` — it intercepts network requests at the service-worker level, so components call the *real* `productService.js`/`orderService.js` functions exactly as they will in production; only the actual HTTP response is faked. This means zero component code changes when you switch to the real backend.
- Create `src/mocks/handlers.js` with mock responses for every endpoint in both backend specs (products with variants/images, categories, collections, orders with all statuses, a couple of return requests in different states, search results, invoice URLs, etc.).
- Create `src/mocks/fixtures/` — realistic dummy JSON: ~30-40 fake jewelry products (necklaces, rings, earrings, bracelets) with placeholder images (use a placeholder service like `picsum.photos` or generate simple colored SVG placeholders), a handful of fake orders in different statuses (PENDING, PAID, SHIPPED, DELIVERED, RETURN_REQUESTED, REFUNDED), fake reviews, fake coupons.
- **Toggle via environment variable**, not a hardcoded flag:
```js
// src/mocks/browser.js
if (import.meta.env.VITE_USE_MOCK_API === 'true') {
  const { worker } = await import('./browser');
  await worker.start();
}
```
- Set `VITE_USE_MOCK_API=true` in local `.env.development`, and **explicitly `false` (or unset) in the Vercel production environment variables** — this is the critical step: a checklist item before go-live should be "confirm `VITE_USE_MOCK_API` is not set to true in production."
- This lets you build, screenshot, and demo the entire frontend — including edge cases like empty carts, out-of-stock products, and various return-request statuses — without the backend needing to be finished or seeded first.

---

## 2. Returns & Refunds UI

**Customer-facing:**
- On `OrderHistory.jsx` / order detail view: for any order with `status === 'DELIVERED'` and within the return window, show a "Request Return" button.
- `ReturnRequestForm.jsx` (new component, likely a modal) — reason dropdown (e.g. "Wrong item," "Damaged," "Doesn't match description," "Changed my mind"), optional comment textarea, optional photo upload (reuses the same S3 upload pattern as review photos).
- `ReturnStatusTracker.jsx` — a small step indicator (Requested → Approved → Picked Up → Refund Initiated → Refund Completed) shown on the order detail page once a return exists for that order, with a rejected state styled distinctly (red/warning) with the admin's rejection reason visible.

**Admin-facing:**
- New page `AdminReturns.jsx` — table of all return requests, filterable by status, with quick actions (Approve / Reject / Mark Refunded) directly from the row, plus a detail drawer showing the customer's photo/comment.
- Wire "Mark Refunded" to a confirmation modal before calling the refund endpoint, since it triggers a real Razorpay refund — this should never be a single accidental click.

---

## 3. Cash on Delivery (COD) UI

- On `Checkout.jsx`, add a payment method selector (radio group: "Pay Online" / "Cash on Delivery") shown **after** the address is selected, since COD eligibility depends on the delivered-to pincode.
- If the selected address's pincode isn't COD-eligible (check via `GET /api/delivery/check`), disable the COD option with a small inline note ("COD not available for this pincode") rather than hiding it silently.
- If the cart total exceeds the COD cap (backend-configured), disable COD with a note ("COD available for orders under ₹X — please pay online for this order").
- Skip the Razorpay checkout widget entirely for COD orders — on confirm, call `POST /api/orders` with `paymentMethod: 'COD'` and go straight to `OrderConfirmation.jsx`.
- `OrderConfirmation.jsx` should visually differ slightly for COD ("Pay ₹X in cash when your order arrives") vs. online-paid orders.

---

## 4. Order Notifications — Frontend Touchpoints

Notifications themselves (email/SMS) are backend-only, but the frontend needs:
- **Order status timeline** on the order detail page — a simple horizontal or vertical stepper showing Placed → Packed → Shipped → Out for Delivery → Delivered, with the current stage highlighted, so the customer can self-serve status instead of relying solely on emails/SMS.
- **Toast/banner confirmation** immediately after checkout confirming which notifications will be sent ("We've emailed your confirmation to [email] and will text you shipping updates").
- No separate "notification preferences" page needed for v1 — keep this simple, don't over-build settings nobody asked for.

---

## 5. Product Search UI

- Add a search icon/input to `Header.jsx` (already scaffolded as a placeholder icon in the base spec) — clicking expands into a full search bar (animate the expand with Framer Motion, consistent with the rest of the site's motion language).
- **Search-as-you-type dropdown:** debounce input (~300ms via `useDebounce.js`, already in the base spec's hooks folder), call `GET /api/products/suggest?q=...`, show up to 5 quick results with thumbnail + name + price directly in a dropdown beneath the search bar.
- Pressing Enter or "View all results" navigates to `SearchResults.jsx` — reuses `ProductGrid.jsx` and `ProductFilters.jsx` from the base spec, just pre-filtered by `q`, so search results can still be further filtered by price/color/category.
- Empty state: "No results for '[query]' — try a different search or browse our collections" with links to a couple of popular collections, not a dead end.

---

## 6. GST Invoice UI

- On `OrderHistory.jsx` and the order detail page, add a "Download Invoice" button/link for any order with `status` at or past `PAID`/`PACKED` — links directly to the `invoiceUrl` (or hits `GET /api/orders/:id/invoice` if you're streaming rather than redirecting).
- Admin: same button on `OrderDetail.jsx` in the admin panel, plus ability to trigger a re-generation if needed (rare edge case, low priority — a simple "Regenerate Invoice" button is enough, no need for a dedicated flow).

---

## 7. Abandoned Cart & Low-Stock Alerts — Frontend Impact

- **Abandoned cart:** No new customer-facing UI needed — this is entirely an email-side feature. The only frontend consideration: make sure the reminder email's link (e.g. `https://yourdomain.com/cart?ref=abandoned-email`) lands the user back on a working cart page with their items still present — verify the cart state persists correctly for a logged-in user across sessions (it should, since cart is server-side per the backend spec, not local-only).
- **Low-stock alerts:** Admin-only. Add a `LowStockPage.jsx` (or a filtered view within `Products.jsx`) showing all products currently below threshold, sourced from the new `GET /api/admin/dashboard/low-stock` endpoint, with a direct "Restock" link into `ProductForm.jsx` for each item. Also surface a small badge/count on the `AdminSidebar.jsx` "Products" nav item when low-stock items exist, so it's visible without navigating in.

---

## 8. Production Readiness Checklist (Specific to This Addendum)

- [ ] `VITE_USE_MOCK_API` is unset or `false` in the Vercel production environment.
- [ ] All dummy image URLs (placeholder service) are replaced with real S3-hosted product images before go-live.
- [ ] Return window and COD cap values shown in the UI are pulled live from backend `Settings`, not hardcoded copies of today's values.
- [ ] Search debounce and suggest-dropdown tested against the real `ILIKE` endpoint for reasonable response time once real data volume is loaded (fine at small scale, worth a quick check).
- [ ] Invoice download tested against a real generated PDF from S3, not just a mock URL.

---

## Definition of Done — This Addendum

- The entire frontend can be built, clicked through, and demoed end-to-end using only dummy data (`VITE_USE_MOCK_API=true`), including placing a COD order, requesting a return, searching products, and downloading a (mock) invoice.
- Switching `VITE_USE_MOCK_API` to false with a real backend running requires zero component-level code changes — only the mock layer stops intercepting requests.
- Admin can view and act on return requests, see low-stock items, and everything visually matches the site's existing design/animation language from the base frontend spec — no jarring style inconsistency for these newer screens.