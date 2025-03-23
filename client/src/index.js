import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap";

import { Layout, ConfigureHome } from "./components";
import { Login, Register, Logout, Settings } from "./app";
import { ErrorPage, DirectChats, GroupChats } from "./pages";

import { UserProvider, ChatProvider } from "./context";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <ConfigureHome /> },
      { path: "chats", element: <DirectChats /> },
      { path: "chats/:id", element: <DirectChats /> },
      { path: "group-chats", element: <GroupChats /> },
      { path: "group-chats/:id", element: <GroupChats /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "logout", element: <Logout /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UserProvider>
      <ChatProvider>
        <RouterProvider router={router} />
      </ChatProvider>
    </UserProvider>
  </React.StrictMode>
);
