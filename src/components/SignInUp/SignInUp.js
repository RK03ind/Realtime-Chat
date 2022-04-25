import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import db from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useContext, useRef, useState } from "react";
import { TextField, Card, Box, Button } from "@mui/material";
import { Typography, Collapse, Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { UserContext } from "../../context/UserContext";

const auth = getAuth();

const formatErrorCode = (code) => {
  return (
    code
      .toString()
      .replace("auth/", "")
      .replaceAll("-", " ")
      .charAt(0)
      .toUpperCase() +
    code.toString().replace("auth/", "").replaceAll("-", " ").slice(1)
  );
};

const SignInUp = (props) => {
  const email = useRef();
  const password = useRef();
  const [userName, setuserName] = useState("");
  const userCtx = useContext(UserContext);
  const [isInUi, setUi] = useState(true);
  const [showAlert, setshowAlert] = useState(false);
  const [ErrorMsg, setErrorMsg] = useState("");

  const changeUi = () => {
    setUi((prevState) => {
      return prevState ? false : true;
    });
  };

  const userNameChangeHandler = (event) => {
    setuserName(event.target.value);
  };
  const addUser = async (uid, name) => {
    try {
      setDoc(doc(db, `UserList/${uid}`), {
        name: name,
        contactList: [],
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const Login1 = () => {
    email.current.value = "admin1@gmail.com";
    password.current.value = "adminrk03";
    signin();
  };
  const Login2 = () => {
    email.current.value = "admin2@admin.com";
    password.current.value = "adminrk03";
    signin();
  };

  const signup = () => {
    if (userName !== "") {
      createUserWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then((userCredential) => {
          addUser(userCredential.user.uid, userName);
        })
        .catch((error) => {
          setErrorMsg(formatErrorCode(error.code));
          setshowAlert(true);
        });
    } else {
      setErrorMsg(formatErrorCode("Enter a name"));
      setshowAlert(true);
    }
  };

  const signin = () => {
    signInWithEmailAndPassword(
      auth,
      email.current.value,
      password.current.value
    )
      .then((userCredential) => {})
      .catch((error) => {
        setErrorMsg(formatErrorCode(error.code));
        setshowAlert(true);
      });
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: { laptop: "24%", mobile: "80%" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0.6rem",
          height: isInUi ? "22.96rem" : "28rem",
          position: "absolute",
          top: "0",
          bottom: "0",
          margin: "auto 0",
        }}
      >
        <Typography variant="h4" sx={{ margin: "1.6rem" }}>
          {isInUi ? "Sign In" : "Sign Up"}
        </Typography>
        {!isInUi && (
          <TextField
            id="outlined-basic"
            label="Your Name"
            variant="outlined"
            sx={{ width: "90%", margin: "0.4rem" }}
            onChange={userNameChangeHandler}
          />
        )}

        <TextField
          id="outlined-basic"
          label="Email"
          variant="outlined"
          type="email"
          sx={{ width: "90%", margin: "0.4rem" }}
          inputRef={email}
        />
        <TextField
          id="outlined-basic"
          label="Password"
          variant="outlined"
          type="password"
          inputRef={password}
          sx={{ width: "90%", margin: "0.4rem" }}
        />
        <span
          style={{ color: "#1976D2", cursor: "pointer" }}
          onClick={changeUi}
        >
          {isInUi ? "Sign Up?" : "Sign In?"}
        </span>
        <span
          style={{
            color: "#1976D2",
            fontSize: "x-small",
            cursor: "pointer",
            marginTop: "0.8rem",
          }}
          onClick={Login1}
        >
          Login with test credentials - 1
        </span>
        <span
          style={{
            color: "#1976D2",
            fontSize: "x-small",
            cursor: "pointer",
            marginTop: "0.25rem",
          }}
          onClick={Login2}
        >
          Login with test credentials - 2
        </span>
        <Button
          sx={{ width: "88%", borderRadius: "12px", marginTop: "1rem" }}
          variant="contained"
          onClick={isInUi ? signin : signup}
        >
          {isInUi ? "Sign In" : "Sign Up"}
        </Button>
      </Card>
      <Collapse
        in={showAlert}
        sx={{
          position: "fixed",
          bottom: 0,
        }}
      >
        <Alert
          severity="error"
          sx={{
            fontSize: { laptop: "1rem", mobile: "1.2rem" },
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setshowAlert(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {ErrorMsg}
        </Alert>
      </Collapse>
    </Box>
  );
};

export default SignInUp;
