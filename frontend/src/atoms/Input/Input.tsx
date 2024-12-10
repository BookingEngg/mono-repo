import { Input } from "rsuite";
import InputComponentProps from "./types";
import style from "./Input.module.scss";
import classNames from "classnames/bind";
import Text from "../Text";
import FlexboxGrid from "../FlexboxGrid";

const cx = classNames.bind(style);

const InputComponent = (props: InputComponentProps) => {
  const {
    children,
    className,
    mt,
    ml,
    mb,
    mr,
    setInput,
    label,
    labelSize,
    labelColor,
    ...rest
  } = props;
  return (
    <FlexboxGrid direction="column" align="start" className={cx("input-cover")}>
      {label ? (
        <Text ml="sm" mb="sm" color={labelColor} size={labelSize}>
          {label}
        </Text>
      ) : (
        <></>
      )}
      <Input
        {...rest}
        className={cx(
          `${mt ? `mt-${mt}` : ""}`,
          `${ml ? `ml-${ml}` : ""}`,
          `${mb ? `mb-${mb}` : ""}`,
          `${mr ? `mr-${mr}` : ""}`,
          className
        )}
        onChange={setInput}
      >
        {children}
      </Input>
    </FlexboxGrid>
  );
};

export default InputComponent;

// Add InputGroup and InputGroup.Addon
