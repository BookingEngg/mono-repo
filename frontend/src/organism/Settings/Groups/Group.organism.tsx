// Style
import {
  Button,
  CheckPicker,
  Dropdown,
  FlexboxGrid,
  Form,
  HStack,
  Input,
  InputGroup,
  Modal,
  Panel,
  Stack,
  Text,
} from "rsuite";
import style from "./Group.module.scss";
import classNames from "classnames/bind";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import React from "react";
import DropdownMenu from "rsuite/esm/Dropdown/DropdownMenu";
import DropdownItem from "rsuite/esm/Dropdown/DropdownItem";
import {
  createGroup,
  getCommunicationGroups,
  getGroupDetailsFromGroupId,
  updateGroupDetails,
} from "@/services/Communication.service";
const cx = classNames.bind(style);

export type GroupType = {
  short_id: string;
  name: string;
  description: string;
  admin: { label: string; value: string }[];
  group_members: { label: string; value: string }[];
};

export type GroupListItem = {
  id: string;
  name: string;
  description: string;
  total_members: number;
  admin: string;
};

const GroupOrganism = () => {
  const [showModal, setShowModal] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<string | null>(null);
  const [groupData, setGroupData] = React.useState<GroupListItem[]>([]);

  const handleUpdateGroup = (group_short_id: string | null) => {
    setSelectedGroup(group_short_id);
    setShowModal(true);
  };

  const fetchGroupList = async () => {
    const response = await getCommunicationGroups();
    setGroupData(response.data);
  };

  React.useEffect(() => {
    fetchGroupList();
  }, [selectedGroup]);

  return (
    <Panel className={cx("card-container")}>
      <FlexboxGrid>
        <FlexboxGridItem colspan={24}>
          <FlexboxGrid justify="end">
            <Button
              appearance="ghost"
              onClick={() => {
                handleUpdateGroup(null);
              }}
            >
              Create Group
            </Button>
          </FlexboxGrid>
        </FlexboxGridItem>
        <FlexboxGridItem colspan={24}>
          <div className={cx("group-grid")}>
            {groupData.length > 0 ? (
              groupData.map((group) => (
                <div key={`group-${group.id}`} className={cx("group-card")}>
                  <div className={cx("group-info")}>
                    <div className={cx("info-row")}>
                      <span className={cx("label")}>Name:</span>
                      <span className={cx("value")}>{group.name}</span>
                    </div>
                    <div className={cx("info-row")}>
                      <span className={cx("label")}>Description:</span>
                      <span className={cx("value")}>{group.description}</span>
                    </div>
                    <div className={cx("info-row")}>
                      <span className={cx("label")}>Total Members:</span>
                      <span className={cx("value", "user-id")}>
                        {group.total_members}
                      </span>
                    </div>
                  </div>
                  <div className={cx("group-actions")}>
                    <Button
                      appearance="primary"
                      size="sm"
                      onClick={() => {
                        handleUpdateGroup(group.id);
                      }}
                      className={cx("action-button")}
                    >
                      Update Group
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <Text size="md" weight="extrabold">
                Oops! No Groups Found...
              </Text>
            )}
          </div>
        </FlexboxGridItem>
      </FlexboxGrid>
      {showModal ? (
        <CreateOrUpdateGroupModal
          selectedGroupId={selectedGroup}
          onClose={() => setShowModal(false)}
          refetchGroups={() => {
            fetchGroupList();
          }}
        />
      ) : (
        <></>
      )}
    </Panel>
  );
};

const CreateOrUpdateGroupModal = (props: {
  selectedGroupId: string | null;
  onClose: () => void;
  refetchGroups: () => void;
}) => {
  const [groupData, setGroupData] = React.useState<GroupType>({
    short_id: "",
    name: "",
    description: "",
    admin: [],
    group_members: [],
  });

  const handleGroupDataChange = (
    key: string,
    value: string | string[] | number
  ) => {
    if (key === "admin") {
      const adminList = groupData.group_members.filter((member) => {
        return (value as string[]).includes(member.value);
      });
      setGroupData({ ...groupData, admin: adminList });
      return;
    }

    setGroupData({ ...groupData, [key]: value });
  };

  React.useEffect(() => {
    const fetchGroupDetails = async () => {
      if (props.selectedGroupId) {
        const response = await getGroupDetailsFromGroupId(
          props.selectedGroupId
        );
        setGroupData(response.data);
      }
    };
    fetchGroupDetails();
  }, [props.selectedGroupId]);

  const handleCreateOrUpdateGroup = async () => {
    const formattedPayload = {
      ...groupData,
      admin_ids: groupData.admin.map((admin) => admin.value),
      group_member_ids: groupData.group_members.map((member) => member.value),
    };

    if (props.selectedGroupId && groupData.short_id) {
      await updateGroupDetails(props.selectedGroupId, formattedPayload);
    } else {
      await createGroup(formattedPayload);
    }

    props.onClose();
    props.refetchGroups();
  };

  return (
    <Modal size={"xs"} open={true} onClose={props.onClose}>
      <Modal.Header>
        <Modal.Title>
          {props.selectedGroupId ? "Update Group Details" : "Create Group"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Stack direction="column" spacing={10}>
          <Stack.Item grow={1} alignSelf="stretch">
            <InputGroup>
              <InputGroup.Addon>Name</InputGroup.Addon>
              <Input
                name="name"
                value={groupData.name}
                onChange={(value) => {
                  handleGroupDataChange("name", value);
                }}
              />
            </InputGroup>
          </Stack.Item>

          <Stack.Item grow={1} alignSelf="stretch">
            <InputGroup>
              <InputGroup.Addon>Description</InputGroup.Addon>
              <Input
                name="description"
                value={groupData.description}
                onChange={(value) => {
                  handleGroupDataChange("description", value);
                }}
              />
            </InputGroup>
          </Stack.Item>
          {props.selectedGroupId ? (
            <Stack.Item grow={1}>
              <HStack>
                <Text muted>Group Admins</Text>
                <CheckPicker
                  value={groupData.admin.map((el) => el.value)}
                  data={groupData.group_members}
                  onChange={(value) => {
                    handleGroupDataChange("admin", value);
                  }}
                  searchable={true}
                  placeholder="Admins"
                />
              </HStack>
            </Stack.Item>
          ) : (
            <Text muted>
              Admins will be selected in the community Friends Tab
            </Text>
          )}
        </Stack>
      </Modal.Body>
      <Modal.Footer>
        <Button appearance="primary" onClick={handleCreateOrUpdateGroup}>
          {props.selectedGroupId ? "Update" : "Create"}
        </Button>
        <Button appearance="ghost" onClick={props.onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupOrganism;
