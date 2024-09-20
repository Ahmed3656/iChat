import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import { useChats } from '../context/chatContext';
import axios from 'axios';

import ChatHeader from './ChatHeader';
import io from 'socket.io-client';

import '../styles/ChatsPage.css';
import LoadingPage from '../components/LoadingPage';
import { TiArrowSortedUp } from "react-icons/ti";

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currUser } = useContext(UserContext);
  const { chats, setChats } = useChats();

  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Socket.io implementation
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socket = useRef();
  const chatCompare = useRef();

  useEffect(() => {
    socket.current = io(process.env.REACT_APP_ASSETS_URL);
    socket.current.emit('setup', currUser);
    socket.current.on('connected', () => setSocketConnected(true));
    socket.current.on('typing', () => setIsTyping(true));
    socket.current.on('stop typing', () => setIsTyping(false));
  }, [])

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
        chatCompare.current = chatData;
        
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
    socket.current.on('message recieved', (recievedMessage) => {
      if(!chatCompare.current || chatCompare.current._id !== recievedMessage.chat._id){
        // notification
      }
      else {
        setMessages([...messages, recievedMessage]);
      }
    })
  })

  // Send a message function
  const sendMessage = async () => {
    const messageContent = document.querySelector('.chat-prompt input').value.trim(); 
    socket.current.emit('stop typing', chatInfo._id);
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
      
      socket.current.emit('new message', response.data);
    } catch (error) {
      setErrorMsg(error.message);
    }
  }

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

  // If no user is logged in
  useEffect(() => {
    if (!currUser) navigate('/login');
  }, [currUser]);

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

  // To scroll down to the last message
  const endOfMessagesRef = useRef(null);
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Typing handler function
  const typingHandler = (e) => {
    if(!socketConnected) return;

    if(!typing) {setTyping(true); socket.current.emit('typing', chatInfo._id)};
    let typingTime = new Date().getTime();
    var timer = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - typingTime;

      if(timeDiff >= timer && typing) {
        socket.current.emit('stop typing', chatInfo._id);
        setTyping(false);
      }
    }, timer)
  };

  return (
    (isLoading?
      <div style={{width: (windowWidth >= 1064 ? '70%' : '100%')}}>
        <LoadingPage />
      </div>
    :
      <div className='chat d-flex flex-column'>
        <ChatHeader chatInfo={chatInfo} setChatInfo={setChatInfo} setMessages={setMessages} otherUser={otherUser} setErrorMsg={setErrorMsg} />

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
            {isTyping&& <div>Loading...</div>}
            <span ref={endOfMessagesRef}></span>
            </div>
          </div>
          <div className="chat-prompt d-flex align-items-center">
            <input type="text" placeholder="Type a message..." onChange={typingHandler} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
            <button onClick={sendMessage}><TiArrowSortedUp /></button>
          </div>
        </div>
      </div>
    )
  );
};

export default Chat;
