# Fix repeat waitlist promotion messaging

## What will change
- Make promotion requests idempotent: if the enrollment is already confirmed, return a successful response stating that the family already has a spot.
- Update the admin dashboard to show that specific message instead of the generic “try again” error.
- Deploy the updated email function and test both first promotion and repeat-promotion behavior.

## Technical details
- Preserve the existing rule that a successful database promotion remains confirmed even when email delivery fails.
- Return a normal response for the already-confirmed state so the client receives the explanatory message reliably.
