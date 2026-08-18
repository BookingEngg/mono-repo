// Modules
import React from "react";
// Hooks
import useAccess from "@/hooks/useAccess";

type TRequireAccessProps = {
  role?: string;
  privilege?: string;
  privileges?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Restricts its children to creators with the given role/privilege(s),
 * rendering `fallback` (nothing, by default) otherwise. Use this to hide a
 * button, a nav entry, or gate an entire route behind an access check.
 *
 * Purely a UX convenience — the backend enforces the same checks on the
 * actual request regardless of what this renders.
 */
const RequireAccess = ({
  role,
  privilege,
  privileges,
  fallback = null,
  children,
}: TRequireAccessProps) => {
  const { hasRole, hasPrivilege, hasAllPrivileges } = useAccess();

  const isRoleSatisfied = !role || hasRole(role);
  const isPrivilegeSatisfied = !privilege || hasPrivilege(privilege);
  const areAllPrivilegesSatisfied = !privileges || hasAllPrivileges(privileges);

  const isAllowed =
    isRoleSatisfied && isPrivilegeSatisfied && areAllPrivilegesSatisfied;

  return isAllowed ? <>{children}</> : <>{fallback}</>;
};

export default RequireAccess;
