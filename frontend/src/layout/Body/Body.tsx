import { PropsWithChildren } from "react";
import style from "./Body.module.scss";
import classNames from "classnames/bind";
import { useAppSelector } from "@/store/hooks";
import { isUserAuthorized } from "@/store/auth";

const cx = classNames.bind(style);

const Body = ({ children }: PropsWithChildren): JSX.Element => {
  const isAuthorized = useAppSelector(isUserAuthorized);

  return (
    <section
      className={cx(`${isAuthorized ? "content-auth" : "content-login"}`)}
    >
      {children}
    </section>
  );
};

export default Body;
