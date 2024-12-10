import { AccordionProps } from "rsuite";
import { MarginProps, PaddingProps } from "../../typings";

type AccordionComponentProps = AccordionProps &
  MarginProps &
  PaddingProps & {
    header?: string;
    panelText?: string;
    open?: boolean;
  };

export default AccordionComponentProps;
