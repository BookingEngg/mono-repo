import Table from "@/atoms/Table";
import React from "react";
import { Button, FlexboxGrid, Input, InputGroup, Panel } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Style
import style from "./FriendsCommunity.module.scss";
import classNames from "classnames/bind";
import { getCommunityFriends } from "@/services/Community.service";
import { useQuery } from "@tanstack/react-query";
const cx = classNames.bind(style);

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
    actionDatum: (rowData: unknown) => (
      <Button
        appearance="link"
        onClick={() => {
          console.log(rowData);
        }}
      >
        Add Friend
      </Button>
    ),
  },
];

const AllFriendsCommunity = () => {
  const [pagination, setPagination] = React.useState<{
    page_no: number;
    limit: number;
    total: number;
  }>({ total: 0, page_no: 1, limit: 20 });

  const friendsCommunityQuery = useQuery({
    queryKey: ["community-query", pagination],
    queryFn: () => getCommunityFriends(pagination),
  });

  const { data: friendsCommunityUsers } = friendsCommunityQuery;

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
