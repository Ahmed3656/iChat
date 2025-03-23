import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context";
import { TiArrowSortedUp } from "react-icons/ti";

import { ChatHeader } from "./";
import { LoadingPage } from "../components";
import { useMessages, useWindowWidth } from "../hooks";
import { renderMessageContent } from "../utils";

import "../styles/ChatsPage.css";

export const ChatWindow = () => {
  const navigate = useNavigate();
  const { currUser } = useContext(UserContext);
  const [chatInfo, setChatInfo] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const endOfMessagesRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    setMessages,
    setErrorMsg,
    isLoading,
    createHandleSendMessage,
  } = useMessages(currUser, setChatInfo);
  const windowWidth = useWindowWidth();

  const getMessageContent = () => {
    return inputRef.current?.value.trim() || "";
  };

  const handleSendMessage = createHandleSendMessage(
    endOfMessagesRef,
    getMessageContent
  );
  const sendAndClearMessage = async () => {
    const success = await handleSendMessage();
    if (success && inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!currUser) navigate("/login");
  }, [currUser, navigate]);

  useEffect(() => {
    if (chatInfo && !chatInfo.isGroupChat) {
      const other = chatInfo.users.find((user) => user._id !== currUser.id);
      setOtherUser(other);
    }
  }, [chatInfo, currUser.id]);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div style={{ width: windowWidth >= 1064 ? "70%" : "100%" }}>
        <LoadingPage />
      </div>
    );
  }

  return (
    <div className="chat d-flex flex-column">
      <ChatHeader
        chatInfo={chatInfo}
        setChatInfo={setChatInfo}
        setMessages={setMessages}
        otherUser={otherUser}
        setErrorMsg={setErrorMsg}
      />

      <div className="chat-body">
        <div className="chat-body-content flex-grow-1">
          <div className="messages">
            {messages.map((msg, index) => {
              const isSameSender =
                index > 0 && msg.sender._id === messages[index - 1].sender._id;
              const isCurrUser = msg.sender._id === currUser.id;

              return (
                <div
                  key={index}
                  className={`message-container ${isCurrUser ? "me" : "other"}`}
                >
                  <img
                    src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${
                      msg.sender.profilePicture || "nullPic.jpg"
                    }`}
                    alt="User avatar"
                    className={`user-message-avatar ${
                      isSameSender && "hide-img"
                    }`}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      marginRight: "10px",
                    }}
                  />
                  <div
                    className={`message ${isCurrUser ? "me" : "other"} ${
                      isSameSender ? "no-gap" : ""
                    }`}
                  >
                    {renderMessageContent(msg)}
                  </div>
                </div>
              );
            })}
            <span ref={endOfMessagesRef}></span>
          </div>
        </div>
        <div className="chat-prompt d-flex align-items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendAndClearMessage();
            }}
          />
          <button onClick={sendAndClearMessage}>
            <TiArrowSortedUp />
          </button>
        </div>
      </div>
    </div>
  );
};
