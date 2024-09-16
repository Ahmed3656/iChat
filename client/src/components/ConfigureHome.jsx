import { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';

const ConfigureHome = () => {
  const { currUser } = useContext(UserContext);

  return currUser ? <Navigate to="/chats" replace /> : <Navigate to="/login" replace />;
};

export default ConfigureHome;