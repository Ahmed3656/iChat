import { useCallback } from "react";
import axios from "axios";

export const useGroupChatActions = ({ currUser, setErrorMsg }) => {
  const changeGroupName = useCallback(
    async (chatId, newName, setChatInfo, setChats, chats, setShowInput) => {
      if (!newName) {
        setShowInput(false);
        return;
      }

      try {
        await axios.patch(
          `${process.env.REACT_APP_BASE_URL}/chats/renamegroup`,
          { chatId, chatName: newName },
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${currUser.token}` },
          }
        );

        setChatInfo((prevInfo) => ({
          ...prevInfo,
          chatName: newName,
        }));

        const newChats = chats.map((chat) =>
          chat._id === chatId ? { ...chat, chatName: newName } : chat
        );
        setChats(newChats);

        setShowInput(false);
      } catch (error) {
        console.error("Error updating group name:", error);
        setErrorMsg(
          error.response?.data?.message || "Error updating group name"
        );
      }
    },
    [currUser, setErrorMsg]
  );

  const changeGroupPic = useCallback(
    async (file, chatId, setChatInfo, setChats, chats, setIsUploading) => {
      if (!file) return;

      setIsUploading(true);
      setErrorMsg("");

      const formData = new FormData();
      formData.append("pfp", file);
      formData.append("chatId", chatId);

      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_BASE_URL}/chats/changepfp`,
          formData,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${currUser.token}`,
            },
          }
        );

        setChatInfo((prevInfo) => ({
          ...prevInfo,
          chatPfp: response.data.chatPfp,
        }));

        const updatedChats = chats.map((chat) =>
          chat._id === chatId
            ? { ...chat, chatPfp: response.data.chatPfp }
            : chat
        );
        setChats(updatedChats);
      } catch (error) {
        console.error("Error updating group picture:", error);
        setErrorMsg(
          error.response?.data?.message || "Error updating group picture"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [currUser, setErrorMsg]
  );

  const searchUsers = useCallback(
    async (query) => {
      if (!query) {
        return [];
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/search?q=${query}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${currUser.token}` },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error searching users:", error);
        setErrorMsg("Failed to search users");
        return [];
      }
    },
    [currUser, setErrorMsg]
  );

  const addNewUser = useCallback(
    async (chatId, userId, setChatInfo) => {
      try {
        await axios.patch(
          `${process.env.REACT_APP_BASE_URL}/chats/groupadd`,
          { chatId, userId },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${currUser.token}`,
            },
          }
        );

        const userResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/${userId}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${currUser.token}` },
          }
        );

        setChatInfo((prevInfo) => ({
          ...prevInfo,
          users: [...prevInfo.users, userResponse.data],
        }));

        return true;
      } catch (error) {
        setErrorMsg(error.response?.data?.message || "Error adding user");
        return false;
      }
    },
    [currUser, setErrorMsg]
  );

  const setAdmin = useCallback(
    async (chatId, userId, setChatInfo) => {
      try {
        await axios.patch(
          `${process.env.REACT_APP_BASE_URL}/chats/setadmin`,
          { chatId, userId },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${currUser.token}`,
            },
          }
        );

        const userResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/${userId}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${currUser.token}` },
          }
        );

        setChatInfo((prevInfo) => ({
          ...prevInfo,
          groupAdmins: [...prevInfo.groupAdmins, userResponse.data],
        }));

        return true;
      } catch (error) {
        setErrorMsg(error.response?.data?.message || "Error setting admin");
        return false;
      }
    },
    [currUser, setErrorMsg]
  );

  const removeAdmin = useCallback(
    async (chatId, userId, setChatInfo) => {
      try {
        await axios.patch(
          `${process.env.REACT_APP_BASE_URL}/chats/removeadmin`,
          { chatId, userId },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${currUser.token}`,
            },
          }
        );

        setChatInfo((prevInfo) => ({
          ...prevInfo,
          groupAdmins: prevInfo.groupAdmins.filter(
            (admin) => admin._id !== userId
          ),
        }));

        return true;
      } catch (error) {
        setErrorMsg(error.response?.data?.message || "Error removing admin");
        return false;
      }
    },
    [currUser, setErrorMsg]
  );

  const removeUser = useCallback(
    async (chatId, userId, setChatInfo) => {
      try {
        await axios.patch(
          `${process.env.REACT_APP_BASE_URL}/chats/groupremove`,
          { chatId, userId },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${currUser.token}`,
            },
          }
        );

        setChatInfo((prevInfo) => ({
          ...prevInfo,
          users: prevInfo.users.filter((user) => user._id !== userId),
          groupAdmins: prevInfo.groupAdmins.filter(
            (admin) => admin._id !== userId
          ),
        }));

        return true;
      } catch (error) {
        setErrorMsg(error.response?.data?.message || "Error removing user");
        return false;
      }
    },
    [currUser, setErrorMsg]
  );

  return {
    changeGroupName,
    changeGroupPic,
    searchUsers,
    addNewUser,
    setAdmin,
    removeAdmin,
    removeUser,
  };
};
