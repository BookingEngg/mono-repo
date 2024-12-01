import React from "react";
import { IconProps } from "./types";
import { SizesMapper } from "./Constants";

const SettingsIcon = (props: IconProps): JSX.Element => {
  const { height = 24, width = 24, align = 'middle', contentGap = "sm" } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      style={{ verticalAlign: align, marginRight: SizesMapper[contentGap] }}
    >
      <path d="M19.14 12.936c.036-.303.086-.606.086-.936s-.05-.633-.086-.936l2.036-1.593a.75.75 0 00.179-.939l-1.93-3.342a.75.75 0 00-.898-.354l-2.397.96a7.032 7.032 0 00-1.614-.936l-.364-2.556A.75.75 0 0013.25 2h-3.5a.75.75 0 00-.742.645l-.364 2.556a7.032 7.032 0 00-1.614.936l-2.397-.96a.75.75 0 00-.898.354L2.805 9.41a.75.75 0 00.179.939l2.036 1.593c-.036.303-.086.606-.086.936s.05.633.086.936L2.805 14.997a.75.75 0 00-.179.939l1.93 3.342a.75.75 0 00.898.354l2.397-.96c.505.383 1.047.696 1.614.936l.364 2.556a.75.75 0 00.742.645h3.5a.75.75 0 00.742-.645l.364-2.556a7.032 7.032 0 001.614-.936l2.397.96a.75.75 0 00.898-.354l1.93-3.342a.75.75 0 00-.179-.939l-2.036-1.593zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
    </svg>
  );
};

export default SettingsIcon;
