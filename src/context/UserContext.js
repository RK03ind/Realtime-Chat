import { createContext, useState } from "react";

export const UserContext = createContext({
  activeChatName: "",
  setactiveChatName: () => {},
  isSignedIn: false,
  setSignedIn: () => {},
  currentChat: "",
  setCurrentChat: () => {},
  showChat: false,
  setshowChat: () => {},
  removeContacts: false,
  setremoveContacts: () => {},
  chatId: "",
  setChatId: () => {},
});

const UserProvider = (props) => {
  const [isSignedIn, setSignedIn] = useState(false);
  const [showChat, setshowChat] = useState(false);
  const [removeContacts, setremoveContacts] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [activeChatName, setactiveChatName] = useState(null);
  const [chatId, setChatId] = useState(null);

  const contextData = {
    isSignedIn: isSignedIn,
    setSignedIn: setSignedIn,
    currentChat: currentChat,
    setCurrentChat: setCurrentChat,
    showChat: showChat,
    setshowChat: setshowChat,
    activeChatName: activeChatName,
    setactiveChatName: setactiveChatName,
    removeContacts: removeContacts,
    setremoveContacts: setremoveContacts,
    chatId: chatId,
    setChatId: setChatId,
  };
  return (
    <UserContext.Provider value={contextData}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
