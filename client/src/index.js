import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap'

import Layout from './components/Layout';
import ErrorPage from './pages/ErrorPage';
import DirectChats from './pages/DirectChats';
import GroupChats from './pages/GroupChats'
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './pages/Logout';
import Settings from './pages/Settings';

// User context to pass the loggedin user through the pages for authorization
import UserProvider, {UserContext} from './context/userContext';

const ConfigureHome = () => {
  const { currUser } = useContext(UserContext);
  
  return currUser ? <DirectChats /> : <Login />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserProvider><Layout /></UserProvider>,
    errorElement: <ErrorPage />,
    children: [
      { index : true, element : (<ConfigureHome />) },
      { path: "chats", element: <DirectChats /> },
      { path: "chats/:id", element: <DirectChats /> },
      { path: "group-chats", element: <GroupChats /> }, 
      { path: "group-chats/:id", element: <GroupChats /> },
      { path : "login", element : <Login /> },
      { path : "register", element : <Register /> },
      { path : "logout", element : <Logout /> },
      { path : "settings", element : <Settings /> },
    ]
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);