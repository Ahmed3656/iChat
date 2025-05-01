import React, { useState, useRef, useContext } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { UserContext, useChats } from "../context";
import { IoArrowBack } from "react-icons/io5";
import { ImAttachment } from "react-icons/im";
import { BsThreeDotsVertical } from "react-icons/bs";
import "../styles/ChatsPage.css";

import { capitalizeFirstLast } from "../utils";
import { useAttachment } from "../hooks";
import { GroupChatInfoModal } from "../components";

export const ChatHeader = ({
  chatInfo,
  setChatInfo,
  setMessages,
  otherUser,
  setErrorMsg,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currUser } = useContext(UserContext);
  const { chats, setChats } = useChats();
  const [showModal, setShowModal] = useState(false);

  const endOfMessagesRef = useRef(null);
  const attachmentInputRef = useRef(null);

  const { sendAttachment } = useAttachment({
    id,
    currUser,
    setMessages,
    setChats,
    chats,
    endOfMessagesRef,
    setErrorMsg,
  });

  const onBack = () => {
    if (id) {
      if (location.pathname.startsWith("/chats")) {
        navigate("/chats");
      } else if (location.pathname.startsWith("/group-chats")) {
        navigate("/group-chats");
      }
    }
  };

  const handleAttachmentClick = () => {
    attachmentInputRef.current.click();
  };

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  return (
    <>
      <div className="chat-info d-flex justify-content-between">
        <div className="user-details d-flex">
          {id && (
            <button className="back-button me-2" onClick={onBack}>
              <IoArrowBack />
            </button>
          )}
          <div className="user-img me-3">
            <img
              src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${
                chatInfo?.isGroupChat
                  ? chatInfo?.chatPfp || "groupNullPic.jpg"
                  : otherUser?.profilePicture
              }`}
              alt=""
            />
          </div>
          <div className="user-name d-flex flex-column justify-content-center">
            <h5 style={{ margin: "0", color: "#F7F8FB" }}>
              {chatInfo?.isGroupChat
                ? chatInfo?.chatName
                : capitalizeFirstLast(otherUser?.name)}
            </h5>
            {!chatInfo?.isGroupChat && (
              <p style={{ margin: "0", color: "#616369" }}>Online</p>
            )}
          </div>
        </div>
        <div className="chat-info-icons d-flex gap-3">
          <input
            type="file"
            ref={attachmentInputRef}
            style={{ display: "none" }}
            onChange={sendAttachment}
          />
          <Link>
            <ImAttachment onClick={handleAttachmentClick} />
          </Link>
          <Link onClick={handleModalShow}>
            <BsThreeDotsVertical />
          </Link>
        </div>
      </div>

      <GroupChatInfoModal
        showModal={showModal}
        handleClose={handleModalClose}
        chatInfo={chatInfo}
        setChatInfo={setChatInfo}
        otherUser={otherUser}
        currUser={currUser}
        chats={chats}
        setChats={setChats}
        setErrorMsg={setErrorMsg}
      />
    </>
  );
};
