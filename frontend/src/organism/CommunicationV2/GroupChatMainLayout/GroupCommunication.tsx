import React, { useState } from 'react';
import './style.scss';

interface Group {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  messages: {
    sender: string;
    message: string;
    time: string;
    self?: boolean;
  }[];
}

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Whitmans Chat',
    lastMessage: 'Ned: Yeah, I think I know what y...',
    time: '11:45',
    unreadCount: 3,
    messages: [
      { sender: 'Peter Whitman', message: '🚋 😄 😍 👌 🧠 🤯 🫢', time: '11:38' },
      { sender: 'You', message: 'Any plans for tonight?', time: '11:39', self: true },
      { sender: 'Thomas Stewart', message: 'Nice! I definitely feel like surfing this afternoon', time: '11:39' },
    ],
  },
  {
    id: '2',
    name: 'Stewart Family',
    lastMessage: 'Steve: Great, thanks!',
    time: '11:39',
    unreadCount: 1,
    messages: [
      { sender: 'Steve', message: 'Great, thanks!', time: '11:39' },
    ],
  },
];

const GroupCommunication: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  return (
    <div className="wa-container">
      <div className="wa-sidebar">
        <div className="wa-search">
          <input type="text" placeholder="Search or start new chat" />
        </div>
        <ul className="wa-group-list">
          {mockGroups.map((group) => (
            <li
              key={group.id}
              className={`wa-group-item ${selectedGroup?.id === group.id ? 'active' : ''}`}
              onClick={() => setSelectedGroup(group)}
            >
              <img src="https://placehold.co/40x40" alt="group" className="wa-group-avatar" />
              <div className="wa-group-info">
                <div className="wa-group-name-time">
                  <span className="wa-group-name">{group.name}</span>
                  <span className="wa-group-time">{group.time}</span>
                </div>
                <div className="wa-group-last">
                  <span>{group.lastMessage}</span>
                  {group.unreadCount ? (
                    <span className="wa-unread-badge">{group.unreadCount}</span>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="wa-chat">
        {selectedGroup ? (
          <>
            <div className="wa-chat-header">
              <img src="https://placehold.co/40x40" alt="avatar" className="wa-chat-avatar" />
              <div className="wa-chat-title-group">
                <span className="wa-chat-title">{selectedGroup.name}</span>
                <span className="wa-chat-subtitle">You, Peter, Thomas</span>
              </div>
              <div className="wa-chat-icons">⋮</div>
            </div>
            <div className="wa-chat-body">
              {selectedGroup.messages.map((msg, idx) => (
                <div key={idx} className={`wa-msg ${msg.self ? 'self' : ''}`}>
                  <div className="wa-msg-content">
                    <span>{msg.message}</span>
                    <div className="wa-msg-time">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="wa-chat-input">
              <input type="text" placeholder="Type a message" />
            </div>
          </>
        ) : (
          <div className="wa-no-data">No data</div>
        )}
      </div>
    </div>
  );
};

export default GroupCommunication;
