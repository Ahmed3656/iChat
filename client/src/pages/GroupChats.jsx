import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';

import { Sidebar } from '../components';
import { Chats, ChatWindow } from './';

export const GroupChats = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hasId, setHasId] = useState(false);
  const { id } = useParams();
  const { currUser } = useContext(UserContext);
  const navigate = useNavigate();

  // If no user is logged in
  useEffect(() => {
    if (!currUser) navigate('/login');
  }, [currUser, navigate]);

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
            {hasId && <ChatWindow />}
          </>
        ) : (
          <>
            {hasId ? <ChatWindow /> : <Chats />}
          </>
        )}
      </div>
    </div>
  )
}
