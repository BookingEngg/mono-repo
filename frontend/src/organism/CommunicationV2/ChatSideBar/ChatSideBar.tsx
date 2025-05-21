import { Container, Row } from "rsuite";

const chatUserDummy = [
  {
    user_id: "1",
    username: "user1",
  },
  {
    user_id: "2",
    username: "user2",
  },
  {
    user_id: "3",
    username: "user3",
  },
  {
    user_id: "4",
    username: "user4",
  },
  {
    user_id: "5",
    username: "user5",
  },
  {
    user_id: "6",
    username: "user6",
  },
];

const ChatSideBar = () => {
  return (
    <Container>
      {
        chatUserDummy.map(user => {
          return <div>{user.username}</div>
        })
      }
    </Container>
  );
};

export default ChatSideBar;
