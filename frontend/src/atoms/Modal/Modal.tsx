import { Modal } from "rsuite";
import ModalComponentProps from "./types";

const ModalComponent = (props: ModalComponentProps) => {
  const { children, ...rest } = props;
  return <Modal {...rest}>{children}</Modal>;
};

ModalComponent.Header = Modal.Header;
ModalComponent.Title = Modal.Title;
ModalComponent.Body = Modal.Body;
ModalComponent.Footer = Modal.Footer;

export default ModalComponent;
