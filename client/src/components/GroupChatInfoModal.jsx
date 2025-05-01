import React, { useState, useRef, useEffect } from "react";
import { Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import { HiPencilSquare } from "react-icons/hi2";
import { MdOutlineChangeCircle } from "react-icons/md";
import {
  FaUserPlus,
  FaUserMinus,
  FaCrown,
  FaUserShield,
  FaUserSlash,
} from "react-icons/fa";
import { capitalize, capitalizeFirstLast } from "../utils";
import { useGroupChatActions } from "../hooks/useGroupChatActions";

export const GroupChatInfoModal = ({
  showModal,
  handleClose,
  chatInfo,
  setChatInfo,
  otherUser,
  currUser,
  chats,
  setChats,
  setErrorMsg,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [expandInput, setExpandInput] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchUsersInput = useRef(null);

  const {
    changeGroupName,
    changeGroupPic,
    searchUsers,
    addNewUser,
    setAdmin,
    removeAdmin,
    removeUser,
  } = useGroupChatActions({ currUser, setErrorMsg });

  const handleGroupNameChange = () => {
    if (!showInput) {
      setShowInput(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = chatInfo?.chatName || "";
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  const confirmChangeName = async (e) => {
    if (e.key === "Enter") {
      const newName = inputRef.current.value.trim();

      if (!newName || newName === chatInfo?.chatName) {
        setShowInput(false);
        return;
      }

      await changeGroupName(
        chatInfo?._id,
        newName,
        setChatInfo,
        setChats,
        chats,
        setShowInput
      );
    }
  };

  const handleGroupPicChange = async (event) => {
    const file = event.target.files[0];
    await changeGroupPic(
      file,
      chatInfo?._id,
      setChatInfo,
      setChats,
      chats,
      setIsUploading
    );
  };

  const handleSearchUsers = async () => {
    const query = searchUsersInput.current.value.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAddNewUser = async (user) => {
    await addNewUser(chatInfo?._id, user._id, setChatInfo);
  };

  const handleSetAdmin = async (user) => {
    await setAdmin(chatInfo?._id, user._id, setChatInfo);
  };

  const handleRemoveAdmin = async (user) => {
    await removeAdmin(chatInfo?._id, user._id, setChatInfo);
  };

  const handleRemoveUser = async (user) => {
    await removeUser(chatInfo?._id, user._id, setChatInfo);
  };

  // Reset modal state when closed
  useEffect(() => {
    if (!showModal) {
      setShowInput(false);
      setExpandInput(false);
      setSearchResults([]);
    }
  }, [showModal]);

  const isUserAdmin = () => {
    if (!chatInfo) return false;
    return (
      currUser.id === chatInfo?.mainAdmin?._id ||
      chatInfo?.groupAdmins?.some((admin) => admin._id === currUser.id)
    );
  };

  return (
    <Modal show={showModal} onHide={handleClose} className="custom-modal">
      <Modal.Header className="d-flex flex-column align-items-center">
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={handleClose}
          style={{ position: "absolute", top: "1.5rem", right: "1rem" }}
        />
        <Modal.Title style={{ marginBottom: "1rem", textAlign: "center" }}>
          {showInput && (
            <div className="change-name-input">
              <input type="text" ref={inputRef} onKeyDown={confirmChangeName} />
            </div>
          )}
          {chatInfo?.isGroupChat
            ? chatInfo?.chatName
            : capitalize(otherUser?.name)}
          {isUserAdmin() && (
            <OverlayTrigger
              placement="top"
              delay={{ show: 500, hide: 0 }}
              overlay={<Tooltip>Change Group Name</Tooltip>}
            >
              <span
                className="icon-btn change-name-badge"
                onClick={handleGroupNameChange}
              >
                <HiPencilSquare />
              </span>
            </OverlayTrigger>
          )}
        </Modal.Title>
        <img
          src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${
            chatInfo?.isGroupChat
              ? chatInfo?.chatPfp || "groupNullPic.jpg"
              : otherUser?.profilePicture
          }`}
          style={{
            width: "8rem",
            aspectRatio: "1/1",
            borderRadius: "50%",
            border: "4px solid #1885FF",
          }}
          alt=""
        />
        {isUserAdmin() && (
          <div className="add-user-div">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleGroupPicChange}
              accept="image/*"
            />
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip>
                  {isUploading ? "Uploading..." : "Change Group Picture"}
                </Tooltip>
              }
            >
              <span
                className={`icon-btn change-pic-badge ${
                  isUploading ? "uploading" : ""
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <MdOutlineChangeCircle />
              </span>
            </OverlayTrigger>
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 500, hide: 0 }}
              overlay={<Tooltip>Add User</Tooltip>}
            >
              <span
                className="icon-btn add-user-badge"
                onClick={() => {
                  setExpandInput(!expandInput);
                  setTimeout(() => {
                    if (searchUsersInput.current) {
                      searchUsersInput.current.focus();
                    }
                  }, 0);
                }}
              >
                <FaUserPlus />
              </span>
            </OverlayTrigger>
            <input
              type="text"
              className={`add-user-input ${expandInput && "expand"}`}
              ref={searchUsersInput}
              onChange={handleSearchUsers}
              placeholder="Search users..."
            />
          </div>
        )}
      </Modal.Header>
      <Modal.Body>
        {chatInfo &&
          (chatInfo?.isGroupChat ? (
            <>
              <div className="group-chat-body">
                {chatInfo.users.map((user) => (
                  <div key={user._id} className="user-item">
                    <img
                      src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${
                        user.profilePicture || "nullPic.jpg"
                      }`}
                      className="user-avatar"
                      alt={user.name}
                    />
                    <span className="user-name">
                      {capitalizeFirstLast(user.name)}
                    </span>
                    {user._id === chatInfo.mainAdmin._id ? (
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 500, hide: 0 }}
                        overlay={
                          <Tooltip id={`main-admin-tooltip-${user._id}`}>
                            Main Admin
                          </Tooltip>
                        }
                      >
                        <span className="main-admin-badge">
                          <FaCrown />
                        </span>
                      </OverlayTrigger>
                    ) : (
                      chatInfo.groupAdmins.some(
                        (admin) => admin._id === user._id
                      ) && (
                        <OverlayTrigger
                          placement="top"
                          delay={{ show: 500, hide: 0 }}
                          overlay={
                            <Tooltip id={`admin-tooltip-${user._id}`}>
                              Admin
                            </Tooltip>
                          }
                        >
                          <span className="admin-badge">
                            <FaUserShield />
                          </span>
                        </OverlayTrigger>
                      )
                    )}
                    {isUserAdmin() &&
                      user._id !== currUser.id &&
                      user._id !== chatInfo.mainAdmin._id &&
                      (chatInfo.groupAdmins.some(
                        (admin) => admin._id === user._id
                      ) ? (
                        <OverlayTrigger
                          placement="top"
                          delay={{ show: 500, hide: 0 }}
                          overlay={
                            <Tooltip id={`remove-admin-tooltip-${user._id}`}>
                              Remove Admin
                            </Tooltip>
                          }
                        >
                          <button
                            className="icon-btn remove-admin-btn"
                            onClick={() => handleRemoveAdmin(user)}
                          >
                            <FaUserSlash />
                          </button>
                        </OverlayTrigger>
                      ) : (
                        <OverlayTrigger
                          placement="top"
                          delay={{ show: 500, hide: 0 }}
                          overlay={
                            <Tooltip id={`set-admin-tooltip-${user._id}`}>
                              Set as Admin
                            </Tooltip>
                          }
                        >
                          <button
                            className="icon-btn set-admin-btn"
                            onClick={() => handleSetAdmin(user)}
                          >
                            <FaUserShield />
                          </button>
                        </OverlayTrigger>
                      ))}
                    {isUserAdmin() &&
                      user._id !== currUser.id &&
                      user._id !== chatInfo.mainAdmin._id && (
                        <OverlayTrigger
                          placement="top"
                          delay={{ show: 500, hide: 0 }}
                          overlay={
                            <Tooltip id={`remove-user-tooltip-${user._id}`}>
                              Remove User
                            </Tooltip>
                          }
                        >
                          <button
                            className="icon-btn remove-user-btn"
                            onClick={() => handleRemoveUser(user)}
                          >
                            <FaUserMinus />
                          </button>
                        </OverlayTrigger>
                      )}
                  </div>
                ))}
              </div>
              {expandInput && (
                <div className="search-results mt-3">
                  <h6 className="text-center">Search Results</h6>
                  {isSearching ? (
                    <p className="text-center">Searching...</p>
                  ) : searchResults.length > 0 ? (
                    <ul className="list-unstyled">
                      {searchResults.map((user) => (
                        <li
                          key={user._id}
                          className="search-result-item d-flex align-items-center justify-content-between mb-2 p-2 rounded"
                        >
                          <div className="d-flex align-items-center">
                            <img
                              src={`${
                                process.env.REACT_APP_ASSETS_URL
                              }/uploads/${
                                user.profilePicture || "nullPic.jpg"
                              }`}
                              alt={user.name}
                              className="search-result-avatar me-2"
                            />
                            <span>{capitalizeFirstLast(user.name)}</span>
                          </div>
                          {!chatInfo.users.some(
                            (chatUser) => chatUser._id === user._id
                          ) && (
                            <button
                              className="btn btn-sm btn-primary add-user-btn"
                              onClick={() => handleAddNewUser(user)}
                            >
                              Add
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center">No users found</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {otherUser?.email && (
                <p>
                  <strong>{`${capitalize(
                    otherUser.name.split(" ")[0]
                  )}'s email: `}</strong>{" "}
                  {otherUser.email}
                </p>
              )}
              {otherUser?.phone && (
                <p>
                  <strong>{`${capitalize(
                    otherUser.name.split(" ")[0]
                  )}'s phone number: `}</strong>{" "}
                  {otherUser.phone}
                </p>
              )}
            </>
          ))}
      </Modal.Body>
    </Modal>
  );
};
