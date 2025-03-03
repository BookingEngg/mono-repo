// Modules
import React from "react";
import { useQuery } from "@tanstack/react-query";
// Atoms
import Table from "@/atoms/Table";
// Services
import {
  getAllNewUsers,
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

  const handleNewFriendRequest = React.useCallback(
    async (rowData: INewFriendCommunity) => {
      const response = await makeNewFriendRequest({
        friend_id: rowData.user_id,
      });

      console.log(response);
    },
    []
  );

  const newCommunityQuery = useQuery({
    queryKey: ["community-query", pagination],
    queryFn: () => getAllNewUsers(pagination),
  });

  const { data: newCommunityUsers } = newCommunityQuery;

  const columnsDetails = [
    {
      title: "User Id",
      columnDataKey: "user_id",
      width: 200,
    },
    {
      title: "Name",
      columnDataKey: "name",
      width: 250,
    },
    {
      title: "Username",
      columnDataKey: "username",
      width: 250,
    },
    {
      title: "Actions",
      width: 250,
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
            datum={newCommunityUsers.data}
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
