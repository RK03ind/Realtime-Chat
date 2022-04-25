import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { Box } from "@mui/system";
import { Avatar } from "@mui/material";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import { useDocument } from "react-firebase-hooks/firestore";
import db from "../../firebase";
import { doc } from "firebase/firestore";

const ContactItem = (props) => {
  const userCtx = useContext(UserContext);

  const switchChat = () => {
    userCtx.setshowChat(true);
    userCtx.setCurrentChat(props.uid);
    userCtx.setChatId(props.chatId);
    userCtx.setactiveChatName(contact.data().name);
  };

  //making query for contact name
  const [contact, isContactLoading] = useDocument(
    doc(db, "UserList", props.uid),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const removeContact = () => {
    props.remove(props.chatId, props.uid);
  };

  if (
    !isContactLoading &&
    contact.data().name.toLowerCase().includes(props.filterString.toLowerCase())
  ) {
    return (
      <Box
        onClick={userCtx.removeContacts ? "" : switchChat}
        sx={{
          width: "98%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          height: "4.5rem",
          gap: "0.5rem",
          fontSize: "16px",
          fontWeight: "bold",
          marginTop: "0.4rem",
          padding: "0.5em",
          background: {
            laptop:
              userCtx.currentChat === props.uid && userCtx.showChat
                ? "#1976D2"
                : "transparent",
            mobile: "transparent",
          },
          borderRadius: "8px",
        }}
      >
        <Avatar
          onClick={switchChat}
          alt="user-icon"
          sx={{
            background: "white",
            padding: "1%",
            width: 54,
            height: 54,
            border:
              userCtx.currentChat === props.uid && userCtx.showChat
                ? "2px solid black"
                : "2px solid #1976D2",
          }}
          src={`https://avatars.dicebear.com/api/bottts/${props.uid}.svg`}
        />

        <Box
          onClick={switchChat}
          sx={{
            fontSize: "large",
            color: {
              laptop:
                userCtx.currentChat === props.uid && userCtx.showChat
                  ? "white"
                  : "black",
              mobile: "black",
            },
          }}
        >
          {!isContactLoading && contact.data().name}
        </Box>
        {userCtx.removeContacts && (
          <PersonRemoveOutlinedIcon
            sx={{
              color: "black",
              fontSize: "2.4rem",
              padding: "0.5%",
              marginLeft: "auto",
              marginRight: "0.32rem",
              ":hover": {
                color: "black",
              },
            }}
            onClick={removeContact}
          />
        )}
      </Box>
    );
  } else {
    return <></>;
  }
};

export default ContactItem;
