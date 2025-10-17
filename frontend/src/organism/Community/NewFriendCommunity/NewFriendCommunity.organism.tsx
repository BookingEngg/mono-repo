// Modules
import React from "react";
import { useQuery } from "@tanstack/react-query";
// Services
import {
  getCommunityUsers,
  makeNewFriendRequest,
} from "@/services/Community.service";
// Rsuite
import { Button, FlexboxGrid, Input, InputGroup, Panel, Pagination } from "rsuite";
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

  React.useEffect(() => {
    if (newCommunityUsers?.total) {
      setPagination((prev) => ({ ...prev, total: newCommunityUsers.total }));
    }
  }, [newCommunityUsers?.total]);

  return (
    <Panel className={cx("new-friend-container")}>
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

        {/* New Friends List - Card Layout */}
        <FlexboxGridItem colspan={24}>
          <div className={cx("users-grid")}>
            {newCommunityUsers?.data && newCommunityUsers.data.length > 0 ? (
              newCommunityUsers.data.map((user: INewFriendCommunity) => (
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
                    <Button
                      appearance="primary"
                      size="sm"
                      onClick={() => handleNewFriendRequest(user)}
                      className={cx("action-button")}
                    >
                      Add Friend
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className={cx("empty-state")}>No users found</div>
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

export default NewFriendsCommunity;
