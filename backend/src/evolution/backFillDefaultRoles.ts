import {
  defaultUserAssignedPrivilegeWhileSignup,
  defaultUserAssignedRolesWhileSignup,
} from "@/constants/roles.constants";
import userModel from "@/models/user.model";

(async () => {
  const response = await userModel.updateMany(
    {},
    {
      $set: {
        roles: defaultUserAssignedRolesWhileSignup,
        privileges: defaultUserAssignedPrivilegeWhileSignup,
      },
    }
  );

  console.log(response);
  process.exit(0);
})();
