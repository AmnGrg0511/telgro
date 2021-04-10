import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@material-ui/core";
// import { useForm } from 'react-hook-form';
import styled from "styled-components";

import { useState } from "react";
import { auth, db } from "./firebase/fire";

import { Center } from "./components/Center";
import telgroLogo from "./assets/telgroLogo.png";
import {
  Translate,
  Visibility,
  VisibilityOff,
  VisibilityOutlined,
} from "@material-ui/icons";

const Card = styled(Paper)`
  padding: 2rem;
`;

const Margin = styled.div`
  margin: 16px auto;
`;

const Login = ({ newUser = false, identifier = "", hardCoded = "" }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(identifier);
  const [password, setPassword] = useState(hardCoded);
  const [language, setLanguage] = useState("हिन्दी");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [hasAccount, setHasAccount] = useState(!newUser);
  const [userType, setUserType] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [conPassword, setConPassword] = useState("");
  const [showConPassword, setShowConPassword] = useState(false);
  const [code, setCode] = useState("");

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
  };

  const handleLogin = () => {
    clearErrors();
    auth
      .signInWithEmailAndPassword(email, password)
      .then(async (user) => {
        const userId = user.user.uid;
        const docD = await db.collection("users").doc(userId).get();
        if (docD.exists) {
          const data = docD.data();
          console.log("DATA: ", data);

          if (!data.valid && user.user.emailVerified) {
            auth.signOut();
            alert("Your account is not verified yet.");
          }
        }
      })
      .catch((err) => {
        switch (err.code) {
          case "auth/invalid-email":
          case "auth/user-disabled":
          case "auth/user-not-found":
            setEmailError(err.message);
            break;
          case "auth/wrong-password":
            setPasswordError(err.message);
            break;
          default:
        }
      });
  };

  const handleSignup = () => {
    clearErrors();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(async (user) => {
        let isValid = true;

        if (userType === "moderator") {
          isValid = false;
        }

        await db.collection("users").doc(user.user.uid).set({
          name,
          email,
          language,
          type: userType,
          valid: isValid,
        });

        console.log("User inserted: ", email, password, userType, isValid);
        await db
          .collection("knowledgeProfiles")
          .doc(user.user.uid)
          .set({ scores: {} });

        if (userType === "moderator") {
          auth.signOut();
          alert(
            "You will only be able to login once your account is verified."
          );
        }
      })
      .catch((err) => {
        switch (err.code) {
          case "email-already-in-use":
          case "auth/invalid-email":
            setEmailError(err.message);
            break;
          case "auth/weak-password":
            setPasswordError(err.message);
            break;
          default:
        }
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (hasAccount) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  if (forgotPassword) {
    return (
      <Center>
        <img src={telgroLogo} alt="" />
        <Card>
          <Center paddingBottom="2rem"></Center>
          <form onSubmit={handleSubmit}>
            <Typography
              variant="h4"
              component="h2"
              style={{ textAlign: "center", paddingBottom: "1rem" }}
            >
              Set Password
            </Typography>
            <Margin>
              <TextField
                variant="outlined"
                label="New Password"
                type={showPassword ? "text" : "password"}
                style={{ minWidth: 350 }}
                name="new password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText={passwordError}
                error={!!passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Margin>
            <Margin>
              <TextField
                variant="outlined"
                label="Confirm Password"
                type={showConPassword ? "text" : "password"}
                style={{ minWidth: 350 }}
                name="conPassword"
                required
                value={conPassword}
                onChange={(e) => setConPassword(e.target.value)}
                helperText={passwordError}
                error={!!passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConPassword((prev) => !prev)}
                      >
                        {showConPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Margin>
            <Margin>
              <TextField
                variant="outlined"
                type="text"
                label="Enter Code"
                placeholder="You got a code on registered email id"
                style={{ minWidth: 350 }}
                autoFocus
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Margin>
            <Center>
              <Button
                type="submit"
                variant="contained"
                disableElevation
                color="primary"
                onClick={() => setForgotPassword(false)}
              >
                {"Save"}
              </Button>
            </Center>
          </form>
        </Card>
      </Center>
    );
  }

  return (
    <Center>
      <img src={telgroLogo} alt="" />
      <Card>
        <Center paddingBottom="2rem"></Center>
        <form onSubmit={handleSubmit}>
          <Typography
            variant="h4"
            component="h2"
            style={{ textAlign: "center" }}
          >
            {hasAccount ? "Sign In" : "Sign Up"}
          </Typography>

          {!hasAccount && (
            <Margin>
              <TextField
                variant="outlined"
                type="text"
                label="Name"
                style={{ minWidth: 350 }}
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Margin>
          )}

          {!newUser && (
            <Margin>
              <TextField
                variant="outlined"
                type="email"
                label="Email"
                style={{ minWidth: 350 }}
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText={emailError}
                error={!!emailError}
              />
            </Margin>
          )}
          {!newUser && (
            <Margin>
              <TextField
                variant="outlined"
                label="Password"
                type={showPassword ? "text" : "password"}
                style={{ minWidth: 350 }}
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText={passwordError}
                error={!!passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Margin>
          )}

          <Center>
            {!hasAccount && (
              <FormControl
                component="fieldset"
                style={{
                  margin: "1rem auto",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <FormLabel component="legend">Sign up as</FormLabel>
                <RadioGroup
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  <FormControlLabel
                    value="student"
                    control={<Radio />}
                    label="Student"
                  />
                  <FormControlLabel
                    value="moderator"
                    control={<Radio />}
                    label="Moderator"
                  />
                </RadioGroup>
              </FormControl>
            )}
            {!hasAccount && (
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Translate />
                    </InputAdornment>
                  ),
                }}
                select
                required
                style={{ minWidth: 250, margin: ".1rem 0 1rem" }}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {[
                  "हिन्दी",
                  "English",
                  "Français",
                  "Italiano",
                  "Polski",
                  "Português – Brasil",
                  "Tiếng Việt",
                  "Türkçe",
                  "Русский",
                  "বাংলা",
                  "ภาษาไทย",
                  "中文 – 简体",
                  "中文 – 繁體",
                  "日本語",
                  "한국어",
                ].map((language) => (
                  <MenuItem key={language} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {!hasAccount && (
              <div style={{ display: "flex", margin: "0 0 1.5rem" }}>
                <TextField
                  variant="outlined"
                  type="checkbox"
                  style={{ minWidth: 20 }}
                  name="checkBox"
                  required
                />
                <Typography style={{ margin: "0 1rem" }}>
                  Agree to our{" "}
                  <a href="https://docs.google.com/document/d/1UMwkCK-rx3Tt4b9tdr9JH0DIuLkdhcmyLcQPmVL4RAw/edit?usp=sharing">
                    terms and conditions
                  </a>
                </Typography>
              </div>
            )}
            <Button
              type="submit"
              variant="contained"
              disableElevation
              color="primary"
            >
              {hasAccount ? "Sign In" : "Sign Up"}
            </Button>

            <div style={{ height: "2rem" }} />
            {hasAccount && (
              <p style={{ marginBottom: ".5rem" }}>
                Don't remember the password?{" "}
                <Link href="#" onClick={() => setForgotPassword(true)}>
                  Forgot Password
                </Link>
              </p>
            )}

            {hasAccount && (
              <p>
                Don't have an account?{" "}
                <Link href="#" onClick={() => setHasAccount((prev) => !prev)}>
                  Sign up
                </Link>
              </p>
            )}

            {!hasAccount && (
              <p>
                Have an account?{" "}
                <Link href="#" onClick={() => setHasAccount((prev) => !prev)}>
                  Sign in
                </Link>
              </p>
            )}
          </Center>
        </form>
      </Card>
    </Center>
  );
};

export default Login;
