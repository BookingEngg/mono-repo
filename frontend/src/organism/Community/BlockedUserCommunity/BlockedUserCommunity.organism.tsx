import React from "react";
import { useQuery } from "@tanstack/react-query";
// Atoms
import Table from "@/atoms/Table";
// Rsuite
import { Button, FlexboxGrid, Input, InputGroup, Panel } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Services
import {
  getCommunityUsers,
  unblockUserStatus,
} from "@/services/Community.service";
// Style
import style from "./BlockedCommunityUser.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

export interface IBlockedUser {
  user_id: string;
  name: string;
  username: string;
  blocked_details?: {
    user_id: string;
    blocked_status: string;
    block_origin: string;
  };
}

const BlockedUserCommunity = () => {
  const [pagination, setPagination] = React.useState<{
    page_no: number;
    limit: number;
    total: number;
  }>({ total: 0, page_no: 1, limit: 20 });

  const blockedCommunityQuery = useQuery({
    queryKey: ["community-query", pagination],
    queryFn: () => getCommunityUsers(pagination, "blocked-users"),
  });

  const { data: blockedCommunityUsers, refetch } = blockedCommunityQuery;

  const handleUnblockUser = React.useCallback(async (rowData: IBlockedUser) => {
    const response = await unblockUserStatus({
      friend_id: rowData.user_id,
    });

    if (response?.status === "success") {
      refetch();
    }
  }, []);

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
      actionDatum: (rowData: IBlockedUser) => {
        return rowData.blocked_details?.blocked_status === 'self-blocked' ? (
          <>
            <Button
              appearance="link"
              onClick={() => {
                handleUnblockUser(rowData);
              }}
            >
              Unblock
            </Button>
          </>
        ) : (
          <>Wait for Unblock</>
        );
      },
    },
  ];

  return (
    <>
      <Panel className={cx("blocked-user-container")}>
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
              datum={blockedCommunityUsers?.data || []}
              columnsDetails={columnsDetails}
              pagination={pagination}
              refetchDatum={setPagination}
            />
          </FlexboxGridItem>
        </FlexboxGrid>
      </Panel>
    </>
  );
};

export default BlockedUserCommunity;
