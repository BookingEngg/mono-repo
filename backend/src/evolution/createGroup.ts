import GroupDao from "@/dao/communicationGroup.dao";
import UserDao from "@/dao/user.dao";
import { GroupType } from "@/interfaces/enum";

const groupDao = new GroupDao();
const userDao = new UserDao();
const membersIds = [
  "6803dbc01986de53cae9d618",
  "68f320d116e59bbe7c54e416",
  "67b5b0250e4336ed883bceb6",
  "67c5d13d9b4742b3f304574a",
  "67c5d20c9b4742b3f304574c",
  "67c5d22c9b4742b3f304574d",
  "67d6d5531b0f97823722e857",
  "67fcdd44be9387b85f6bc288",
];

/**
 * To Run the script 
 * 1. update the package json script with you script name
 * 2. Run "npm run script"
 */

(async () => {
  const groupPayload = {
    name: "Ramaya Pearls",
    description: "",
    admin_ids: ["6803dbc01986de53cae9d618"],
    group_member_ids: membersIds,
    group_type: GroupType.Public,
    group_profile_picture: "",
    is_active: true,
    is_visible: true,
    short_id: "tiqDpeoF",
  };

  console.log("LOGS>>> ", groupPayload);

  const userPromises = membersIds.map((memberId) => {
    return userDao.setUserGroupId(memberId, groupPayload.short_id);
  });

  await Promise.all(userPromises);
  await groupDao.createGroup(groupPayload);

  console.log("Group created successfully");
  process.exit(1);
})();
