import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import '../styles/ChatsPage.css';
import LoadingPage from '../components/LoadingPage';
import { ImAttachment } from "react-icons/im";
import { BsThreeDotsVertical } from "react-icons/bs";
import { TiArrowSortedUp } from "react-icons/ti";
import { IoArrowBack } from "react-icons/io5";

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currUser } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setErrorMsg('');
      setIsLoading(true);
      try {
        const chatResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/chats/${id}`, {withCredentials: true, headers: {Authorization: `Bearer ${currUser.token}`}});
        setChatInfo(chatResponse?.data);
        
        const messageResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/messages/${id}`, {withCredentials: true, headers: {Authorization: `Bearer ${currUser.token}`}});
        setMessages(messageResponse?.data);
      } catch (error) {
        setErrorMsg(error.message);  
      }
      setIsLoading(false);
    }
    
    fetchMessages();
  }, [id]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onBack = () => {
    if (id) {
      if (location.pathname.startsWith('/chats')) {
        navigate('/chats');
      } else if (location.pathname.startsWith('/group-chats')) {
        navigate('/group-chats');
      }
    }
  };

  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    const messageContent = document.querySelector('.chat-prompt input').value.trim(); 
    if (!messageContent) return;
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/messages/`, { content: messageContent, chatId: id }, { withCredentials: true, headers: { Authorization: `Bearer ${currUser.token}` } });
      const newMessage = response.data;

      setMessages(prevMessages => [...prevMessages, newMessage]);
      document.querySelector('.chat-prompt input').value = '';
      
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      setErrorMsg(error.message);
    }
  }

  const capitalize = (fullName) => {
    if (typeof fullName !== 'string') return '';
  
    const nameParts = fullName.trim().split(' ');
  
    nameParts.forEach((name, index) => {
      nameParts[index] = name.charAt(0).toUpperCase() + name.slice(1);
    });
  
    return nameParts.join(' ').trim();
  };

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
              <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${chatInfo?.chatPfp ? chatInfo.chatPfp : (chatInfo?.isGroupChat ? 'groupNullPic.jpg' : 'nullPic.jpg')}`} alt="" />
            </div>
            <div className="user-name">
              <h5 style={{margin: '0', color: "#F7F8FB"}}>{chatInfo?.isGroupChat ? chatInfo?.chatName : capitalize(chatInfo?.users[0]._id === currUser._id ? chatInfo?.users[1].name : chatInfo?.users[0].name)}</h5>
              <p style={{margin: '0', color: "#616369"}}>Online</p>
            </div>
          </div>
          <div className="chat-info-icons d-flex gap-3">
            <Link><ImAttachment /></Link>
            <Link onClick={handleShow}><BsThreeDotsVertical /></Link>
          </div>
        </div>

        <div className="chat-body">
          <div className="chat-body-content flex-grow-1">
            <div className="messages">
            {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender._id === currUser.id ? "me" : "other"} ${index > 0 && msg.sender._id === messages[index - 1].sender._id ? 'no-gap' : ''}`}>
                  <p>{msg.content}</p>
                </div>
              ))}
              <span ref={endOfMessagesRef}></span>
            </div>
          </div>
          <div className="chat-prompt d-flex align-items-center">
            <input type="text" placeholder="Type a message..." onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
            <button onClick={sendMessage}><TiArrowSortedUp /></button>
          </div>
        </div>

        {/* Modal for chat info */}
        <Modal show={showModal} onHide={handleClose} className='custom-modal'>
          <Modal.Header closeButton>
            <Modal.Title>Chat Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {chatInfo && (
              <>
                <p><strong>Chat Name:</strong> {chatInfo.isGroupChat ? chatInfo.chatName : capitalize(chatInfo.users[0]._id === currUser._id ? chatInfo.users[1].name : chatInfo.users[0].name)}</p>
                <p><strong>Group Chat:</strong> {chatInfo.isGroupChat ? 'Yes' : 'No'}</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  );
};

export default Chat;
