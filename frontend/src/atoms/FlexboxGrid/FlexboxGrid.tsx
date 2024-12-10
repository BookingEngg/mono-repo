import { FlexboxGrid } from "rsuite";
import FlexboxGridComponentProps from "./types";
import style from "./FlexboxGrid.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

const FlexboxGridComponent = (props: FlexboxGridComponentProps) => {
  const {
    children,
    className,
    mt,
    ml,
    mb,
    mr,
    pt,
    pl,
    pb,
    pr,
    align = "center",
    justify = "space-between",
    direction = "row",
    ...rest
  } = props;
  return (
    <FlexboxGrid
      {...rest}
      className={cx(
        "flexbox",
        `${mt ? `mt-${mt}` : ""}`,
        `${ml ? `ml-${ml}` : ""}`,
        `${mb ? `mb-${mb}` : ""}`,
        `${mr ? `mr-${mr}` : ""}`,
        `${pt ? `pt-${pt}` : ""}`,
        `${pl ? `pl-${pl}` : ""}`,
        `${pb ? `pb-${pb}` : ""}`,
        `${pr ? `pr-${pr}` : ""}`,
        `${align ? `align-${align}` : ""}`,
        `${justify ? `justify-${justify}` : ""}`,
        `${direction ? `direction-${direction}` : ""}`,
        className
      )}
    >
      {children}
    </FlexboxGrid>
  );
};

FlexboxGridComponent.Item = FlexboxGrid.Item;

export default FlexboxGridComponent;
