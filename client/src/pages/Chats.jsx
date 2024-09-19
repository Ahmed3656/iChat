import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/userContext';
import { useChats } from '../context/chatContext';

import LoadingPage from '../components/LoadingPage';
import { Modal, Form, Button, ListGroup } from 'react-bootstrap';
import '../styles/ChatsPage.css';
import { HiSearch } from "react-icons/hi";
import { BsFillPlusSquareFill, BsX } from "react-icons/bs";


const Chats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currUser } = useContext(UserContext);
  const { chats, setChats } = useChats();
  const token = currUser?.token;

  const [path, setPath] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchResults, setSearchResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // Fetching chats from the server
  useEffect(() => {
    const fetchChats = async () => {
      setErrorMsg('');
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/chats/`, {
          withCredentials: true, 
          headers: { Authorization: `Bearer ${token}` },
        });
        let allChats = response?.data;

        setChats(allChats);
        setFilteredChats(allChats);
      } catch (error) {
        setErrorMsg(error.message);
      }
      setIsLoading(false);
    };

    fetchChats();
  }, []);

  useEffect(() => {
    setFilteredChats(chats);
  }, [chats])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set path based on URL
  useEffect(() => {
    if (location.pathname.includes('group-chats')) setPath('group-chats');
    else if (location.pathname.includes('chats')) setPath('chats');
  }, [location]);

  // Function to set the other user pfp
  const findOtherUser = (chat) => {
    if (chat && !chat.isGroupChat) {
      const other = chat.users.find(user => user._id !== currUser.id);
      
      return other;
    }
  };

  // Filter chats based on search term
  useEffect(() => {
    if (chatSearchTerm === '') {
      setFilteredChats(chats);
    } else {
      setFilteredChats(
        chats.filter((chat) =>
          chat.isGroupChat ?
          chat.chatName.toLowerCase().includes(chatSearchTerm.toLowerCase())
          :
          findOtherUser(chat).name.toLowerCase().includes(chatSearchTerm.toLowerCase())
        )
      );
    }
  }, [chatSearchTerm]);

  // Check for currently selected chat
  const isActiveChat = (chatId) => {
    return chatId === id;
  };

  // Function to handle latest message output
  const getLatestMessagePreview = (chat) => {
    if (!chat.latestMessage) return '';
  
    const senderName = capitalize(chat.latestMessage.sender.name);
    let content = '';
  
    try {
      const parsedContent = JSON.parse(chat.latestMessage.content);
      content = parsedContent.type || chat.latestMessage.content;
    } catch (error) {
      content = chat.latestMessage.content;
    }
  
    return (chat.latestMessage?.sender._id !== currUser.id ? `${senderName}: ${content}` : content);
  };

  // Modal show and close functions
  const handleClose = () => {
    setShowModal(false);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName('');
  };
  const handleShow = () => setShowModal(true);


  const handleUserSelect = (user) => {
    if (path === 'chats') {
      // For one-on-one chat
      onSelectUser(user._id);
    } else {
      // For group chat
      if (!selectedUsers.some((u) => u._id === user._id)) {
        setSelectedUsers((prev) => [...prev, user]);
        setSearchTerm('');
        setSearchResults([]);
      }
    }
  };

  const handleRemoveUser = (user) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
  };

  const handleCreateGroup = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/chats/creategroup`,
        {
          name: groupName,
          users: JSON.stringify(selectedUsers.map((user) => user._id)),
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${currUser.token}`,
          },
        }
      );

      setChats([...chats, response.data]);
      handleClose();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  // Function to perform the actual API call
  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/search`, {
        params: { q: query },
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${currUser.token}`,
        },
      });
      setSearchResults(data);
    } catch (err) {
      console.error('Search failed', err);
    }
    setIsSearching(false);
  };

  // Handle search input change with debounce
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setTypingTimeout(
      setTimeout(() => {
        if (value.trim() !== '') {
          performSearch(value);
        } else {
          setSearchResults([]);
        }
      }, 500) // Reduced to 500ms for better UX
    );
  };

  const onSelectUser = async (id) => {
    handleClose();
    const existingChat = chats.find((chat) =>
      chat.isGroupChat === false && 
      chat.users.some((user) => user._id === id)
    );

    if(!existingChat) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/chats`,
          { userId: id },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${currUser.token}`,
            },
          }
        );
        setChats([...chats, response.data]);
        navigate(`/chats/${response.data._id}`);
      } catch (error) {
        console.error('Error starting chat:', error);
      }
    }
    else navigate(`/chats/${existingChat._id}`);
  };

  // Capitalize names
  const capitalize = (fullName) => {
    if (typeof fullName !== 'string') return '';

    const nameParts = fullName.trim().split(' ');
  
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    }
  
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].slice(1).toLowerCase();
  
    return `${firstName} ${lastName}`.trim();
  };

  return isLoading ? (
    <div style={{ width: windowWidth >= 1064 ? '30%' : '100%' }}>
      <LoadingPage />
    </div>
  ) : (
    <div className="chats">
      <div className="search d-flex justify-content-between">
        <h5>{path === 'group-chats' ? 'Group Chats' : 'Chats'}</h5>
        <div className="search-bar d-flex justify-content-end">
          <input
            type="search"
            placeholder="Search Chats"
            className={showSearchBar && 'expand'}
            onChange={(e) => setChatSearchTerm(e.target.value)}
          />
          <h5
            onClick={() => setShowSearchBar(!showSearchBar)}
            style={{ cursor: 'pointer' }}
            data-tooltip="Search Chats"
          >
            <HiSearch />
          </h5>
        </div>
        <div className="add-chat">
          <BsFillPlusSquareFill onClick={handleShow} />
          <span>{path === 'chats' ? 'New chat' : 'New group'}</span>
        </div>
      </div>

      <div className="chats-menu">
        {filteredChats &&
        filteredChats.filter((chat) =>(path === 'group-chats' && chat.isGroupChat) ||(path === 'chats' && !chat.isGroupChat)).length > 0 ? (
          filteredChats.map((chat, index) => {
            const shouldDisplay =
              (path === 'group-chats' && chat.isGroupChat) ||
              (path === 'chats' && !chat.isGroupChat);

            return (
              shouldDisplay && (
                <Link
                  key={index}
                  to={`/${path}/${chat._id}`}
                  className={`recent-chat d-flex ${
                    isActiveChat(chat._id) ? 'active-chat' : ''
                  }`}
                >
                  <div className="recent-chat-description">
                    <div className="recent-chat-img me-3">
                      <img
                        src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${
                          chat.isGroupChat ? (chat.chatPfp || 'groupNullPic.jpg') : (findOtherUser(chat).profilePicture || 'nullPic.jpg')}`}
                        alt=""
                      />
                    </div>
                    <div className="recent-chat-body truncate-text">
                      <h5 style={{ margin: '0', color: '#F7F8FB' }}>
                        {chat.isGroupChat
                          ? chat.chatName
                          : capitalize(
                              chat.users[0]._id === currUser.id
                                ? chat.users[1].name
                                : chat.users[0].name
                            )}
                      </h5>
                      <p style={{ margin: '0', color: '#B1B3BA' }}>
                        {getLatestMessagePreview(chat)}
                      </p>
                    </div>
                  </div>
                  {chat.notification && (
                    <div className="notification">
                      <span></span>
                    </div>
                  )}
                </Link>
              )
            );
          })
        ) : (
          <h5 style={{textAlign: 'center',color: '#B1B3BA',fontSize: '1.5rem',marginTop: '2rem',}}>
            This section is empty. Start a new conversation!
          </h5>
        )}
      </div>

      {/* Modal for creating chats/groups */}
      <Modal show={showModal} onHide={handleClose} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            {path === 'chats' ? 'Search Users' : 'Create New Group'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {path === 'group-chats' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Group Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </Form.Group>

              {/* Display selected users with profile pictures */}
              <div className="selected-users d-flex mb-3">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="selected-user me-2 d-flex align-items-center"
                  >
                    <img
                      src={ `${process.env.REACT_APP_ASSETS_URL}/uploads/${user.profilePicture}` }
                      alt={user.name}
                      className="selected-user-img me-2"
                      style={{ width: '40px', borderRadius: '50%' }}
                    />
                    <span>{user.name}</span>
                    <BsX
                      onClick={() => handleRemoveUser(user)}
                      style={{ cursor: 'pointer', marginLeft: '5px' }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <Form.Group>
            <Form.Label>
              {path === 'chats' ? 'Search Users' : 'Add Users to Group'}
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Search users by name or email"
              value={searchTerm}
              onChange={handleSearch}
            />
          </Form.Group>

          {/* Display search results */}
          {isSearching?
            (
              // Skeleton loader
              Array(3).fill().map((_, index) => (
                <div key={index} className="skeleton-loader">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-text">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                  </div>
                </div>
              ))
            )
          :
            
          (searchResults.length > 0 && (
            <ListGroup className='pt-2'>
                {searchResults.map((user) => (
                  <ListGroup.Item
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    style={{ cursor: 'pointer', backgroundColor: '#363742', border: '1px solid #25262F', color: '#d8d9d9' }}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${user.profilePicture || 'nullPic.jpg'}`}
                        alt={user.name}
                        className="rounded-circle mr-3"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                      <div className='ps-2'>
                        <div>{user.name}</div>
                        <small style={{color:'#9c9c9c'}}>{user.email}</small>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
          ))
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          {path === 'group-chats' ? (
            <Button
              variant="primary"
              onClick={handleCreateGroup}
              disabled={selectedUsers.length < 2 || !groupName}
            >
              Create Group
            </Button>
          ) : (
            <></>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Chats;
