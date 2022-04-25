/* eslint-disable react-hooks/exhaustive-deps */
import db from "../../firebase";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { Box } from "@mui/system";
import {
  IconButton,
  Avatar,
  Button,
  Input,
  LinearProgress,
  TextareaAutosize,
} from "@mui/material";
import ClickAwayListener from "@mui/base/ClickAwayListener";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { UserContext } from "../../context/UserContext";
import { useDocument } from "react-firebase-hooks/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { arrayUnion, doc, setDoc } from "firebase/firestore";
import ChatItem from "./ChatItem";
import "emoji-picker-element";
import { nanoid } from "nanoid";
import ChatImageItem from "./ChatImageItem";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    let fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

const formatChat = (text) => {
  let length = text.length;
  for (let i = 0; i <= length * 2; i++) {
    text = text.replaceAll("<br/><br/>", "<br/>");
  }
  return text;
};

const ChatContainer = (props) => {
  const userCtx = useContext(UserContext);
  const [chatID, setchatID] = useState(userCtx.chatId);
  const [showEmoji, setshowEmoji] = useState(false);
  const storage = getStorage();
  const msg = useRef();
  const scrollRef = useRef();
  const emojiRef = useRef(null);
  const imagePickerRef = useRef();
  const imageCaptionRef = useRef();
  const msgRef = doc(db, `Messages/${chatID}`);

  const [isFileModal, setFileModal] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [wasChatDeleted, setChatWasDeleted] = useState(false);
  const [fileData, setFileData] = useState({
    src: "",
    name: "",
    size: "",
  });

  const [chats, isChatsLoading] = useDocument(msgRef, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const sendMessage = () => {
    if (msg.current.value !== "") {
      setDoc(
        msgRef,
        {
          messages: [
            ...chats.data().messages,
            {
              id: nanoid(),
              message: formatChat(msg.current.value.replace(/\n\r?/g, "<br/>")),
              uid: getAuth().currentUser.uid,
            },
          ],
        },
        { merge: true }
      );

      setChatWasDeleted(false);
      msg.current.value = "";
    }
  };

  const deleteMessage = (delIndex) => {
    const updatedChats = chats.data().messages.filter((item, index) => {
      return index !== delIndex;
    });
    setChatWasDeleted(true);
    setDoc(msgRef, {
      messages: [...updatedChats],
    });
  };

  const sendImage = () => {
    if (imageUploadProgress <= 0) {
      const file = imagePickerRef.current.files[0];
      const message = imageCaptionRef.current.value;
      const imageUploadTask = uploadBytesResumable(
        ref(storage, `${Date.now() + file.name}`),
        file
      );

      imageUploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setImageUploadProgress(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
        },
        (error) => {
          window.alert("Image Upload failed, check your network connection");
        },
        () => {
          getDownloadURL(imageUploadTask.snapshot.ref).then((downloadURL) => {
            setDoc(
              msgRef,
              {
                messages: arrayUnion({
                  id: nanoid(),
                  src: downloadURL,
                  message: message,
                  uid: getAuth().currentUser.uid,
                }),
              },
              { merge: true }
            );
            closeImagePickerModal();
          });
        }
      );
    }
  };

  const onEmojiOpen = () => {
    setshowEmoji((prevState) => {
      return prevState === false;
    });
  };

  const goBack = () => {
    userCtx.setshowChat(false);
  };

  const onEmojiClick = (event) => {
    msg.current.value = msg.current.value + event.detail.unicode;
  };

  const openImagePicker = () => {
    imagePickerRef.current.click();
  };

  const closeImagePickerModal = () => {
    if (imageUploadProgress <= 0) {
      setFileModal(false);
      setFileData(null);
      setImageUploadProgress(0);
      imagePickerRef.current.value = null;
    }
  };

  const onImageSelect = (event) => {
    const file = imagePickerRef.current.files[0];
    if (
      (file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png") &&
      file.size > 0
    ) {
      if (file.size > 3145728) {
        window.alert("Image size cannot be greater than 3MB");
      } else {
        fileToBase64(file)
          .then((result) => {
            setFileData({
              src: result,
              name: file.name,
              size: `${Math.trunc(
                file.size > 1048576 ? file.size / 1048576 : file.size / 1024
              ).toString()} ${file.size > 1048576 ? " MB" : " KB"}`,
            });
            setFileModal(true);
          })
          .catch(() => {
            window.alert("Invalid file or corrupted image");
          });
      }
    } else {
      window.alert("Invalid file-type or corrupted image");
    }
  };

  useEffect(() => {
    setchatID(userCtx.chatId);
  }, [userCtx.currentChat]);

  useEffect(() => {
    if (!wasChatDeleted && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollIntoView();
      }, 300);
    }
  }, [chats]);

  useEffect(() => {
    if (emojiRef.current !== null) {
      emojiRef.current.addEventListener("emoji-click", onEmojiClick);
    }
  }, [showEmoji]);

  return (
    <>
      {isFileModal && (
        <Box
          sx={{
            position: "absolute",
            top: "25%",
            left: {
              laptop: "45%",
              tablet: "25%",
              mobile: "calc(92vw - 88%)",
            },
            width: "26em",
            maxWidth: "92vw",
            padding: "0.95em",
            borderRadius: "10px",
            zIndex: "1",
            background: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: "1.5em",
              justifyContent: "space-between",
            }}
          >
            <CloseIcon
              sx={{ marginRight: "0.8em", cursor: "pointer" }}
              onClick={closeImagePickerModal}
            />
            <span
              style={{
                fontWeight: 500,
                fontSize: "18px",
                marginRight: "auto",
              }}
            >
              Send Image
            </span>
            <Button
              variant="contained"
              sx={{ borderRadius: "10px" }}
              onClick={sendImage}
            >
              Send
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "1.2em",
              marginBottom: "4em",
              alignItems: "center",
            }}
          >
            <img
              src={fileData.src}
              alt="upload"
              style={{
                height: "48px",
                width: "48px",
                borderRadius: "5px",
                objectFit: "contain",
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35em",
                fontSize: "0.9em",
              }}
            >
              <span style={{ wordBreak: "break-all" }}>{fileData.name}</span>
              <span>{fileData.size}</span>
              {imageUploadProgress > 0 && (
                <LinearProgress
                  variant="determinate"
                  value={imageUploadProgress}
                />
              )}
            </Box>
          </Box>

          <Input
            placeholder="Caption"
            inputRef={imageCaptionRef}
            sx={{ marginBottom: "1em", width: "90%" }}
          />
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flex: "1",
          justifyContent: "space-between",
          width: "100%",
          backgroundColor: "#EDEDED",
          alignItems: "center",
          boxShadow: "0px 1.5px 8px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginLeft: "0.6rem",
            gap: "0.4rem",
            color: "black",
            fontSize: "large",
          }}
        >
          <IconButton
            aria-label="back"
            size="large"
            onClick={goBack}
            sx={{ padding: "0.65rem" }}
          >
            <KeyboardBackspaceIcon fontSize="large" sx={{ color: "#1976D2" }} />
          </IconButton>
          <Avatar
            alt="user-icon"
            sx={{ border: "1px solid #1976D2", padding: "1.8%" }}
            src={`https://avatars.dicebear.com/api/bottts/${userCtx.currentChat}.svg`}
          />
          {userCtx.activeChatName}
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          borderBottom: "0px",
          flex: "12",
          overflowY: "scroll",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!isChatsLoading &&
          chats.data().messages &&
          chats.data().messages.map((doc, index) => {
            return doc.src ? (
              <ChatImageItem {...doc} key={doc.id} />
            ) : (
              <ChatItem
                uid={doc.uid}
                key={doc.id}
                message={doc.message}
                index={index}
                delete={deleteMessage}
              />
            );
          })}

        <div ref={scrollRef}></div>
      </Box>
      {showEmoji && (
        <ClickAwayListener onClickAway={onEmojiOpen}>
          <emoji-picker
            ref={emojiRef}
            class="light"
            style={{
              position: "absolute",
              bottom: msg.current.offsetHeight + 22,
              marginLeft: "0.8rem",
            }}
          />
        </ClickAwayListener>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "auto",
          backgroundColor: "transparent",
          justifyContent: "space-evenly",
          flex: "1",
          alignItems: "center",
          padding: "1% 1.5%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: { laptop: "65%", mobile: "80%" },
            alignItems: "center",
            padding: { laptop: "0.65%", tablet: "1%", mobile: "1.6%" },
            gap: "0.8rem",
            borderRadius: "18px",
            background: "white",
          }}
        >
          <SentimentSatisfiedAltIcon
            sx={{ color: "#808080" }}
            onClick={onEmojiOpen}
          />
          <TextareaAutosize
            type="text"
            onKeyDown={(event) => {
              if (event.shiftKey && event.key === "Enter") {
                // without writing this if case, this particular keydown event which added a
                // new line was prevented by the if case written below
              } else if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
              }
            }}
            ref={msg}
            placeholder="Enter your message"
            style={{
              maxHeight: "10rem",
              outline: "none",
              width: "100%",
              boxShadow: "none",
              borderColor: "white",
              border: "2px solid white !important",
              padding: "0.6%",
              fontSize: "large",
              fontFamily: "inherit",
              wordBreak: "break-word",
              background: "white",
              ":empty:before": {
                content: "attr(data-placeholder)",
                color: "#808080",
              },
            }}
          ></TextareaAutosize>
          <AttachFileIcon
            sx={{ color: "#808080", transform: "rotate(30deg)" }}
            onClick={openImagePicker}
          />
          <input
            type="file"
            name="image"
            style={{ display: "none" }}
            ref={imagePickerRef}
            accept=".jpg,.png,.jpeg"
            onChange={onImageSelect}
          />
        </Box>

        <IconButton
          aria-label="back"
          size="large"
          onClick={sendMessage}
          sx={{ background: "white", ":hover": { background: "white" } }}
        >
          <SendIcon sx={{ color: "#1976D2" }} />
        </IconButton>
      </Box>
    </>
  );
};

export default ChatContainer;
