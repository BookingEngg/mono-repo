import { Button, ButtonGroup, FlexboxGrid } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";

const Community = () => {
  return (
    <FlexboxGrid>
      <FlexboxGridItem colspan={24}>
        Hello World
      </FlexboxGridItem>

      <FlexboxGridItem colspan={24}></FlexboxGridItem>
    </FlexboxGrid>
  );
};

export default Community;
