import { Text } from "rsuite";
import TextComponentProps from "./types";
import style from "./Text.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

const TextComponent = (props: TextComponentProps) => {
  const { children, className, color, mt, ml, mb, mr, ...rest } = props;
  return (
    <Text
      {...rest}
      className={cx(
        className,
        "common-font-style",
        `${color ? `color-${color}` : ""}`,
        `${mt ? `mt-${mt}` : ""}`,
        `${ml ? `ml-${ml}` : ""}`,
        `${mb ? `mb-${mb}` : ""}`,
        `${mr ? `mr-${mr}` : ""}`
      )}
    >
      {children}
    </Text>
  );
};

export default TextComponent;
