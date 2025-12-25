export const isRolesAccessibleToUser = (
  inputRoles: string[],
  userRolesAndPrivileges: string[]
) => {
  return Boolean(
    inputRoles.some((role) => userRolesAndPrivileges.includes(role))
  );
};
