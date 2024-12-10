import { InputGroup } from "rsuite";
import { InputGroupComponentProps } from "./types";
import style from "./InputGroup.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

const InputGroupComponent = (props: InputGroupComponentProps) => {
  const { children, className, mt, ml, mb, mr, ...rest } = props;
  return (
    <InputGroup
      {...rest}
      className={cx(
        `${mt ? `mt-${mt}` : ""}`,
        `${ml ? `ml-${ml}` : ""}`,
        `${mb ? `mb-${mb}` : ""}`,
        `${mr ? `mr-${mr}` : ""}`,
        className
      )}
    >
      {children}
    </InputGroup>
  );
};

InputGroupComponent.Addon = InputGroup.Addon;

export default InputGroupComponent;
