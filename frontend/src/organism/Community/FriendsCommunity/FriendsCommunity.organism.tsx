import { useQuery } from "@tanstack/react-query";
import React from "react";
// Rsuite
import { Button, FlexboxGrid, Input, InputGroup, Panel, Pagination } from "rsuite";
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

  React.useEffect(() => {
    if (friendsCommunityUsers?.total) {
      setPagination((prev) => ({ ...prev, total: friendsCommunityUsers.total }));
    }
  }, [friendsCommunityUsers?.total]);

  const renderActions = (user: IFriendCommunity) => {
    if (user.friends_details?.request_status === "send") {
      return (
        <div className={cx("status-badge", "pending")}>Request Pending</div>
      );
    }

    if (user.friends_details?.request_status === "receive") {
      return (
        <div className={cx("action-buttons")}>
          <Button
            appearance="primary"
            size="sm"
            color="green"
            onClick={() => handleUpdateFriendRequest(user, "approve")}
            className={cx("action-button")}
          >
            Accept
          </Button>
          <Button
            appearance="default"
            size="sm"
            onClick={() => handleUpdateFriendRequest(user, "reject")}
            className={cx("action-button")}
          >
            Reject
          </Button>
        </div>
      );
    }

    return (
      <Button
        appearance="primary"
        size="sm"
        color="red"
        onClick={() => handleUpdateFriendRequest(user, "blocked")}
        className={cx("action-button")}
      >
        Block
      </Button>
    );
  };

  return (
    <Panel className={cx("friend-container")}>
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

        {/* Friends List - Card Layout */}
        <FlexboxGridItem colspan={24}>
          <div className={cx("users-grid")}>
            {friendsCommunityUsers?.data && friendsCommunityUsers.data.length > 0 ? (
              friendsCommunityUsers.data.map((user: IFriendCommunity) => (
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
              <div className={cx("empty-state")}>No friends found</div>
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

export default AllFriendsCommunity;
