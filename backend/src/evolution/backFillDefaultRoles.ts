import {
  defaultUserPrivilegeWhileSignup,
  defaultUserRolesWhileSignup,
} from "@/constants/roles.constants";
import userModel from "@/models/user.model";

(async () => {
  const response = await userModel.updateMany(
    {},
    {
      $set: {
        roles: defaultUserRolesWhileSignup,
        privileges: defaultUserPrivilegeWhileSignup,
      },
    }
  );

  console.log(response);
  process.exit(0);
})();
