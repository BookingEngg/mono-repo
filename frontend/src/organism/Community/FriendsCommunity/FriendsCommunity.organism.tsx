import { Button, ButtonGroup, FlexboxGrid } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";

const AllFriendsCommunity = () => {
  return (
    <FlexboxGrid>
      <FlexboxGridItem colspan={24}>
        All Friends
      </FlexboxGridItem>

      <FlexboxGridItem colspan={24}></FlexboxGridItem>
    </FlexboxGrid>
  );
};

export default AllFriendsCommunity;
