import { Button } from "rsuite";
import ButtonComponentProps from "./types";
import style from "./Button.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

const ButtonComponent = (props: ButtonComponentProps) => {
  const {
    backgroundColor = "white",
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
    ...rest
  } = props;
  return (
    <Button
      {...rest}
      className={cx(
        `${backgroundColor ? `background-color-${backgroundColor}` : ""}`,
        `${mt ? `mt-${mt}` : ""}`,
        `${ml ? `ml-${ml}` : ""}`,
        `${mb ? `mb-${mb}` : ""}`,
        `${mr ? `mr-${mr}` : ""}`,
        `${pt ? `pt-${pt}` : ""}`,
        `${pl ? `pl-${pl}` : ""}`,
        `${pb ? `pb-${pb}` : ""}`,
        `${pr ? `pr-${pr}` : ""}`,
        className
      )}
    >
      {children}
    </Button>
  );
};

export default ButtonComponent;
