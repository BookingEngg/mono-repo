import React from "react";
import { IconProps } from "./types";
import { SizesMapper } from "./Constants";

const Payment = (props: IconProps): JSX.Element => {
  const { height = 24, width = 24, align = 'middle', contentGap = "sm" } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="currentColor"
      style={{
        verticalAlign: align,
        marginRight: SizesMapper[contentGap],
      }}
    >
      <path d="M21 6H3C1.9 6 1 6.9 1 8v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 2v2H4V8h16zm-8 7c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1h-6z" />
    </svg>
  );
};

export default Payment;
