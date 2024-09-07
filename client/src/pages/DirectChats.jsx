import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Chats from './Chats';
import Chat from './Chat';

const DirectChats = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hasId, setHasId] = useState(false);
  const { id } = useParams();

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
      {(!hasId || windowWidth >= 1064) && <Chats />}
      {(hasId || windowWidth >= 1064) && <Chat />}
      </div>
    </div>
  )
}

export default DirectChats