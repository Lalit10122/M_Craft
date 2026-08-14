# Admin Panel Frontend Specification — Aurelia Jewels

**Purpose:** Complete, standalone spec for the admin panel UI, covering every admin capability defined across `Backend_Build_Spec_Aurelia_Jewels.md` and `Backend_New_Features_Addendum.md`.

**Stack:** Same as customer frontend — React (Vite) + Tailwind + Framer Motion (used sparingly here — admin UIs prioritize clarity/speed over polish) + React Router + Axios.

**Visual treatment:** Deliberately distinct from the customer-facing site — darker/neutral theme, denser information layout, no marketing-style animation. This should look and feel like "a tool," not "a storefront," so nobody mistakes the two, and so it visually signals a more locked-down area (reinforced by the mandatory 2FA login).

---

## 1. Routing Map

```
/admin/login                    → AdminLogin.jsx
/admin/2fa-verify                → AdminTwoFactorVerify.jsx
/admin/2fa-setup                 → AdminTwoFactorSetup.jsx (first-login only)
/admin                           → Dashboard.jsx
/admin/products                  → Products.jsx
/admin/products/new              → ProductForm.jsx (create mode)
/admin/products/:id/edit         → ProductForm.jsx (edit mode)
/admin/collections               → Collections.jsx
/admin/orders                    → Orders.jsx
/admin/orders/:id                → OrderDetail.jsx
/admin/returns                   → Returns.jsx
/admin/returns/:id               → ReturnDetail.jsx
/admin/customers                 → Customers.jsx
/admin/customers/:id             → CustomerDetail.jsx
/admin/coupons                   → Coupons.jsx
/admin/reviews                   → ReviewsModeration.jsx
/admin/pincodes                  → Pincodes.jsx
/admin/low-stock                 → LowStock.jsx
/admin/settings                  → Settings.jsx
```

Every route except the three auth routes is wrapped in an `AdminProtectedRoute` guard that checks for a valid admin session (access token present + role === ADMIN) and redirects to `/admin/login` otherwise.

---

## 2. Authentication & Security Screens

### 2.1 `AdminLogin.jsx`
- Email + password form only — no "remember me," no Google sign-in option here (admin accounts are local-only by design).
- Submits to `POST /api/auth/login`.
- Response `{ requires2FA: true, tempToken }` → navigate to `/admin/2fa-verify`, passing `tempToken` in memory (not URL, not localStorage).
- If the account has no 2FA enabled yet (first-ever admin login), backend/flow routes to `/admin/2fa-setup` instead — see 2.3.
- On repeated failures, surface the backend's lockout message directly ("Account locked for 15 minutes due to repeated failed attempts") rather than a generic error — this is a deliberate UX choice for the admin side (see backend spec Section 4.5).

### 2.2 `AdminTwoFactorVerify.jsx`
- 6-digit code input — six individual auto-advancing boxes (paste-friendly: pasting a 6-digit code should fill all boxes at once).
- Submits `{ tempToken, code }` to `POST /api/auth/2fa/verify`.
- "Use a backup code instead" toggle link switches the input to a single text field for the backup code string.
- On success, receives the real access token (refresh token arrives as an httpOnly cookie) → redirect to `/admin`.
- `tempToken` expires in 2–5 minutes per the backend spec — if it expires, show "Session expired, please log in again" and bounce back to `/admin/login`, not a confusing generic error.

### 2.3 `AdminTwoFactorSetup.jsx`
- Shown only when the backend indicates 2FA isn't enabled yet for this admin account.
- Calls `POST /api/admin/2fa/setup`, renders the returned QR code image (base64 PNG) prominently, with the raw secret text shown below in a copyable monospace field for manual entry as a fallback.
- 6-digit confirmation input → `POST /api/admin/2fa/verify-setup`.
- On success: show the **10 backup codes exactly once**, in a clearly labeled block ("Save these somewhere safe — you won't see them again"), with a "Copy all" button and a required checkbox ("I've saved my backup codes") before the "Continue to Dashboard" button becomes clickable. Do not let this screen be dismissed or navigated away from silently — force the acknowledgment.
- After continuing, the backup codes must not persist anywhere in frontend state/memory beyond this screen.

---

## 3. Layout Shell

### 3.1 `AdminSidebar.jsx`
Persistent left nav, sections in this order:
```
Dashboard
Products          (badge: low-stock count, if > 0)
Collections
Orders
Returns           (badge: pending-review count, if > 0)
Customers
Coupons
Reviews           (badge: pending-approval count, if > 0)
Pincodes
Low Stock
Settings
```
Badges pull from the dashboard stats endpoint on load and refresh on navigation back to `/admin`.

### 3.2 `AdminHeader.jsx`
- Logged-in admin name + avatar (top right), dropdown with "Settings" and "Logout."
- Logout calls the backend logout endpoint (revokes the refresh token server-side, per backend Section 12.2) before clearing local state and redirecting to `/admin/login` — never just clear local state and call it done.
- A subtle session/token-refresh indicator is optional; not required for v1.

---

## 4. Dashboard (`Dashboard.jsx`)

**Data source:** `GET /api/admin/dashboard/stats`, `GET /api/admin/dashboard/low-stock`

| Widget | Content |
|---|---|
| Stat cards (row of 4) | Total sales (today/this month toggle), Orders today, Pending returns count, Low-stock product count |
| Revenue chart | Last 7/30 days, line or bar chart (use `recharts`) |
| Recent orders table | Latest 5-10 orders with status badges, links to `OrderDetail.jsx` |
| Low-stock preview | Top 5 lowest-stock products with a "View All" link to `/admin/low-stock` |
| Pending reviews preview | Count + link to `/admin/reviews` |

---

## 5. Products (`Products.jsx` + `ProductForm.jsx`)

### 5.1 `Products.jsx` (list)
- Table: thumbnail, name, category, color, price / MRP, stock qty (highlighted red/amber if below threshold), active toggle (inline switch, calls update immediately), edit/delete row actions.
- Search box (client-side filter on loaded page, or server-side via the same `?q=` search param the customer site uses) + filters for category/collection.
- "Add Product" button → `/admin/products/new`.

### 5.2 `ProductForm.jsx` (create/edit)
Organized as tabs or a long single-scroll form with clear section headers:

**Basic Info:** name, slug (auto-generated, editable), description (rich text or plain textarea is fine at this scale), category (dropdown), material, color, meta title/description, active toggle, best-seller toggle.

**Pricing & Stock:** basePrice, mrp (live-computed "% OFF" preview shown next to these two fields so the admin sees exactly what customers will see), stockQty.

**Images:** drag-and-drop multi-upload calling `POST /api/admin/products/:id/images` (product must be saved/have an ID first — if creating new, save basic info first, then unlock the images section). Explicitly label the first two images: **"Image 1 — Default view"** and **"Image 2 — Shown on hover"** (this directly matters for the customer-facing hover-swap feature) with drag-to-reorder support for the rest.

**Variants:** repeatable row editor — label, price, stock, "default" radio — add/remove rows freely. Used for both color options and combo/gift-box tiers per the backend spec.

**Collections:** multi-select checkboxes or tag-picker populated from `GET /api/collections`, calling `POST /api/admin/products/:id/collections` per selection.

Save button validates all required fields client-side before submit and shows field-level errors inline, not just a generic toast.

---

## 6. Collections (`Collections.jsx`)
- Simple table: name, slug, product count, edit/delete.
- Add/edit modal: name (slug auto-generated).
- These populate both the customer mega-menu tiles and the collection filter — a small note in the UI reminding the admin of that ("Used in the site's navigation menu and product filters") avoids confusion about where this shows up.

---

## 7. Orders (`Orders.jsx` + `OrderDetail.jsx`)

### 7.1 `Orders.jsx` (list)
- Table: order ID, customer name, date, total, payment method (Razorpay/COD badge), status badge (color-coded per status), quick status-update dropdown inline in the row for fast triage.
- Filters: status, date range, payment method.

### 7.2 `OrderDetail.jsx`
- Items list (with variant labels, quantities, prices), shipping address, gift message if `isGift`, free gift attached if applicable.
- Payment info: method, Razorpay order/payment IDs (never raw card data — there isn't any, by design), refund info if applicable.
- Status update dropdown → `PUT /api/admin/orders/:id/status`, with a visible order-status timeline (same stepper component used on the customer side, for consistency — matches or reuses `OrderStatusTimeline` from the customer frontend spec).
- **"Download Invoice"** button linking to the stored `invoiceUrl`, plus a "Regenerate Invoice" action for edge cases.
- If a return request exists for this order, show a summary card with a link into `ReturnDetail.jsx`.

---

## 8. Returns & Refunds (`Returns.jsx` + `ReturnDetail.jsx`)

### 8.1 `Returns.jsx` (list)
- Table: order ID, customer, reason, status badge, requested date. Filter by status (Requested/Approved/Rejected/Picked Up/Refund Initiated/Refund Completed).

### 8.2 `ReturnDetail.jsx`
- Full request info: reason, comment, customer's uploaded photo if present, linked order summary.
- Action buttons based on current status:
  - `REQUESTED` → Approve / Reject (reject requires a reason textarea sent back to the customer).
  - `APPROVED` → Mark Picked Up.
  - `PICKED_UP` → Initiate Refund → opens a **confirmation modal** ("This will refund ₹X via Razorpay — this cannot be undone") before calling `PUT /api/admin/returns/:id/refund`. This confirmation step is non-negotiable given it triggers a real financial transaction.
  - For COD-order returns, the refund step should clearly indicate "Manual refund required — no online payment to reverse" rather than presenting the same one-click Razorpay refund action.

---

## 9. Customers (`Customers.jsx` + `CustomerDetail.jsx`)
- List: name, email, phone, join date, order count, blocked status, search box.
- `CustomerDetail.jsx`: profile info, full order history for that customer, block/unblock toggle (`PUT /api/admin/users/:id/block`) with a confirmation prompt before blocking (this prevents the customer from logging in — worth a deliberate click, not an accidental one).

---

## 10. Coupons (`Coupons.jsx`)
- Table: code, type (flat/percent), value, min order value, valid till, usage count/limit, active toggle.
- Add/edit form matching the backend `Coupon` model fields exactly.

---

## 11. Reviews Moderation (`ReviewsModeration.jsx`)
- Queue of pending reviews (`GET /api/admin/reviews/pending`): product name/thumbnail, customer name, star rating, comment text, photo if attached.
- Approve / Reject actions per row — approved reviews immediately become visible on the customer-facing PDP.

---

## 12. Pincodes (`Pincodes.jsx`)
- Table: pincode, estimated delivery days, COD available (toggle), delete action.
- "Add Pincode" quick-add form (single entry) + "Bulk Upload" (CSV upload, reusing the same file-upload pattern used for product images) for adding many at once.

---

## 13. Low Stock (`LowStock.jsx`)
- Dedicated full list (not just the dashboard preview) sourced from `GET /api/admin/dashboard/low-stock` — product name, current stock, threshold, "Restock" link straight into `ProductForm.jsx` with the stock field focused.

---

## 14. Settings (`Settings.jsx`)

Grouped into clear sections, all wired to `GET/PUT /api/admin/settings`:

| Section | Fields |
|---|---|
| Free Gift Promotion | Threshold amount, linked free-gift product (dropdown of products) |
| COD Settings | COD order-value cap |
| Returns | Return window (days after delivery) |
| Inventory | Low-stock threshold |
| Security | "Disable 2FA" action (requires re-entering password + current 2FA code, per backend spec — deliberately not a casual single-click toggle), "Regenerate Backup Codes" action (shows new codes once, same acknowledgment-required pattern as initial setup) |

---

## 15. Endpoint-to-Screen Reference Table
*(Refer to specification for exact mappings)*

---

## 16. Dummy Data Note

Per the earlier addendum, all screens above should be buildable and demoable using the same MSW mock layer (`VITE_USE_MOCK_API=true`) — include admin-specific fixtures (a handful of orders in every status, at least 2-3 return requests in different stages, a few low-stock products, some pending reviews) so the full admin workflow can be clicked through end-to-end before the real backend is live.
