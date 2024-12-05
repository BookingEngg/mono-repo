import { PropsWithChildren } from "react";
import style from "./Body.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

const Body = ({ children }: PropsWithChildren): JSX.Element => {
  return <section className={cx("content")}>{children}</section>;
};

export default Body;
