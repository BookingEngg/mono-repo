import { MarginProps, PaddingProps, Sizes, WithAsProps } from "../../typings";

export type CardProps = React.HTMLAttributes<HTMLElement> &
  MarginProps &
  PaddingProps &
  WithAsProps & {
    borderRadius?: Sizes;
  };
