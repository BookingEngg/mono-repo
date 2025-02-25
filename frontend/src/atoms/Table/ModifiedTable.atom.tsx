// Rsuite
import React from "react";
import { Button, Pagination, Table } from "rsuite";
import { Column, HeaderCell, Cell, RowDataType } from "rsuite-table";

interface ITableColumnDetails {
  title: string;
  width: number;
  columnDataKey?: string;
  actionCell?: boolean;
  actionDatum?: (rowData: unknown) => JSX.Element;
}

interface IModifiedTablePagination {
  page_no: number;
  limit: number;
  total: number;
}

interface IModifiedProps {
  datum: RowDataType[];
  columnsDetails: ITableColumnDetails[];
  pagination: IModifiedTablePagination;
  refetchDatum: (paginationDetails: IModifiedTablePagination) => void;
}

const ModifiedTable = (props: IModifiedProps) => {
  const { datum, columnsDetails, pagination, refetchDatum } = props;

  const handleValueChange = React.useCallback(
    (pagination: IModifiedTablePagination) => {
      refetchDatum(pagination);
    },
    [pagination, refetchDatum, datum]
  );

  return (
    <div style={{ margin: "3vh 0" }}>
      <Table data={datum}>
        {columnsDetails.map((column) => {
          return (
            <Column width={column.width} align="center">
              <HeaderCell>{column.title}</HeaderCell>
              {column.actionCell ? (
                <Cell>{column.actionDatum}</Cell>
              ) : (
                <Cell dataKey={column.columnDataKey} />
              )}
            </Column>
          );
        })}
      </Table>

      <Pagination
        layout={["total", "-", "limit", "|", "pager"]}
        size={"xs"}
        prev={true}
        next={true}
        first={true}
        last={true}
        ellipsis={true}
        boundaryLinks={true}
        total={pagination.total}
        limit={pagination.limit}
        activePage={pagination.page_no}
        limitOptions={[20, 30, 50, 100]}
        maxButtons={3}
        onChangePage={(page) => {
          handleValueChange({ ...pagination, page_no: page });
        }}
        onChangeLimit={(newLimit) => {
          handleValueChange({ ...pagination, limit: newLimit });
        }}
      />
    </div>
  );
};

export default ModifiedTable;
