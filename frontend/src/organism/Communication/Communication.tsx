import { FlexboxGrid, Text } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import classNames from "classnames/bind";
import style from "./Communication.module.scss";
const cx = classNames.bind(style);

const userList: { name: string; updatedAt: string }[] = [
  {
    name: "Tushar Chand Thakur",
    updatedAt: "05:16 PM",
  },
  {
    name: "Tejasvi KumarThakur",
    updatedAt: "05:16 PM",
  },
  {
    name: "Manasvi Kumar Thakur",
    updatedAt: "05:16 PM",
  },
];

const Communication = () => {
  return (
    <FlexboxGrid align="middle" justify="space-between" className={cx("chat-container")}>
      <FlexboxGridItem colspan={7} className={cx("chat-left-container")}>
        <FlexboxGridItem>
          <Text size="xl">Chats</Text>
        </FlexboxGridItem>
        <FlexboxGrid>
          {userList.map((user) => (
            <FlexboxGridItem colspan={24} className={cx("left-chat-item")}>
              <FlexboxGrid justify="space-between">
                <FlexboxGridItem>{user.name}</FlexboxGridItem>
                <FlexboxGridItem>{user.updatedAt}</FlexboxGridItem>
              </FlexboxGrid>
            </FlexboxGridItem>
          ))}
        </FlexboxGrid>
      </FlexboxGridItem>
      <FlexboxGridItem colspan={16}>
        <FlexboxGrid>Messages</FlexboxGrid>
      </FlexboxGridItem>
    </FlexboxGrid>
  );
};

export default Communication;
