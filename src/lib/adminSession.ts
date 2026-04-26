// In-memory flag indicating the Camp Director signed in during THIS page load.
// Because this lives in module memory (not localStorage/sessionStorage), it is
// wiped on every full page reload — so reloading the admin area forces a
// fresh sign-in even though Supabase persists the auth token in localStorage.

let signedInThisPageLoad = false;

export function markAdminSignedIn() {
  signedInThisPageLoad = true;
}

export function wasAdminSignedInThisPageLoad(): boolean {
  return signedInThisPageLoad;
}

export function clearAdminSignedIn() {
  signedInThisPageLoad = false;
}
