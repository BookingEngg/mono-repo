import { Accordion } from "rsuite";
import AccordionComponentProps from "./types";
import style from "./Accordion.module.scss";
import classNames from "classnames/bind";
import Text from "../Text";

const cx = classNames.bind(style);

const AccordionComponent = (props: AccordionComponentProps) => {
  const { header, panelText, bordered, open, className, ...rest } = props;
  return (
    <>
      <Accordion
        bordered={bordered}
        defaultActiveKey={open ? 1 : 0}
        className={cx("accordion", className)}
        {...rest}
      >
        <Accordion.Panel header={header} eventKey={1}>
          <Text>{panelText}</Text>
        </Accordion.Panel>
      </Accordion>
    </>
  );
};

export default AccordionComponent;
