import React, { useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useLocation, useLoaderData } from 'react-router-dom';

import '../styles/ChatsPage.css';
import { ImAttachment } from "react-icons/im";
import { FaTrash } from "react-icons/fa6";
import { TiArrowSortedUp } from "react-icons/ti";
import { IoArrowBack } from "react-icons/io5";
import pfp from '../images/avatar18.jpg'

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const messages = [
    { text: "Hey there!", sender: "me" },
    { text: "Hello! How are you?", sender: "other" },
    { text: "I'm good, thanks! How about you?", sender: "me" },
    { text: "Doing great, working on a new project!", sender: "other" },
    { text: "That's awesome! Good luck!", sender: "me" },
    { text: "Hey there!", sender: "me" },
    { text: "Hello! How are you?", sender: "other" },
    { text: "I'm good, thanks! How about you?", sender: "me" },
    { text: "Doing great, working on a new project!", sender: "other" },
    { text: "That's awesome! Good luck!", sender: "me" },
    { text: "Hey there!", sender: "me" },
    { text: "Hello! How are you?", sender: "other" },
    { text: "I'm good, thanks! How about you? asdkjaiod aiudh aiudhasiudh", sender: "me" },
    { text: "Doing great, working on a new project!ajdhakj adhasdh ajdhaiud adba dhgaid aidba idbaidba i adasio dnaos dand", sender: "other" },
    { text: "That's awesome! Good luck!", sender: "me" },
  ];

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

  return (
    <div className='chat d-flex flex-column'>
      <div className="chat-info d-flex justify-content-between">
        <div className="user-details d-flex">
          {id && (
            <button className="back-button me-2" onClick={onBack}>
              <IoArrowBack />
            </button>
          )}
          <div className="user-img me-3">
            <img src={pfp} alt="" />
            <span></span>
          </div>
          <div className="user-name">
            <h5 style={{margin:'0', color: "#F7F8FB"}}>Name Name</h5>
            <p style={{margin:'0', color: "#616369"}}>Online</p>
          </div>
        </div>
        <div className="chat-info-icons d-flex gap-3">
          <Link><ImAttachment /></Link>
          <Link><FaTrash /></Link>
        </div>
      </div>

      <div className="chat-body">
        <div className="chat-body-content flex-grow-1">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === "me" ? "me" : "other"} ${index > 0 && msg.sender === messages[index - 1].sender ? 'no-gap' : ''}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            <span ref={endOfMessagesRef}></span>
          </div>
        </div>
        <div className="chat-prompt d-flex align-items-center">
          <input type="text" placeholder="Type a message..." />
          <button><TiArrowSortedUp /></button>
        </div>
      </div>
    </div>
  )
}

export default Chat;