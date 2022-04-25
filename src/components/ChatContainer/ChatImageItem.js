/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import { Box } from "@mui/system";
import { Slide } from "@mui/material";
import { getAuth } from "firebase/auth";

const ChatImageItem = (props) => {
  const openImageLink = () => {
    window.open(props.src, "_blank");
  };

  return (
    <Slide
      direction={props.uid === getAuth().currentUser.uid ? "left" : "right"}
      in={true}
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
          sx={{
            maxWidth: { laptop: "50%", tablet: "55%", mobile: "65%" },
            display: "flex",
            flexDirection: "column",
            background:
              props.uid === getAuth().currentUser.uid ? "#cff5ab" : "white",
            color: "black",

            borderRadius: "15px",
            borderBottomLeftRadius:
              props.uid !== getAuth().currentUser.uid
                ? props.message !== ""
                  ? "0px !important"
                  : ""
                : "",
            borderBottomRightRadius:
              props.uid === getAuth().currentUser.uid
                ? props.message !== ""
                  ? "0px !important"
                  : ""
                : "",
            marginLeft: "0.1rem",
            marginRight: "0.1rem",
            wordBreak: "break-word",
          }}
        >
          <img
            src={props.src}
            onClick={openImageLink}
            style={{
              borderRadius: props.message !== "" ? "15px 15px 0px 0px" : "15px",
              width: "100%",
              maxHeight: "45vh",
              objectFit: "cover",
            }}
          />

          {props.message !== "" ? (
            <span
              style={{
                padding: "2.5%",
                marginLeft: "0.5em",
              }}
            >
              {props.message}
            </span>
          ) : (
            ""
          )}
        </Box>
      </Box>
    </Slide>
  );
};

export default ChatImageItem;
