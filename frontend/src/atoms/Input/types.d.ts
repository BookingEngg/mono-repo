import { InputProps } from "rsuite";
import { Colors, MarginProps, Sizes } from "../../typings";

type InputComponentProps = InputProps &
  MarginProps & {
    label?: strig;
    labelSize?: Sizes;
    labelColor?: Colors;
    setInput: (string) => void;
  };

export default InputComponentProps;
