import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import '../styles/ChatsPage.css';
import { HiSearch } from "react-icons/hi";
import pfp from '../images/avatar18.jpg'

const dChats = [
  {
    id: 1,
    name: "John Doe",
    notification: true,
    text: "Hey, what's up?",
  },
  {
    id: 2,
    name: "Jane Smith",
    notification: false,
    text: "Are you free this weekend?",
  },
  {
    id: 3,
    name: "Alice Johnson",
    notification: true,
    text: "Don't forget the meeting!",
  },
  {
    id: 4,
    name: "Bob Brown",
    notification: false,
    text: "Can we reschedule our call?",
  },
  {
    id: 5,
    name: "Charlie Davis",
    notification: true,
    text: "Here's the report you asked for.",
  },
  {
    id: 6,
    name: "Diana Evans",
    notification: false,
    text: "Thanks for the update!",
  },
  {
    id: 7,
    name: "Ethan Green",
    notification: true,
    text: "How's the project going?",
  },
  {
    id: 8,
    name: "Fiona Harris",
    notification: true,
    text: "Reminder: team lunch tomorrow.",
  },
  {
    id: 9,
    name: "George King",
    notification: true,
    text: "Need your feedback on the draft.daddasd adwdawda dsdadadsada dadadasdas",
  },
  {
    id: 10,
    name: "Hannah Lee",
    notification: true,
    text: "Let's catch up soon!",
  },
];


const Chats = () => {
  const location = useLocation();
  const [path, setPath] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const {id} = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState(dChats);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredChats(dChats);
    } else {
      setFilteredChats(dChats.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm]);

  useEffect(() => {
    if (location.pathname.includes('group-chats')) setPath('group-chats');
    else if (location.pathname.includes('chats')) setPath('chats');
  }, [location])

  const isActiveChat = (chatId) => {
    return chatId === parseInt(id);
  };

  return (
    <div className="chats">
      <div className="search d-flex justify-content-between">
        <h5>Chats</h5>
        <div className="search-bar d-flex justify-content-end">
          <input type="search" placeholder='Search Chats'  className={showSearchBar && 'expand'} onChange={(e) => setSearchTerm(e.target.value)}/>
          <h5 onClick={() => setShowSearchBar(!showSearchBar)} style={{cursor: "pointer"}}><HiSearch /></h5>
        </div>
      </div>
      <div className="chats-menu">
        {
          filteredChats.map((chat, index) => <Link key={index} to={`/${path}/${chat.id}`} className={`recent-chat d-flex ${isActiveChat(chat.id) ? 'active-chat' : ''}`}>  
            <div className="recent-chat-description">
              <div className="recent-chat-img me-3">
                <img src={pfp} alt="" />
              </div>
              <div className="recent-chat-body truncate-text">
                <h5 style={{margin:'0', color: "#F7F8FB"}}>{chat.name}</h5>
                <p style={{margin:'0', color: "#B1B3BA"}}>{chat.text}</p>
              </div>
            </div>
            {chat.notification && <div className="notification">
              <span></span>
            </div>}
          </Link>)
        }
      </div>
    </div>
  )
}

export default Chats