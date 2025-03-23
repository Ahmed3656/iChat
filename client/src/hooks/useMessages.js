import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import { useChats } from "../context/chatContext";

export const useMessages = (currUser, setChatInfo) => {
  const { id } = useParams();
  const { setChats } = useChats();
  const [messages, setMessages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setErrorMsg("");
      setIsLoading(true);
      try {
        const chatResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/chats/${id}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${currUser.token}` },
          }
        );
        let chatData = chatResponse?.data;

        if (chatData.isGroupChat) {
          const sortedUsers = [...chatData.users].sort((a, b) => {
            if (a._id === chatData.mainAdmin._id) return -1;
            if (b._id === chatData.mainAdmin._id) return 1;
            if (
              chatData.groupAdmins.includes(a._id) &&
              !chatData.groupAdmins.includes(b._id)
            )
              return -1;
            if (
              !chatData.groupAdmins.includes(a._id) &&
              chatData.groupAdmins.includes(b._id)
            )
              return 1;
            return 0;
          });
          chatData = { ...chatData, users: sortedUsers };
        }

        setChatInfo(chatData);

        const messageResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/messages/${id}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${currUser.token}` },
          }
        );
        setMessages(messageResponse?.data);
      } catch (error) {
        setErrorMsg(error.message);
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, [id, currUser.token, setChatInfo]);

  const sendMessage = async (messageContent, chatId, token) => {
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/messages/`,
      { content: messageContent, chatId },
      { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  };

  const createHandleSendMessage = (endOfMessagesRef, getMessageContent) => {
    return async () => {
      const messageContent = getMessageContent();
      if (!messageContent) return;

      try {
        const newMessage = await sendMessage(
          messageContent,
          id,
          currUser.token
        );
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === id ? { ...chat, latestMessage: newMessage } : chat
          )
        );

        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
        return true;
      } catch (error) {
        setErrorMsg(error.message);
        return false;
      }
    };
  };

  return {
    messages,
    setMessages,
    errorMsg,
    setErrorMsg,
    isLoading,
    sendMessage,
    createHandleSendMessage,
  };
};
