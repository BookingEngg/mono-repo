import React from "react";
import { IconProps } from "./types";

type DropdownCaretIconType = IconProps & {
  rotate: "top" | "bottom" | "left" | "right";
};

const rotation = {
  top: `0`,
  bottom: `180deg`,
  left: `-90deg`,
  right: `90deg`,
};

const DropDown = (props: DropdownCaretIconType): JSX.Element => {
  return (
    <svg
      style={{
        transition: `all .5s`,
        verticalAlign: props.align,
        transform: `rotate(${rotation[props.rotate]})`,
      }}
      width={props.width}
      height={props.height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={props.fillPath}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.865 10.856a.426.426 0 0 1-.643-.005L8.026 6.175l-4.25 4.678a.426.426 0 0 1-.643 0 .536.536 0 0 1 0-.706l4.52-4.976.322.353-.322-.353a.497.497 0 0 1 .752.002l4.464 4.976a.536.536 0 0 1-.004.707z"
      />
    </svg>
  );
};

DropDown.defaultProps = {
  width: 16,
  height: 16,
  fillPath: "white",
  align: "middle",
  rotate: "bottom",
} as IconProps;

export default DropDown;
