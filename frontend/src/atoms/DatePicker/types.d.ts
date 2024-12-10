import { DatePickerProps } from "rsuite";
import { MarginProps } from "../../typings";

export type DatePickerComponentProps = DatePickerProps &
  MarginProps & {
    setDate: (Date) => void;
    noCalanderIcon?: boolean;
  };
