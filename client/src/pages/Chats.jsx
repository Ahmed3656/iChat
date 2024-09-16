import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/userContext';

import LoadingPage from '../components/LoadingPage';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import '../styles/ChatsPage.css';
import { HiSearch } from "react-icons/hi";
import { BsFillPlusSquareFill, BsX } from "react-icons/bs";
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
  const navigate = useNavigate();
  const { id } = useParams();
  const { currUser } = useContext(UserContext);
  const token = currUser?.token;

  const [chats, setChats] = useState([]);
  const [path, setPath] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(['John Doe', 'Jane Smith', 'Alice Johnson']);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    if(!token) navigate('/login');
  }, [token])

  /////////////////////////////////////////////////////////////// fetching from the server side

  useEffect(() => {
    const fetchChats = async (req, res) => {
      setErrorMsg('');
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/chats/`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}});
        let allChats = response?.data;
        //allChats = allChats.filter((chat) => chat.latestMessage != null);
        setChats(allChats);
        setFilteredChats(allChats);
      }
      catch (error) {
        setErrorMsg(error.message)
      }
      setIsLoading(false);
    }

    fetchChats();
  }, [])

  /////////////////////////////////////////////////////////////// component functions

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (location.pathname.includes('group-chats')) setPath('group-chats');
    else if (location.pathname.includes('chats')) setPath('chats');
  }, [location]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredChats(chats);
    } else {
      setFilteredChats(chats.filter(chat =>
        chat.chatName.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm]);

  const handleClose = () => {
    setShowModal(false);
    // to remove any info added
    // if (path === 'group-chats') {
    //   setSelectedUsers([]);
    //   setGroupName('');
    // }
  };

  const handleShow = () => setShowModal(true);

  const handleUserSelect = (userId) => {
    if (path === 'chats') {
      handleClose();
      navigate(`/chats/${userId}`);
    } else {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleRemoveUser = (user) => {
    setSelectedUsers(selectedUsers.filter(u => u !== user));
  };

  const handleCreateGroup = () => {
    console.log('Group Name:', groupName);
    console.log('Selected Users:', selectedUsers);
    handleClose();
  };

  const isActiveChat = (chatId) => {
    return chatId === id;
  };

  const capitalize = (fullName) => {
    if (typeof fullName !== 'string') return '';
  
    const nameParts = fullName.trim().split(' ');
  
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    }
  
    nameParts.forEach((name, index)=> {
      nameParts[index] = name.charAt(0).toUpperCase() + name.slice(1);
    })
  
    const capName = nameParts.join(' ');
  
    return capName.trim();
  };

  return (
    (isLoading?
      <div style={{width: (windowWidth >= 1064 ? '30%' : '100%')}}>
        <LoadingPage />
      </div>
    :
      <div className="chats">
        <div className="search d-flex justify-content-between">
          <h5>Chats</h5>
          <div className="search-bar d-flex justify-content-end">
            <input type="search" placeholder='Search Chats' className={showSearchBar && 'expand'} onChange={(e) => setSearchTerm(e.target.value)}/>
            <h5 onClick={() => setShowSearchBar(!showSearchBar)} style={{cursor: "pointer"}} data-tooltip="Search Chats">
              <HiSearch />
            </h5>
          </div>
          <div className='add-chat'>
            <BsFillPlusSquareFill onClick={handleShow} />
            <span>{path === 'chats' ? "New chat" : "New group"}</span>
          </div>
        </div>

        <div className="chats-menu">
        {filteredChats && 
         filteredChats.filter(chat => (path === 'group-chats' && chat.isGroupChat) || (path === 'chats' && !chat.isGroupChat)).length > 0?
          (filteredChats.map((chat, index) => {
            const shouldDisplay =
              (path === 'group-chats' && chat.isGroupChat) ||
              (path === 'chats' && !chat.isGroupChat);

            return shouldDisplay && (
              <Link key={index} to={`/${path}/${chat._id}`} className={`recent-chat d-flex ${isActiveChat(chat._id) ? 'active-chat' : ''}`}>
                <div className="recent-chat-description">
                  <div className="recent-chat-img me-3">
                    <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${chat.chatPfp ? chat.chatPfp : (chat.isGroupChat? 'groupNullPic.jpg' : 'nullPic.jpg')}`} alt=""/>
                  </div>
                  <div className="recent-chat-body truncate-text">
                    <h5 style={{ margin: '0', color: "#F7F8FB" }}>{chat.isGroupChat? chat.chatName : capitalize(chat.users[0]._id == currUser.id? chat.users[1].name : chat.users[0].name)}</h5>
                    <p style={{ margin: '0', color: "#B1B3BA" }}>{chat.latestMessage?.content}</p>
                  </div>
                </div>
                {chat.notification && (
                  <div className="notification">
                    <span></span>
                  </div>
                )}
              </Link>
            );
          }))
        :
          <h5 style={{ textAlign: 'center', color: '#B1B3BA', fontSize: '1.5rem', marginTop: '2rem' }}>This section is empty. Start a new conversation!</h5>
        }
        </div>

        <Modal show={showModal} onHide={handleClose} className='custom-modal'>
          <Modal.Header closeButton>
            <Modal.Title>
              {path === 'chats' ? 'Search Users' : 'Create New Group'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {path === 'group-chats' && (
              <Form.Group className="mb-3">
                <Form.Label>Group Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter group name" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </Form.Group>
            )}
            <Form.Group>
              <Form.Label>
                {path === 'chats' ? 'Search Users' : 'Add Users to Group'}
              </Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Search users" 
                // onChange logic will be handled later
              />
            </Form.Group>
            {path === 'group-chats' && (
              <div className="selected-users">
                {selectedUsers.map((user, index) => (
                  <div key={index} className="user-tag">
                    {user}
                    <BsX 
                      className="remove-icon"
                      onClick={() => handleRemoveUser(user)}
                    />
                  </div>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            {path === 'group-chats' && (
              <Button variant="primary" onClick={handleCreateGroup}>
                Create Group
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </div>
    )
  );
};

export default Chats