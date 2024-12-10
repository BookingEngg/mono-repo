import { ButtonProps } from "rsuite";
import { Colors, MarginProps, PaddingProps } from "../../typings";

type ButtonComponentProps = ButtonProps &
  MarginProps &
  PaddingProps & {
    backgroundColor?: Colors;
  };

export default ButtonComponentProps;
