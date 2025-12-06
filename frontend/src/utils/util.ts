// Store
import { getUserRolesAndPrivileges } from "@/store/auth";
import { useSelector } from "react-redux";

export const isRolesAccessibleToUser = (inputRoles: string[]) => {
  const userRolesAndPrivileges = useSelector(getUserRolesAndPrivileges);

  console.log("LOGS>> ", userRolesAndPrivileges.roles, inputRoles);
  return inputRoles.some((role) => userRolesAndPrivileges.roles.includes(role));
};
