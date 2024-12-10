import { Divider } from "rsuite";
import DividerComponentProps from "./types";
import style from "./Divider.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

const DividerComponent = (props: DividerComponentProps) => {
  const { children, className, ...rest } = props;
  return (
    <Divider {...rest} className={cx(className)}>
      {children}
    </Divider>
  );
};

export default DividerComponent;
