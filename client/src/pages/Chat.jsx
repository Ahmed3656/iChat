import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import { useChats } from '../context/chatContext';
import axios from 'axios';

import '../styles/ChatsPage.css';
import { Modal, Tooltip, OverlayTrigger } from 'react-bootstrap';
import LoadingPage from '../components/LoadingPage';
import { ImAttachment } from "react-icons/im";
import { BsThreeDotsVertical } from "react-icons/bs";
import { TiArrowSortedUp } from "react-icons/ti";
import { IoArrowBack } from "react-icons/io5";
import { MdOutlineChangeCircle } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import { FaUserPlus, FaUserMinus, FaCrown, FaUserShield, FaUserSlash } from 'react-icons/fa';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currUser } = useContext(UserContext);
  const { chats, setChats } = useChats();

  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandInput, setExpandInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const handleClose = () => {setShowModal(false); setShowInput(false); setExpandInput(false); setSearchResults([])};
  const handleShow = () => setShowModal(true);
  
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const searchUsersInput = useRef(null);

  // Fetch the chat's messages function
  useEffect(() => {
    const fetchMessages = async () => {
      setErrorMsg('');
      setIsLoading(true);
      try {
        const chatResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/chats/${id}`, {withCredentials: true, headers: {Authorization: `Bearer ${currUser.token}`}});
        let chatData = chatResponse?.data;

        // Sort users before setting chatInfo
        if (chatData.isGroupChat) {
          const sortedUsers = [...chatData.users].sort((a, b) => {
            if (a._id === chatData.mainAdmin._id) return -1;
            if (b._id === chatData.mainAdmin._id) return 1;
            if (chatData.groupAdmins.includes(a._id) && !chatData.groupAdmins.includes(b._id)) return -1;
            if (!chatData.groupAdmins.includes(a._id) && chatData.groupAdmins.includes(b._id)) return 1;
            return 0;
          });
  
          chatData = { ...chatData, users: sortedUsers };
        }
  
        setChatInfo(chatData);
        
        const messageResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/messages/${id}`, {withCredentials: true, headers: {Authorization: `Bearer ${currUser.token}`}});
        setMessages(messageResponse?.data);
      } catch (error) {
        setErrorMsg(error.message);  
      }
      setIsLoading(false);
    }
    
    fetchMessages();
  }, [id]);

  // Send a message function
  const sendMessage = async () => {
    const messageContent = document.querySelector('.chat-prompt input').value.trim(); 
    if (!messageContent) return;
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/messages/`, { content: messageContent, chatId: id }, { withCredentials: true, headers: { Authorization: `Bearer ${currUser.token}` } });
      const newMessage = response.data;

      setMessages(prevMessages => [...prevMessages, newMessage]);
      setChats(() =>
        chats.map((chat) =>
          chat._id === id
            ? { ...chat, latestMessage: newMessage }
            : chat
        )
      );

      document.querySelector('.chat-prompt input').value = '';
      
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      setErrorMsg(error.message);
    }
  }

  // Send an attachment
  const handleAttachmentClick = () => {
    attachmentInputRef.current.click();
  };

  const sendAttachment = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', id);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/messages/attachment`,
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${currUser.token}`
          }
        }
      );

      const newMessage = response.data;
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setChats(() =>
        chats.map((chat) =>
          chat._id === id
            ? { ...chat, latestMessage: newMessage }
            : chat
        )
      );
      
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Error sending attachment');
    }
  };

  // Render a sent attachment
  const renderMessageContent = (msg) => {
    try {
      const content = JSON.parse(msg.content);
      if (content.type === 'image') {
        return <img src={`${process.env.REACT_APP_ASSETS_URL}${content.path}`} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '200px' }} />;
      } else if (content.type === 'video') {
        return <video src={`${process.env.REACT_APP_ASSETS_URL}${content.path}`} controls style={{ maxWidth: '100%', maxHeight: '200px' }} />;
      } else if (content.type === 'audio') {
        return <audio src={`${process.env.REACT_APP_ASSETS_URL}${content.path}`} controls />;
      } else {
        return <a href={`${process.env.REACT_APP_ASSETS_URL}${content.path}`} target="_blank" rel="noopener noreferrer" style={{color: '#00FF7F', textDecoration: 'underline'}}>Download Attachment</a>;
      }
    } catch (error) {
      return <p>{msg.content}</p>;
    }
  };

  // Function to set the other user
  useEffect(() => {
    if (chatInfo && !chatInfo.isGroupChat) {
      const other = chatInfo.users.find(user => user._id !== currUser.id);
      setOtherUser(other);
    }
  }, [chatInfo, currUser.id]);

  // Check the window width
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // To go back to chats on smaller screens
  const onBack = () => {
    if (id) {
      if (location.pathname.startsWith('/chats')) {
        navigate('/chats');
      } else if (location.pathname.startsWith('/group-chats')) {
        navigate('/group-chats');
      }
    }
  };

  // To scroll down to the last message
  const endOfMessagesRef = useRef(null);
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Functions to capitalize users' names
  const capitalize = (fullName) => {
    if (typeof fullName !== 'string') return '';
  
    const nameParts = fullName.trim().split(' ');
  
    nameParts.forEach((name, index) => {
      nameParts[index] = name.charAt(0).toUpperCase() + name.slice(1);
    });
  
    return nameParts.join(' ').trim();
  };

  const capitalizeFirstLast = (fullName) => {
    if (typeof fullName !== 'string') return '';
  
    const nameParts = fullName.trim().split(' ');
  
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    }
  
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].slice(1).toLowerCase();
  
    return `${firstName} ${lastName}`.trim();
  };

  ////////////////////////////////////////////////////////// Admin functions

  const changeGroupName = () => {
    if (!showInput) {
      setShowInput(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = chatInfo.chatName;
          inputRef.current.focus();
        }
      }, 0);
      return;
    }
  }

  const confirmChangeName = async (e) => {
    if (e.key === 'Enter') {
      const newName = inputRef.current.value.trim();
  
      if (!newName || newName === chatInfo.chatName) {
        setShowInput(false);
        return;
      }
  
      try {
        const response = await axios.patch(`${process.env.REACT_APP_BASE_URL}/chats/renamegroup`,
          { chatId: id, chatName: newName },
          { withCredentials: true, headers: { Authorization: `Bearer ${currUser.token}` } }
        );
  
        setChatInfo((prevInfo) => ({
          ...prevInfo,
          chatName: newName,
        }));

        const newChats = chats.map(chat => chat._id === id ? { ...chat, chatName: newName } : chat);
        setChats(newChats);
        
        setShowInput(false);
      } catch (error) {
        console.error('Error updating group name:', error);
        setErrorMsg(error.message);
      }
    }
  };

  const changeGroupPic = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('pfp', file);
    formData.append('chatId', id);

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/chats/changepfp`,
        formData,
        {
          withCredentials: true,
          headers: { 
            Authorization: `Bearer ${currUser.token}`
          }
        }
      );

      setChatInfo(prevInfo => ({
        ...prevInfo,
        chatPfp: response.data.chatPfp
      }));

      const updatedChats = chats.map(chat => 
        chat._id === id ? { ...chat, chatPfp: response.data.chatPfp } : chat
      );
      setChats(updatedChats);

      setIsUploading(false);
    } catch (error) {
      console.error('Error updating group picture:', error);
      setErrorMsg(error.response?.data?.message || 'Error updating group picture');
      setIsUploading(false);
    }
  };

  const searchUsers = async () => {
    const query = searchUsersInput.current.value.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/search?q=${query}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${currUser.token}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      setErrorMsg('Failed to search users');
    }
    setIsSearching(false);
  }

  const addNewUser = async (user) => {
    try {
      const response = await axios.patch(`${process.env.REACT_APP_BASE_URL}/chats/groupadd`, {chatId: chatInfo?._id, userId: user._id}, {
        withCredentials: true,
          headers: { 
            Authorization: `Bearer ${currUser.token}`
          }
      })

      setChatInfo(prevInfo => ({
        ...prevInfo,
        users: [...prevInfo.users, user]
      }));
    }
    catch (error) {
      setErrorMsg(error.message); 
    }
  }

  const setAdmin = async (user) => {
    try {
      const response = await axios.patch(`${process.env.REACT_APP_BASE_URL}/chats/setadmin`, {chatId: chatInfo?._id, userId: user._id}, {
        withCredentials: true,
          headers: { 
            Authorization: `Bearer ${currUser.token}`
          }
      })

      setChatInfo(prevInfo => ({
        ...prevInfo,
        groupAdmins: [...prevInfo.groupAdmins, user]
      }));
    }
    catch (error) {
      setErrorMsg(error.message); 
    }
  }

  const removeAdmin = async (user) => {
    try {
      const response = await axios.patch(`${process.env.REACT_APP_BASE_URL}/chats/removeadmin`, {chatId: chatInfo?._id, userId: user._id}, {
        withCredentials: true,
          headers: { 
            Authorization: `Bearer ${currUser.token}`
          }
      })

      let updatedAdmins = chatInfo.groupAdmins.filter((u) => u._id !== user._id); 
      setChatInfo({ ...chatInfo, groupAdmins: updatedAdmins });
    }
    catch (error) {
      setErrorMsg(error.message); 
    }
  }

  const removeUser = async (user) => {
    try {
      const response = await axios.patch(`${process.env.REACT_APP_BASE_URL}/chats/groupremove`, {chatId: chatInfo?._id, userId: user._id}, {
        withCredentials: true,
          headers: { 
            Authorization: `Bearer ${currUser.token}`
          }
      })

      let updatedUsers = chatInfo.users.filter((u) => u._id !== user._id); 
      setChatInfo({ ...chatInfo, users: updatedUsers });
    }
    catch (error) {
      setErrorMsg(error.message); 
    }
  }

  return (
    (isLoading?
      <div style={{width: (windowWidth >= 1064 ? '70%' : '100%')}}>
        <LoadingPage />
      </div>
    :
      <div className='chat d-flex flex-column'>
        <div className="chat-info d-flex justify-content-between">
          <div className="user-details d-flex">
            {id && (
              <button className="back-button me-2" onClick={onBack}>
                <IoArrowBack />
              </button>
            )}
            <div className="user-img me-3">
              <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${chatInfo?.isGroupChat ? (chatInfo?.chatPfp || 'groupNullPic.jpg') : otherUser?.profilePicture}`} alt="" />
            </div>
            <div className="user-name d-flex flex-column justify-content-center">
              <h5 style={{margin: '0', color: "#F7F8FB"}}>{chatInfo?.isGroupChat ? chatInfo?.chatName : capitalizeFirstLast(otherUser?.name)}</h5>
              {!chatInfo?.isGroupChat && <p style={{margin: '0', color: "#616369"}}>Online</p>}
            </div>
          </div>
          <div className="chat-info-icons d-flex gap-3">
            <input type="file" ref={attachmentInputRef} style={{ display: 'none' }} onChange={sendAttachment}/>
            <Link><ImAttachment onClick={handleAttachmentClick} /></Link>
            <Link onClick={handleShow}><BsThreeDotsVertical /></Link>
          </div>
        </div>

        <div className="chat-body">
          <div className="chat-body-content flex-grow-1">
            <div className="messages">
            {messages.map((msg, index) => {
              const isSameSender = index > 0 && msg.sender._id === messages[index - 1].sender._id;
              const isCurrUser = msg.sender._id === currUser.id;
              
              return (
                <div key={index} className={`message-container ${isCurrUser ? "me" : "other"}`}>
                  <img
                    src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${msg.sender.profilePicture || 'nullPic.jpg'}`}
                    alt="User avatar"
                    className={`user-message-avatar ${isSameSender && 'hide-img'}`}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                  />
                  <div className={`message ${isCurrUser ? "me" : "other"} ${isSameSender ? 'no-gap' : ''}`}>
                    {renderMessageContent(msg)}
                  </div>
                </div>
              );
            })}
            <span ref={endOfMessagesRef}></span>
            </div>
          </div>
          <div className="chat-prompt d-flex align-items-center">
            <input type="text" placeholder="Type a message..." onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
            <button onClick={sendMessage}><TiArrowSortedUp /></button>
          </div>
        </div>

        <Modal show={showModal} onHide={handleClose} className='custom-modal'>
          <Modal.Header className="d-flex flex-column align-items-center">
          <button type="button" className="btn-close" aria-label="Close" onClick={handleClose} style={{ position: 'absolute', top: '1.5rem', right: '1rem' }}></button>
            <Modal.Title style={{ marginBottom: '1rem', textAlign: 'center' }}>
              {showInput && <div className="change-name-input">
                <input type="text" ref={inputRef} onKeyDown={confirmChangeName} />
              </div>}
              {chatInfo?.isGroupChat ? chatInfo?.chatName : capitalize(otherUser?.name)}
                {(currUser.id === chatInfo?.mainAdmin?._id || chatInfo?.groupAdmins.some(admin => admin._id === currUser.id)) &&<OverlayTrigger placement="top" delay={{ show: 500, hide: 0 }} overlay={<Tooltip>Change Group Name</Tooltip>}>
                  <span className="icon-btn change-name-badge" onClick={changeGroupName}>
                    <HiPencilSquare />
                  </span>
                </OverlayTrigger>
              }
            </Modal.Title>
            <img 
              src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${chatInfo?.isGroupChat ? (chatInfo?.chatPfp || 'groupNullPic.jpg') : otherUser?.profilePicture}`} 
              style={{ width: '8rem', aspectRatio: '1/1', borderRadius: '50%', border: '4px solid #1885FF'}} alt="" />
              {(currUser.id === chatInfo?.mainAdmin?._id || chatInfo?.groupAdmins.some(admin => admin._id === currUser.id)) && <div className='add-user-div'>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={changeGroupPic} accept="image/*" />
                <OverlayTrigger placement="bottom" delay={{ show: 500, hide: 0 }} overlay={<Tooltip>{isUploading ? 'Uploading...' : 'Change Group Picture'}</Tooltip>}>
                  <span className={`icon-btn change-pic-badge ${isUploading ? 'uploading' : ''}`} onClick={() => fileInputRef.current?.click()}>
                    <MdOutlineChangeCircle />
                  </span>
                </OverlayTrigger>
                <OverlayTrigger placement="bottom" delay={{ show: 500, hide: 0 }} overlay={<Tooltip>Add User</Tooltip>}>
                  <span className="icon-btn add-user-badge" onClick={() => {setExpandInput(!expandInput); searchUsersInput.current.focus()}}>
                    <FaUserPlus />
                  </span>
                </OverlayTrigger>
                <input 
                  type="text" 
                  className={`add-user-input ${expandInput && 'expand'}`} 
                  ref={searchUsersInput} 
                  onChange={searchUsers} 
                  placeholder="Search users..."
                />
              </div>
              }
          </Modal.Header>
          <Modal.Body>
            {chatInfo && (chatInfo?.isGroupChat ? (
              <>
                <div className="group-chat-body">
                  {chatInfo.users.map((user) => (
                    <div key={user._id} className="user-item">
                      <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${user.profilePicture || 'nullPic.jpg'}`} className="user-avatar"/>
                      <span className="user-name">{capitalizeFirstLast(user.name)}</span>
                      {user._id === chatInfo.mainAdmin._id ? (
                        <OverlayTrigger placement="top" delay={{ show: 500, hide: 0 }} overlay={<Tooltip id={`main-admin-tooltip-${user._id}`}>Main Admin</Tooltip>}>
                          <span className="main-admin-badge">
                            <FaCrown />
                          </span>
                        </OverlayTrigger>
                      ) : chatInfo.groupAdmins.some(admin => admin._id === user._id) && (
                        <OverlayTrigger placement="top" delay={{ show: 500, hide: 0 }} overlay={<Tooltip id={`admin-tooltip-${user._id}`}>Admin</Tooltip>}>
                          <span className="admin-badge">
                            <FaUserShield />
                          </span>
                        </OverlayTrigger>
                      )}
                      {(currUser.id === chatInfo.mainAdmin._id || chatInfo.groupAdmins.some(admin => admin._id === currUser.id)) && user._id !== currUser.id && user._id !== chatInfo.mainAdmin._id && (
                        chatInfo.groupAdmins.some(admin => admin._id === user._id) ? (
                          <OverlayTrigger placement="top" delay={{ show: 500, hide: 0 }} overlay={<Tooltip id={`remove-admin-tooltip-${user._id}`}>Remove Admin</Tooltip>}>
                            <button className="icon-btn remove-admin-btn" onClick={() => removeAdmin(user)}>
                              <FaUserSlash />
                            </button>
                          </OverlayTrigger>
                        ) : (
                          <OverlayTrigger placement="top" delay={{ show: 500, hide: 0 }} overlay={<Tooltip id={`set-admin-tooltip-${user._id}`}>Set as Admin</Tooltip>}>
                            <button className="icon-btn set-admin-btn" onClick={() => setAdmin(user)}>
                              <FaUserShield />
                            </button>
                          </OverlayTrigger>
                        )
                      )}
                      {(currUser.id === chatInfo.mainAdmin._id || chatInfo.groupAdmins.some(admin => admin._id === currUser.id)) && user._id !== currUser.id && user._id !== chatInfo.mainAdmin._id && (
                        <OverlayTrigger placement="top" delay={{ show: 500, hide: 0 }} overlay={<Tooltip id={`remove-user-tooltip-${user._id}`}>Remove User</Tooltip>}>
                          <button className="icon-btn remove-user-btn" onClick={() => removeUser(user)}>
                            <FaUserMinus />
                          </button>
                        </OverlayTrigger>
                      )}
                    </div>
                  ))}
                </div>
                {expandInput && (
                  <div className="search-results mt-3">
                    <h6 className='text-center'>Search Results</h6>
                    {isSearching ? (
                      <p className='text-center'>Searching...</p>
                    ) : searchResults.length > 0 ? (
                      <ul className="list-unstyled">
                        {searchResults.map((user) => (
                          <li key={user._id} className="search-result-item d-flex align-items-center justify-content-between mb-2 p-2 rounded">
                            <div className="d-flex align-items-center">
                              <img 
                                src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${user.profilePicture || 'nullPic.jpg'}`} 
                                alt={user.name} 
                                className="search-result-avatar me-2"
                              />
                              <span>{capitalizeFirstLast(user.name)}</span>
                            </div>
                            {!chatInfo.users.some(chatUser => chatUser._id === user._id) && (
                              <button 
                                className="btn btn-sm btn-primary add-user-btn"
                                onClick={() => addNewUser(user)}
                              >
                                Add
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className='text-center'>No users found</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {otherUser?.email && <p><strong>{`${capitalize(otherUser.name.split(' ')[0])}'s email: `}</strong> {otherUser.email}</p>}
                {otherUser?.phone && <p><strong>{`${capitalize(otherUser.name.split(' ')[0])}'s phone number: `}</strong> {otherUser.phone}</p>}
              </>
            ))}
          </Modal.Body>
        </Modal>
      </div>
    )
  );
};

export default Chat;
