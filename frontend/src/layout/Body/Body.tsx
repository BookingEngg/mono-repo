import { PropsWithChildren } from "react";

const Body = ({ children }: PropsWithChildren): JSX.Element => {
  return <section className="w-full">{children}</section>;
};

export default Body;
