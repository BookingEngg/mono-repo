import { FlexboxGridProps } from "rsuite";
import { MarginProps, PaddingProps } from "../../typings";

type FlexboxGridDirectionType =
  | "row"
  | "row-reverse"
  | "column"
  | "column-reverse";
type FlexboxGridAlignmentType =
  | "start"
  | "end"
  | "center"
  | "space-around"
  | "space-between";

type FlexboxGridComponentProps = Omit<FlexboxGridProps, "align", "justify"> &
  MarginProps &
  PaddingProps & {
    align?: FlexboxGridAlignmentType;
    justify?: FlexboxGridAlignmentType;
    direction?: FlexboxGridDirectionType;
  };

export default FlexboxGridComponentProps;
