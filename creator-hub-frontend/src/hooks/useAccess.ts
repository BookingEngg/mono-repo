// Store
import { getAuthUser } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";

/**
 * Reads the signed-in creator's roles/privileges for UI-level restriction —
 * hiding a button, a nav item, or an entire route the account can't use.
 *
 * This is UX only. The backend re-checks every one of these on the actual
 * request (see auth.middleware.ts's checkRoles), since a client-side check
 * can always be bypassed.
 */
const useAccess = () => {
  const { user } = useAppSelector(getAuthUser);
  const roles = user?.roles ?? [];
  const privileges = user?.privileges ?? [];

  const hasRole = (role: string): boolean => roles.includes(role);
  const hasPrivilege = (privilege: string): boolean =>
    privileges.includes(privilege);
  const hasAllPrivileges = (required: string[]): boolean =>
    required.every((privilege) => privileges.includes(privilege));

  return { roles, privileges, hasRole, hasPrivilege, hasAllPrivileges };
};

export default useAccess;
