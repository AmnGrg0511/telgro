import { Link } from "react-router-dom";
import {
  AppBar,
  makeStyles,
  Toolbar,
  Typography,
  Fab,
} from "@material-ui/core";
import "./QuizResult.css";
import { UserMenu } from "./UserMenu";
import { NotificationMenu } from "./NotificationMenu";
import { Apps, Assignment, Dashboard } from "@material-ui/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/fire";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    // backgroundColor:'#00587a'
  },
}));

export function Navbar() {
  const classes = useStyles();
  const [user] = useAuthState(auth);

  const [userData] = useDocumentDataOnce(db.collection("users").doc(user?.uid));

  return (
    <div className="noPrint">
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar>
          <Link to="/" style={{ color: "currentcolor" }}>
            <Typography style={{ margin: ".5rem" }} variant="h5">
              Telgro
            </Typography>
          </Link>

          <Link
            to="/module"
            style={{
              color: "currentcolor",
              margin: ".5rem",
              textDecoration: "none",
            }}
          >
            <Fab
              variant="extended"
              color="primary"
              style={{ borderRadius: "0" }}
            >
              <Apps />
              Modules
            </Fab>
          </Link>

          {userData && userData?.type === "student" && (
            <Link
              to="/newTest"
              style={{
                color: "currentcolor",
                margin: ".5rem",
                textDecoration: "none",
              }}
            >
              <Fab
                variant="extended"
                color="primary"
                style={{ borderRadius: "0" }}
              >
                <Assignment />
                Create Test
              </Fab>
            </Link>
          )}

          {userData && userData.type === "moderator" && (
            <Link
              to="/custom-test"
              style={{
                color: "currentcolor",
                margin: ".5rem",
                textDecoration: "none",
              }}
            >
              <Fab
                variant="extended"
                color="primary"
                style={{ borderRadius: "0" }}
              >
                <Dashboard />
                Custom Test
              </Fab>
            </Link>
          )}

          <div style={{ marginLeft: "auto" }}>
            <NotificationMenu />
          </div>

          <div>
            <UserMenu />
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
