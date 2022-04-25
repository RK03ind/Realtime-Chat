/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useRef, useState, useEffect } from "react";
import { UserContext } from "../../context/UserContext";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import {
  arrayUnion,
  collection,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import db from "../../firebase";
import Dialog from "@mui/material/Dialog";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Menu, MenuItem } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { Box } from "@mui/system";
import { IconButton, Button, Snackbar } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { v4 as uuidv4 } from "uuid";
import ContactItem from "./ContactItem";

const ContactList = (props) => {
  const userCtx = useContext(UserContext);
  let currentUserId = getAuth().currentUser.uid;
  const uidField = useRef();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [removeUserData, setRemoveUserData] = useState(null);
  const [filterString, setfilterString] = useState("");

  const currentUserRef = doc(db, `UserList/${getAuth().currentUser.uid}`);
  const [contactList, isContactsLoading] = useDocument(currentUserRef, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const [users, ,] = useCollection(collection(db, "UserList"), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const showConfirmation = (chatId, uid) => {
    setRemoveUserData([chatId, uid]);
    setOpenDialog(true);
  };

  const filterOut = (event) => {
    setfilterString(event.target.value);
  };

  const removeUsers = (uid, chatId) => {
    let updatedArray = contactList.data().contactList.filter((user) => {
      return removeUserData[1] !== user.uid;
    });
    updateDoc(
      currentUserRef,
      {
        contactList: [...updatedArray],
        deleted: arrayUnion({
          chatID: removeUserData[0],
          uid: removeUserData[1],
        }),
      },
      { merge: true }
    );
    userCtx.setshowChat(false);
    setOpenDialog(false);
  };

  useEffect(() => {
    userCtx.setshowChat(false);
    userCtx.setremoveContacts(false);
  }, [contactList]);

  const signout = () => {
    if (!isContactsLoading) {
      signOut(getAuth())
        .then(() => {
          userCtx.setSignedIn(false);
        })
        .catch((error) => {});
    } else {
      showError("Wait loading data......");
    }
  };

  const removePerson = () => {
    userCtx.setremoveContacts((prevState) => {
      return prevState === false;
    });
    setAnchorEl(null);
  };

  const checkUserExists = (uid) => {
    return users.docs.some((user) => {
      return user.id === uid;
    });
  };

  const checkUserAdded = (uid) => {
    if (contactList.data()) {
      if (!isContactsLoading) {
        return contactList.data().contactList.some((contact) => {
          return contact.uid === uid;
        });
      }
    } else return true;
  };

  const wasUserDeleted = (uid) => {
    if (contactList.data().deleted) {
      return contactList.data().deleted.filter((user) => {
        return user.uid === uid;
      });
    } else {
      return [];
    }
  };

  const AddUser = () => {
    let addUserId = uidField.current.value;

    let chatID = uuidv4();
    let deletedUserSearchedData = wasUserDeleted(addUserId);
    if (
      checkUserExists(addUserId) &&
      !checkUserAdded(addUserId) &&
      getAuth().currentUser.uid !== addUserId &&
      addUserId !== ""
    ) {
      if (deletedUserSearchedData.length !== 0) {
        updateDoc(
          currentUserRef,
          {
            contactList: arrayUnion({
              uid: addUserId,
              chatID: deletedUserSearchedData[0].chatID,
            }),
          },
          { merge: true }
        );
      } else {
        updateDoc(
          currentUserRef,
          { contactList: arrayUnion({ uid: addUserId, chatID: chatID }) },
          { merge: true }
        );
        updateDoc(
          doc(db, `UserList/${addUserId}`),
          { contactList: arrayUnion({ uid: currentUserId, chatID: chatID }) },
          { merge: true }
        );
        setDoc(doc(db, `Messages/${chatID}`), { messages: [] });
      }
    } else {
      showError("Invalid User or already added to contacts");
    }
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setOpenSnackBar(true);
  };

  // const copyUID = () => {
  //   copy(getAuth().currentUser.uid);
  //   showError("User ID Copied to Clipboard");
  // };

  const hideError = () => {
    setOpenSnackBar(false);
  };

  const cancelAlert = () => {
    userCtx.setremoveContacts(false);
    setOpenDialog(false);
  };

  //burger button
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const burgerMenuHandler = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const burgerMenuCloseHandler = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Snackbar
        open={openSnackBar}
        onClose={hideError}
        autoHideDuration={3200}
        message={errorMsg}
      />
      <Dialog open={openDialog}>
        <DialogTitle>Do you want to remove this contact ?</DialogTitle>
        <DialogContent>
          You won't be able to talk with this person
        </DialogContent>
        <DialogActions>
          <Button onClick={removeUsers}>Yes</Button>
          <Button onClick={cancelAlert}>No</Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={anchorEl} open={open} onClose={burgerMenuCloseHandler}>
        {/* <MenuItem>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              fontSize: "large",
              alignItems: "center",
              gap: "1.2rem",
              padding: "2% 0",
            }}
          >
            <AccountCircleOutlinedIcon
              sx={{ color: "#707579", fontSize: "1.96rem" }}
            />
            Profile
          </Box>
        </MenuItem> */}
        {/* <MenuItem>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              fontSize: "large",
              alignItems: "center",
              gap: "1.2rem",
              padding: "2% 0",
            }}
          >
            <DarkModeOutlinedIcon
              sx={{ color: "#707579", fontSize: "1.96rem" }}
            />
            Dark Mode
          </Box>
        </MenuItem> */}
        <MenuItem onClick={removePerson}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              fontSize: "large",
              alignItems: "center",
              gap: "1.2rem",
              padding: "2% 0",
            }}
          >
            <PersonRemoveOutlinedIcon
              sx={{ color: "#707579", fontSize: "1.96rem" }}
            />
            Remove Contacts
          </Box>
        </MenuItem>
        <MenuItem onClick={signout}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              fontSize: "large",
              alignItems: "center",
              gap: "1.2rem",
              padding: "2% 0",
            }}
          >
            <LogoutIcon sx={{ color: "#707579", fontSize: "1.96rem" }} />
            Log out
          </Box>
        </MenuItem>
      </Menu>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          flex: "1",
          justifyContent: "flex-end",
          width: "100%",
          backgroundColor: { laptop: "#ededed", mobile: "#b2b1b9" },
          alignItems: "center",
        }}
      >
        {/* <Box
          sx={{ display: "flex", alignItems: "center", marginRight: "0.8rem" }}
        >
          <Tooltip title="Copy UID To Clipboard" arrow>
            <Avatar
              alt="user-icon"
              onClick={copyUID}
              sx={{
                background: "white",
                padding: "4%",
                border: "1px solid #1976D2",
              }}
              src={`https://avatars.dicebear.com/api/bottts/${
                getAuth().currentUser.uid
              }.svg`}
            />
          </Tooltip>
        </Box> */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: { laptop: "70%", mobile: "75%" },
            alignItems: "center",
            padding: { laptop: "1.2%", mobile: "1%" },
            margin: { mobile: "0.5rem 0", laptop: "0" },
            gap: "0.2rem",
            borderRadius: "18px",
            background: "white",
          }}
        >
          <SearchIcon sx={{ color: "#808080" }} />
          <input
            type="text"
            placeholder="Search"
            onChange={filterOut}
            style={{
              width: "85%",
              height: "1.75rem",
              boxShadow: "none",
              borderColor: "white",
              border: "0",
              padding: "0.6%",
              fontSize: "medium",
              outline: "none",
              overflowY: "scroll",
              background: "white",
            }}
          />
        </Box>

        <Button
          variant="contained"
          sx={{
            marginRight: "0.4rem !important",
            color: "black",
            background: "transparent",
            boxShadow: "none",
            ":hover": {
              background: "transparent",
              boxShadow: "none",
              color: "blue",
            },
          }}
          onClick={burgerMenuHandler}
        >
          <MenuIcon />
        </Button>
      </Box>

      <Box
        sx={{
          width: "100%",
          flex: "12",
          alignItems: "center",
          overflowY: "scroll",
          borderBottom: "0px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!isContactsLoading &&
          contactList.data() &&
          contactList
            .data()
            .contactList.map((user, index) => (
              <ContactItem
                uid={user.uid}
                chatId={user.chatID}
                key={index}
                filterString={filterString}
                remove={showConfirmation}
                index={index}
              />
            ))}
        <Box
          sx={{
            color: "#808080",
            fontSize: "small",
            display: "flex",
            justifyContent: "center",
            marginTop: "0.5rem",
          }}
        >
          Click avatar in Header to copy ur ID
        </Box>
      </Box>

      <Box
        sx={{
          backgroundColor: "transparent",
          display: "flex",
          flex: "1",
          flexDirection: "row",
          height: "auto",
          justifyContent: "space-evenly",
          alignItems: "center",
          padding: "1% 1.5%",
          marginBottom: "0.5em",
        }}
      >
        <input
          type="text"
          placeholder="Add User with ID"
          ref={uidField}
          style={{
            height: "2.5rem",
            width: "80%",
            borderRadius: "10px",
            fontSize: "medium",
            border: "0",
            outline: "none",
            boxShadow: "0px 0.5px 2.5px rgba(0, 0, 0, 0.50)",
            padding: "2%",
          }}
        />
        <IconButton
          aria-label="back"
          size="large"
          onClick={AddUser}
          backgroundColor
          sx={{
            boxShadow: "0px 0.5px 2.5px rgba(0, 0, 0, 0.40)",
            color: "white",
            backgroundColor: "#1976D2",
            ":hover": {
              background: "white",
              color: "#1976D2",
            },
          }}
        >
          <PersonAddAltIcon sx={{ color: "inherit" }} />
        </IconButton>
      </Box>
    </>
  );
};

export default ContactList;
