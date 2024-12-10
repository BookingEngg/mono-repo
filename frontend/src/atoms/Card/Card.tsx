import { CardProps } from "./types";
import style from "./Card.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

const Card = (props: CardProps) => {
  const {
    mt,
    ml,
    mb,
    mr,
    pt,
    pl,
    pb,
    pr,
    as: Component = "div",
    borderRadius,
    children,
    className,
    ...rest
  } = props;

  return (
    <Component
      className={cx(
        `${mt ? `mt-${mt}` : ""}`,
        `${ml ? `ml-${ml}` : ""}`,
        `${mb ? `mb-${mb}` : ""}`,
        `${mr ? `mr-${mr}` : ""}`,
        `${pt ? `pt-${pt}` : ""}`,
        `${pl ? `pl-${pl}` : ""}`,
        `${pb ? `pb-${pb}` : ""}`,
        `${pr ? `pr-${pr}` : ""}`,
        `${borderRadius ? `border-radius-${borderRadius}` : ""}`,
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Card;
