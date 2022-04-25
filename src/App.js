/* eslint-disable react-hooks/exhaustive-deps */
import db from "./firebase";
import { use100vh } from "react-div-100vh";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SignInUp from "./components/SignInUp/SignInUp";
import { useContext, useEffect, useState } from "react";
import ContactList from "./components/ContactList/ContactList";
import MediaQuery from "react-responsive";
import ChatContainer from "./components/ChatContainer/ChatContainer";
import { LinearProgress } from "@mui/material";
import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { UserContext } from "./context/UserContext";
import { Box } from "@mui/system";

const auth = getAuth();

function App() {
  const userCtx = useContext(UserContext);
  const height100 = use100vh();
  const [showLoading, setLoading] = useState(true);
  const [ActiveChatList, ,] = useCollection(collection(db, "Messages/"), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  onAuthStateChanged(auth, (user) => {
    setLoading(false);
    if (user) {
      userCtx.setSignedIn(true);
    } else {
    }
  });

  useEffect(() => {
    userCtx.setshowChat(false);
  }, [userCtx.isSignedIn]);

  if (userCtx.isSignedIn) {
    return (
      <>
        <MediaQuery minWidth={0} maxWidth={1023}>
          <Box
            sx={{
              width: { laptop: "35%", mobile: "100%" },
              height: height100,
              display: "flex",
              flexDirection: "column",
              transform: "transale3d(0,0,1)",
              backgroundImage: userCtx.showChat
                ? "url(https://res.cloudinary.com/rk03/image/upload/v1650394612/pattern_wljeif.png), url(https://res.cloudinary.com/rk03/image/upload/v1650394638/bg_1_j2rkqq.jpg)!important"
                : "none",
              backgroundSize: "cover",
              backgroundBlendMode: "soft-light",
              backgroundPosition: "center",
            }}
          >
            {!userCtx.showChat && <ContactList />}
            {userCtx.showChat && <ChatContainer ChatList={ActiveChatList} />}
          </Box>
        </MediaQuery>
        <MediaQuery minWidth={1024}>
          <Box
            sx={{
              width: { laptop: "30%", mobile: "100%" },
              height: height100,
              overflowY: "scroll",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ContactList />
          </Box>
          <Box
            sx={{
              width: "70%",
              height: height100,
              overflowY: "scroll",
              transform: "transale3d(0,0,0)",
              display: "flex",
              flexDirection: "column",
              backgroundImage:
                "url(https://res.cloudinary.com/rk03/image/upload/v1650394612/pattern_wljeif.png), url(https://res.cloudinary.com/rk03/image/upload/v1650394638/bg_1_j2rkqq.jpg)!important",
              backgroundSize: "cover",
              backgroundBlendMode: "soft-light",
              backgroundPosition: "center",
            }}
          >
            {userCtx.showChat && <ChatContainer ChatList={ActiveChatList} />}
            {!userCtx.showChat}
          </Box>
        </MediaQuery>
      </>
    );
  } else if (showLoading) {
    return (
      <>
        <LinearProgress
          sx={{
            width: "100%",
            position: "absolute",
            bottom: "0",
            height: "1.2rem",
          }}
        />
      </>
    );
  }
  return <SignInUp />;
}

export default App;
