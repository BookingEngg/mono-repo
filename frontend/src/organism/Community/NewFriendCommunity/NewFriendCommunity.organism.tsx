// Modules
import React from "react";
import { useQuery } from "@tanstack/react-query";
// Atoms
import Table from "@/atoms/Table";
// Services
import {
  getCommunityUsers,
  makeNewFriendRequest,
} from "@/services/Community.service";
// Rsuite
import { Button, FlexboxGrid, Input, InputGroup, Panel } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Style
import style from "./NewFriendCommunity.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

export interface INewFriendCommunity {
  user_id: string;
  name: string;
  username: string;
}

const NewFriendsCommunity = () => {
  const [pagination, setPagination] = React.useState<{
    page_no: number;
    limit: number;
    total: number;
  }>({ total: 0, page_no: 1, limit: 20 });

  const newCommunityQuery = useQuery({
    queryKey: ["community-query", pagination],
    queryFn: () => getCommunityUsers(pagination, "new-users"),
  });

  const { data: newCommunityUsers, refetch } = newCommunityQuery;

  const handleNewFriendRequest = React.useCallback(
    async (rowData: INewFriendCommunity) => {
      const response = await makeNewFriendRequest({
        friend_id: rowData.user_id,
      });

      if (response?.status === "success") {
        refetch();
      }
    },
    []
  );

  const columnsDetails = [
    {
      title: "Name",
      columnDataKey: "name",
      width: 2,
    },
    {
      title: "Username",
      columnDataKey: "username",
      width: 2,
    },
    {
      title: "User Id",
      columnDataKey: "user_id",
      width: 2,
    },
    {
      title: "Actions",
      width: 3,
      actionCell: true,
      actionDatum: (rowData: INewFriendCommunity) => (
        <Button
          appearance="link"
          onClick={() => {
            handleNewFriendRequest(rowData);
          }}
        >
          Add Friend
        </Button>
      ),
    },
  ];

  return (
    <Panel className={cx("new-friend-container")}>
      <FlexboxGrid>
        {/* Filters */}
        <FlexboxGridItem colspan={24}>
          <FlexboxGrid justify="space-between">
            <FlexboxGridItem>
              <InputGroup inside>
                <InputGroup.Addon>Name</InputGroup.Addon>
                <Input />
              </InputGroup>
            </FlexboxGridItem>

            <FlexboxGridItem>
              <Button appearance="link" color="red">
                Clear All
              </Button>
              <Button appearance="ghost">Search</Button>
            </FlexboxGridItem>
          </FlexboxGrid>
        </FlexboxGridItem>

        {/* New Friends List */}
        <FlexboxGridItem colspan={24}>
          <Table
            datum={newCommunityUsers?.data || []}
            columnsDetails={columnsDetails}
            pagination={pagination}
            refetchDatum={setPagination}
          />
        </FlexboxGridItem>
      </FlexboxGrid>
    </Panel>
  );
};

export default NewFriendsCommunity;
