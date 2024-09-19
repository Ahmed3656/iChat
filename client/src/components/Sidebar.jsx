import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../context/userContext';

import '../styles/Sidebar.css';
import { IoChatbubbleEllipses, IoSettingsSharp } from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { AiOutlineLogout } from "react-icons/ai";
import { HiMenu } from "react-icons/hi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { currUser } = useContext(UserContext);

  const isActive = (linkPath) => {
    if (linkPath === '/group-chats' && location.pathname.startsWith('/group-chats')) {
      return true;
    }
    if (linkPath === '/chats' && location.pathname.startsWith('/chats')) {
      return true;
    }
    return linkPath === location.pathname;
  };

  return (
    <>
      <div className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        <HiMenu />
      </div>
      <div className={`sidebar px-3 py-4 ${isOpen ? 'open' : ''}`}>
        <div className="icons">
          <Link to="/chats" className={isActive('/chats') ? 'active-icon' : ''}><IoChatbubbleEllipses /></Link>
          <Link to="/group-chats" className={isActive('/group-chats') ? 'active-icon' : ''}><FaUserGroup /></Link>
          <Link to="/settings" className={isActive('/settings') ? 'active-icon' : ''}><IoSettingsSharp /></Link>
        </div>
        <div className="logout">
          <div className="profile-img">
            <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${currUser.profilePicture}`} alt="" />
          </div>
          <Link to="/login" className='pt-2'><AiOutlineLogout /></Link>
        </div>
      </div>
    </>
  )
}

export default Sidebar;