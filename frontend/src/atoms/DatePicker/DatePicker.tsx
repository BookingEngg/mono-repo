import { DatePicker } from "rsuite";
import { DatePickerComponentProps } from "./types";
import style from "./DatePicker.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

const DatePickerComponent = (props: DatePickerComponentProps) => {
  const {
    children,
    className,
    mt,
    ml,
    mb,
    mr,
    noCalanderIcon,
    setDate,
    ...rest
  } = props;
  return (
    <DatePicker
      {...rest}
      className={cx(
        `${mt ? `mt-${mt}` : ""}`,
        `${ml ? `ml-${ml}` : ""}`,
        `${mb ? `mb-${mb}` : ""}`,
        `${mr ? `mr-${mr}` : ""}`,
        `${noCalanderIcon ? "no-calander-icon" : ""}`,
        className
      )}
      onChange={setDate}
    >
      {children}
    </DatePicker>
  );
};

export default DatePickerComponent;
