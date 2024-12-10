import { TextProps } from "rsuite";
import { Colors, MarginProps } from "../../typings";

type TextComponentProps = Omit<TextProps, "color"> &
  MarginProps & {
    color?: Colors;
  };

export default TextComponentProps;
