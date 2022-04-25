/* eslint-disable react-hooks/exhaustive-deps */
import { Box } from "@mui/system";
import { Slide } from "@mui/material";
import { getAuth } from "firebase/auth";
import { useRef, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

const ChatItem = (props) => {
  const chatBubbleRef = useRef();
  const [showDeleteIcon, setDelIconState] = useState(false);

  const deleteMessage = () => {
    props.delete(props.index);
  };

  useEffect(() => {
    if (chatBubbleRef) {
      chatBubbleRef.current.innerHTML = props.message;
    }
  }, [chatBubbleRef, chatBubbleRef.current]);

  return (
    <Slide
      direction={props.uid === getAuth().currentUser.uid ? "left" : "right"}
      in={true}
      unmountOnExit
      sx={{ transitionDelay: { laptop: "0ms", mobile: "1000ms" } }}
    >
      <Box
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent:
            props.uid === getAuth().currentUser.uid ? "flex-end" : "flex-start",
          gap: "0.5rem",
          fontSize: "medium",
          marginTop: "0.6rem",
          paddingLeft: "1.5%",
          paddingRight: "1.5%",
          paddingBottom: "0.95%",
        }}
      >
        <Box
          onMouseEnter={() => setDelIconState(true)}
          onMouseLeave={() => setDelIconState(false)}
          sx={{
            position: "relative",
            maxWidth: "60%",
            background:
              props.uid === getAuth().currentUser.uid ? "#cff5ab" : "white",
            color: "black",
            padding: { laptop: "1.46%", tablet: "1.46%", mobile: "2.5%" },
            borderRadius: "22px",
            borderBottomLeftRadius:
              props.uid !== getAuth().currentUser.uid ? "0px !important" : "",
            borderBottomRightRadius:
              props.uid === getAuth().currentUser.uid ? "0px !important" : "",
            marginLeft: "0.1rem",
            marginRight: "0.1rem",
            wordBreak: "break-word",
          }}
        >
          <Box ref={chatBubbleRef}></Box>
          {props.uid === getAuth().currentUser.uid && showDeleteIcon && (
            <Box
              sx={{
                position: "absolute",
                display: "flex",
                bottom: "0",
                left: "-10px",
                backgroundColor: "white",
                padding: "0.15em",
                borderRadius: "20%",
                cursor: "pointer",
                boxShadow: "0px 1.5px 8px rgb(0 0 0 / 36%)",
              }}
              onClick={deleteMessage}
            >
              <DeleteIcon
                sx={{
                  height: "21px",
                  width: "21px",
                  fill: "#df3f40",
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Slide>
  );
};

export default ChatItem;
