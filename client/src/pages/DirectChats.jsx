import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../context/userContext';

import Sidebar from '../components/Sidebar';
import Chats from './Chats';
import Chat from './Chat';

const DirectChats = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hasId, setHasId] = useState(false);
  const { id } = useParams();
  const { currUser } = useContext(UserContext);
  const navigate = useNavigate();

  // If no user is logged in
  useEffect(() => {
    if (!currUser) navigate('/login');
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setHasId(!!id);
  }, [id]);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className='d-flex flex-grow-1 m-auto' style={{padding: windowWidth > 1064 ? "3rem 1.5rem 2rem 0" : "3rem 0 0"}}>
      {windowWidth >= 1064 ? (
          <>
            <Chats />
            {!hasId && <span className='vertical-line'></span>}
            {hasId && <Chat />}
          </>
        ) : (
          <>
            {hasId ? <Chat /> : <Chats />}
          </>
        )}
      </div>
    </div>
  )
}

export default DirectChats