import React from "react";
import { useQuery } from "@tanstack/react-query";
// Atoms
import Table from "@/atoms/Table";
// Rsuite
import { Button, FlexboxGrid, Input, InputGroup, Panel } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Services
import { getCommunityBlockedUsers, unblockUserStatus } from "@/services/Community.service";
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
    request_status: string;
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
    queryFn: () => getCommunityBlockedUsers(pagination),
  });

  const { data: blockedCommunityUsers, refetch } = blockedCommunityQuery;

  const handleUnblockUser = React.useCallback(
      async (rowData: IBlockedUser) => {
        const response = await unblockUserStatus({
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
      width: 115,
      actionCell: true,
      actionDatum: (rowData: IBlockedUser) => {
        return rowData.blocked_details ? (
          <>
            <Button appearance="link" onClick={() => {
              handleUnblockUser(rowData);
            }}>
              Unblock
            </Button>
          </>
        ) : (
          <></>
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
