import { useCallback } from "react";
import axios from "axios";

export const useAttachment = ({
  id,
  currUser,
  setMessages,
  setChats,
  chats,
  endOfMessagesRef,
  setErrorMsg,
}) => {
  const sendAttachment = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("chatId", id);

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/messages/attachment`,
          formData,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${currUser.token}`,
            },
          }
        );

        const newMessage = response.data;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setChats(() =>
          chats.map((chat) =>
            chat._id === id ? { ...chat, latestMessage: newMessage } : chat
          )
        );

        if (endOfMessagesRef.current) {
          endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } catch (error) {
        setErrorMsg(
          error.response?.data?.message || "Error sending attachment"
        );
      }
    },
    [id, currUser, setMessages, setChats, chats, endOfMessagesRef, setErrorMsg]
  );

  return { sendAttachment };
};
