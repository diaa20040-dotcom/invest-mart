/** Sole platform owner admin (seed + access checks). */
export const OWNER_ADMIN_EMAIL = "ediaa158@gmail.com";

export function isOwnerAdmin(email: string) {
  return email.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase();
}

export function canAccessAdmin(
  user: { email: string; isAdmin: boolean } | null | undefined
) {
  return Boolean(user?.isAdmin && isOwnerAdmin(user.email));
}
