import { IconProps } from "./types";
import { SizesMapper } from "./Constants";

const Communication = (props: IconProps): JSX.Element => {
  const {
    height = 24,
    width = 24,
    align = "middle",
    contentGap = "sm",
  } = props;
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
      <path d="M4 2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4l-4 4-4-4H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 6v2h12V8H6zm0 4v2h8v-2H6z" />
    </svg>
  );
};

export default Communication;
