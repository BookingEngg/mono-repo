import React from "react";
import { IconProps } from "./types";
import { SizesMapper } from "./Constants";

const Profitability = (props: IconProps): JSX.Element => {
  const { height = 24, width = 24, align = 'middle', contentGap = "sm" } = props;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: align, marginRight: SizesMapper[contentGap] }}
    >
      <path
        d="M17.99 8.578a.498.498 0 0 0-.576-.57.692.692 0 0 0-.101-.007h-2.26a.5.5 0 0 0 0 1h1.42l-3.643 4.67-2.897-2.934a.687.687 0 0 0-1.02.048l-2.798 3.397a.5.5 0 1 0 .77.634l2.578-3.129 2.903 2.942a.687.687 0 0 0 1.03-.063l3.602-4.614-.002.949a.5.5 0 0 0 1 .001L18 8.69a.685.685 0 0 0-.008-.11z"
        fill="var(--primary)"
      />
    </svg>
  );
};

export default Profitability;
