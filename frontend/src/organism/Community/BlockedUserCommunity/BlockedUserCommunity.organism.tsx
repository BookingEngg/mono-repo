import React from "react";
import { useQuery } from "@tanstack/react-query";
// Rsuite
import { Button, FlexboxGrid, Input, InputGroup, Panel, Pagination } from "rsuite";
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

  React.useEffect(() => {
    if (blockedCommunityUsers?.total) {
      setPagination((prev) => ({ ...prev, total: blockedCommunityUsers.total }));
    }
  }, [blockedCommunityUsers?.total]);

  const renderActions = (user: IBlockedUser) => {
    if (user.blocked_details?.blocked_status === 'self-blocked') {
      return (
        <Button
          appearance="primary"
          size="sm"
          color="orange"
          onClick={() => handleUnblockUser(user)}
          className={cx("action-button")}
        >
          Unblock
        </Button>
      );
    }
    return <div className={cx("status-badge", "waiting")}>Wait for Unblock</div>;
  };

  return (
    <Panel className={cx("blocked-user-container")}>
      <FlexboxGrid>
        {/* Filters */}
        <FlexboxGridItem colspan={24}>
          <FlexboxGrid justify="space-between" className={cx("filter-section")}>
            <FlexboxGridItem>
              <InputGroup inside>
                <InputGroup.Addon>Name</InputGroup.Addon>
                <Input />
              </InputGroup>
            </FlexboxGridItem>

            <FlexboxGridItem className={cx("filter-actions")}>
              <Button appearance="link" color="red">
                Clear All
              </Button>
              <Button appearance="ghost">Search</Button>
            </FlexboxGridItem>
          </FlexboxGrid>
        </FlexboxGridItem>

        {/* Blocked Users List - Card Layout */}
        <FlexboxGridItem colspan={24}>
          <div className={cx("users-grid")}>
            {blockedCommunityUsers?.data && blockedCommunityUsers.data.length > 0 ? (
              blockedCommunityUsers.data.map((user: IBlockedUser) => (
                <div key={user.user_id} className={cx("user-card")}>
                  <div className={cx("user-info")}>
                    <div className={cx("info-row")}>
                      <span className={cx("label")}>Name:</span>
                      <span className={cx("value")}>{user.name}</span>
                    </div>
                    <div className={cx("info-row")}>
                      <span className={cx("label")}>Username:</span>
                      <span className={cx("value")}>{user.username}</span>
                    </div>
                    <div className={cx("info-row")}>
                      <span className={cx("label")}>User ID:</span>
                      <span className={cx("value", "user-id")}>{user.user_id}</span>
                    </div>
                  </div>
                  <div className={cx("user-actions")}>
                    {renderActions(user)}
                  </div>
                </div>
              ))
            ) : (
              <div className={cx("empty-state")}>No blocked users found</div>
            )}
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className={cx("pagination-wrapper")}>
              <Pagination
                prev
                next
                first
                last
                ellipsis
                boundaryLinks
                maxButtons={5}
                size="md"
                layout={['total', '-', 'pager']}
                total={pagination.total}
                limit={pagination.limit}
                activePage={pagination.page_no}
                onChangePage={(page) => setPagination((prev) => ({ ...prev, page_no: page }))}
                onChangeLimit={(limit) => setPagination((prev) => ({ ...prev, limit, page_no: 1 }))}
              />
            </div>
          )}
        </FlexboxGridItem>
      </FlexboxGrid>
    </Panel>
  );
};

export default BlockedUserCommunity;
