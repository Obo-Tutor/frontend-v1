"use client";

import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const globalContext = createContext({
  userId: null,
  setUserId: () => {},

  chats: [],
  setChats: () => {},

  messages: [],
  setMessages: () => {},

  newChatboxNames: [],
  setNewChatboxNames: () => {},

  isLogged: false,
  setIsLogged: () => {},
});

// Add axios interceptor setup
axios.interceptors.request.use(
  (config) => {
    // Add common headers or authentication
    if (localStorage.getItem("token")) {
      config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

function GlobalContextProvider({ children }) {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newChatboxNames, setNewChatboxNames] = useState([]);

  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_DOMAIN_NAME_BACKEND + `/chatbox/user`,
          {
            timeout: 5000, // 5 second timeout
          }
        );
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chatboxes:", error);
        if (error.code === 'ECONNABORTED') {
          toast.error("Request timeout - Please try again");
        } else {
          toast.error("Failed to fetch chats");
        }
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetchChats();
    }
  }, [isLogged]);

  function updateMessageList(messageList) {
    setChats(messageList);
  }

  return (
    <globalContext.Provider
      value={{
        chats,
        setChats,
        messages,
        setMessages,
        userId,
        setUserId,
        newChatboxNames,
        setNewChatboxNames,
        isLogged,
        setIsLogged,
        updateMessageList,
      }}
    >
      {children}
    </globalContext.Provider>
  );
}

export function useGlobalContext() {
  return React.useContext(globalContext);
}

export default GlobalContextProvider;
