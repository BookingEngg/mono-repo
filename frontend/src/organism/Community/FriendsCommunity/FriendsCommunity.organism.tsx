import { useQuery } from "@tanstack/react-query";
import React from "react";
// Atoms
import Table from "@/atoms/Table";
// Rsuite
import { Button, FlexboxGrid, Input, InputGroup, Panel } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Services
import {
  getCommunityUsers,
  updateFriendRequestStatus,
} from "@/services/Community.service";
// Style
import style from "./FriendsCommunity.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

export interface IFriendCommunity {
  user_id: string;
  name: string;
  username: string;
  friends_details?: {
    user_id: string;
    request_status: string;
  };
}

const AllFriendsCommunity = () => {
  const [pagination, setPagination] = React.useState<{
    page_no: number;
    limit: number;
    total: number;
  }>({ total: 0, page_no: 1, limit: 20 });

  const friendsCommunityQuery = useQuery({
    queryKey: ["community-query", pagination],
    queryFn: () => getCommunityUsers(pagination, "friends"),
  });

  const { data: friendsCommunityUsers, refetch } = friendsCommunityQuery;

  const handleUpdateFriendRequest = React.useCallback(
    async (rowData: IFriendCommunity, requestStatus: string) => {
      const response = await updateFriendRequestStatus({
        friend_id: rowData.user_id,
        request_status: requestStatus,
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
      width: 250,
    },
    {
      title: "Username",
      columnDataKey: "username",
      width: 250,
    },
    {
      title: "User Id",
      columnDataKey: "user_id",
      width: 200,
    },
    {
      title: "Actions",
      width: 115,
      actionCell: true,
      actionDatum: (rowData: IFriendCommunity) => {
        if (rowData.friends_details?.request_status === "send") {
          return <>Request Pending</>;
        }

        return rowData.friends_details?.request_status === "receive" ? (
          <div>
            <Button
              appearance="link"
              onClick={() => {
                handleUpdateFriendRequest(rowData, "approve");
              }}
            >
              Accept
            </Button>
            <Button
              appearance="link"
              onClick={() => {
                handleUpdateFriendRequest(rowData, "reject");
              }}
            >
              Reject
            </Button>
          </div>
        ) : (
          <Button
            appearance="link"
            onClick={() => {
              handleUpdateFriendRequest(rowData, "blocked");
            }}
          >
            Block
          </Button>
        );
      },
    },
  ];

  return (
    <Panel className={cx("friend-container")}>
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
            datum={friendsCommunityUsers.data}
            columnsDetails={columnsDetails}
            pagination={pagination}
            refetchDatum={setPagination}
          />
        </FlexboxGridItem>
      </FlexboxGrid>
    </Panel>
  );
};

export default AllFriendsCommunity;
