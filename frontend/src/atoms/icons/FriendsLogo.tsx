import React from "react";
import { IconProps } from "./types";
import { SizesMapper } from "./Constants";

const FriendsLogo = (props: IconProps): JSX.Element => {
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
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-9c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-3 4c2.33 0 4.31 1.46 5.11 3.5-.81.5-1.75.81-2.81.92-1.42.14-2.88-.09-4.19-.63C9.17 18.21 10.94 17 12 17z" />
    </svg>
  );
};

export default FriendsLogo;
