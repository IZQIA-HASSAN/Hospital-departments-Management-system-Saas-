# Architecture Notes — Round

## What the system actually is

This is a **multi-tenant hospital app**: each hospital is a tenant, an admin
owns one hospital, staff belong to one hospital, and every department
(OPD/ICU/Emergency) stores data scoped to a hospital. That's the core
assumption everything else needs to respect, and right now only ICU
enforces it properly.

## How auth currently works

- Two separate account tables: `User` (admin) and `Staff`.
- `unifiedLogin` tries `User` first, then falls back to `Staff`.
- JWTs are minimal: `{ id, role }` only, signed by `generateToken.js`.
- `protect` middleware decodes the token, re-fetches the account by
  `id`/`role`, and puts it on `req.user`.
- Three separate secrets for three purposes — session (`JWT_SECRET`),
  invite links (`JWT_INVITE_SECRET`), password reset
  (`JWT_RESET_SECRET`). This part is good practice, keep it.

**Problem:** `hospitalId` isn't in the token, isn't consistent across
account types, and used to be trusted straight from the client request
body. That's what caused the ICU bug and is a real tenant-isolation hole
everywhere else it hasn't been fixed yet.

## The hospital/tenant relationship is asymmetric — and that's the root issue

- `Staff.hospitalId` is a real column, set once at signup.
- `User` (admin) has **no** `hospitalId` column at all. An admin's
  hospital is found via `Hospital.findOne({ where: { adminId } })`,
  every single time, in every controller that needs it.

Two different account types, two different ways to find "which hospital
does this user belong to." Any controller that forgets this (or that
copies the wrong pattern from the other) will get it wrong silently. The
`resolveHospital.js` middleware I added for ICU is the fix — it centralizes
that lookup so no controller has to know or re-derive it. **This needs to
become the standard for every department, not just ICU.**

## What's solid right now

- Password reset flow: short-lived token, generic response whether or not
  the email exists (doesn't leak account existence), separate secret.
- Staff invite flow: signed invite token, verified before letting someone
  set a password, one-time account creation.
- `Hospital` creation is correctly guarded against one admin creating more
  than one hospital.
- Role-based `authorize()` middleware exists and is used consistently on
  admin-only routes.
- The ICU bed model (after the recent fixes) correctly represents "bed as
  a persistent resource" with a real uniqueness guarantee.

## What needs fixing, in priority order

**1. Tenant isolation is inconsistent across modules.**
ICU now derives `hospitalId` server-side via `attachHospitalId` and scopes
every query (including by-id lookups) to it. Staff and Hospital routes
need the same audit: does `getstaff`/`delstaff` scope to the caller's own
hospital, or can any admin see/delete staff belonging to a different
hospital? Right now that's unverified — every module needs this same
"derive `req.hospitalId`, filter every query by it" treatment before this
is safe to call multi-tenant.

**2. Duplicated, drifting token-signing logic.**
`generateToken.js` is the one place session tokens should be signed.
`signupStaff` signs its own token manually instead of calling it —
which is exactly how it ended up missing a `hospitalId` claim you didn't
even end up needing, but is a sign the pattern isn't centralized. Any
future field added to the token payload has to be added in two places,
and it's easy to update one and forget the other. Route all session-token
creation through one function.

**3. Inconsistent API error shape.**
Auth/Hospital controllers return `{ message: ... }`; ICU returns
`{ error: ... }`. The frontend has to know which key to read per
endpoint, which is fragile and easy to get wrong silently (a mismatched
key just shows nothing instead of erroring loudly). Pick one shape and
use it everywhere — even a shared `sendError(res, status, msg)` helper
fixes this permanently.

**4. Validation is manual and repeated per controller.**
Every controller hand-rolls its own `if (!field) return res.status(400)`
checks. That's how the ICU "all fields required" bug happened — the logic
technically worked but the message lied about *which* field was missing.
Worth introducing a small validation layer (even a shared helper, doesn't
need a full library) so required-field checks are consistent and the
error messages are trustworthy by construction.

**5. Dead code and logging hygiene.**
Commented-out old login functions (`login`, `stafflogin`) are still sitting
in `authController.js`. Harmless today, but it's easy for someone to
un-comment the wrong one later and reintroduce a bug you already fixed
(like the missing `passwordHash` compare, or a route that bypasses
`unifiedLogin`). Delete dead code rather than commenting it out — git
history is where old code belongs, not the file.

**6. No transaction around the "find-or-create" bed logic.**
`addPatient` does a `findOne` then either `update` or `create`. The unique
index catches the create-race, but a genuine concurrency edge case (two
staff admitting into the same bed number at the same instant) is handled
by *catching an error* rather than *preventing the race*. Fine for now at
your scale, but if this becomes a busier system, wrap that read-then-write
in a transaction (or a `findOrCreate` with a row lock) instead.

## The one-sentence version

Your data model and auth are fundamentally sound, but tenant scoping
(hospitalId) was being trusted from the client instead of derived from
the logged-in user — that's the pattern that needs to be applied
everywhere, not just in ICU, before this is safe to call solid.
