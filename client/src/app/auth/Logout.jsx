import React, {useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

export const Logout = () => {
  const {setCurrUser} = useContext(UserContext);
  const navigate = useNavigate();
  
  setCurrUser(null);
  localStorage.clear();
  navigate('/login');
  return (
    <div></div>
  )
}
