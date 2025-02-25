// Rsuite
import { Button, FlexboxGrid, Input, InputGroup, Panel } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { Column, Cell, HeaderCell } from "rsuite-table";
import Table from "@/atoms/Table";
// Style
import style from "./NewFriendCommunity.module.scss";
import classNames from "classnames/bind";
import React from "react";
const cx = classNames.bind(style);

const dummyData = [
  {
    short_id: "kjkl3423",
    name: "Tushar Chand Thakur",
    username: "tusharthakurepc205",
  },
  {
    short_id: "kj7745f3",
    name: "Tejasvi Kumar Thakur",
    username: "tejasvikumar108",
  },
  {
    short_id: "jlk2389ds",
    name: "Manasvi Kumar Thakur",
    username: "manasvikumar108",
  },
];

const columnsDetails = [
  {
    title: "Short Id",
    columnDataKey: "short_id",
    width: 150,
  },
  {
    title: "Name",
    columnDataKey: "name",
    width: 250,
  },
  {
    title: "Username",
    columnDataKey: "username",
    width: 150,
  },
  {
    title: "Actions",
    width: 115,
    actionCell: true,
    actionDatum: (rowData: unknown) => (
      <Button appearance="link" onClick={() => {
        console.log(rowData)
      }}>
        Add Friend
      </Button>
    ),
  },
];

const NewFriendsCommunity = () => {
  const [pagination, setPagination] = React.useState<{
    page_no: number;
    limit: number;
    total: number;
  }>({ total: 0, page_no: 1, limit: 20 });

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
            datum={dummyData}
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
