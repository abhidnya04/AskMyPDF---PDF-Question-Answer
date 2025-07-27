import React, { useState } from "react";
import axios from "axios";
import "./SidebarChatItem.css"; // optional if you use CSS modules

const SidebarChatItem = ({ chat, fetchChats, setSelectedChatId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(chat.title);

  const handleRename = async () => {
    try {
      await axios.put(`http://localhost:5000/api/chats/${chat._id}`, {
        title: newName,
      });
      setIsRenaming(false);
      fetchChats();
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/chats/${chat._id}`);
      fetchChats();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div
      className="chat-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      {!isRenaming ? (
        <div
          className="chat-title"
          onClick={() => setSelectedChatId(chat._id)}
        >
          {chat.title}
        </div>
      ) : (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
          }}
          autoFocus
        />
      )}

      {isHovered && (
        <div className="dots" onClick={() => setShowMenu((prev) => !prev)}>
          ⋮
        </div>
      )}

      {showMenu && (
        <div className="menu">
          <div onClick={() => setIsRenaming(true)}>Rename</div>
          <div onClick={handleDelete}>Delete</div>
        </div>
      )}
    </div>
  );
};

export default SidebarChatItem;
