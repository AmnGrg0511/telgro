// import { useParams } from 'react-router-dom';
// import { DisplayResources } from '../components/DisplayResources';
// import { QuestionList } from '../components/QuestionList';
// import { Courses } from './Courses';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { auth, db } from '../firebase/fire';
// import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
// import { TagInput } from '../components/TagInput';
// import { Box } from '@material-ui/core';
// import { useState } from 'react';
// import { UnAuthorized } from './Unauthorized';
// import { Loader } from '../components/Loader';

// export const ShowSubtopic = () => {
// 	const { moduleName, topic, subtopic, tag } = useParams();
// 	const [user] = useAuthState(auth);
// 	const [userData] = useDocumentDataOnce(db.collection('users').doc(user.uid));
// 	const [tags, setTags] = useState(tag ? [tag] : []);

// 	if(userData === undefined) {
// 		return <Loader />
// 	}

// 	if((userData?.modulePermissions === undefined) || userData.modulePermissions[moduleName] === undefined) {
// 		return(
// 			<UnAuthorized />
// 		)
// 	}

// 	return (
// 		<div>
// 			<Box
// 				display="flex"
// 				alignItems="baseline"
// 				justifyContent="center"
// 				paddingTop="1rem"
// 				paddingBottom="3rem"
// 			>
// 				<TagInput
// 					topic={topic}
// 					subtopic={subtopic}
// 					value={tags}
// 					onChange={setTags}
// 				/>
// 			</Box>

// 				<div className="row justify-content-center">
// 					{userData?.type !== 'moderator' &&
// 					<div className="col-lg-6 col-sm-12 col-md-12">
// 					<Courses userData={userData} topic={topic} subtopic={subtopic}/>
// 					</div>
// 					}
// 					<div className="col-lg-6 col-sm-12 col-md-12">
// 					<DisplayResources userData={userData} tags={tags}/>
// 					</div>
// 					{userData?.type === 'moderator' &&
// 					<div className="col-lg-6 col-sm-12 col-md-12">
// 					<QuestionList userData={userData} tags={tags} report/>
// 					</div>
// 					}

// 				</div>
// 		</div>
// 	);
// };

import React, { useState } from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MailIcon from "@material-ui/icons/Mail";
import MenuIcon from "@material-ui/icons/Menu";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Resources } from "../components/QuizComponents";
import {
  Add,
  AddCircle,
  Assignment,
  CheckCircle,
  EventNote,
  Notes,
  QuestionAnswer,
  VerifiedUser,
} from "@material-ui/icons";
import { Courses } from "./Courses";
import { DisplayResources } from "../components/DisplayResources";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/fire";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { TagInput } from "../components/TagInput";
import { Box } from "@material-ui/core";
import { UnAuthorized } from "./Unauthorized";
import { Loader } from "../components/Loader";
import { useParams } from "react-router-dom";
import { QuestionList } from "../components/QuestionList";
import {  AddResources } from "./AddResources";
import { Discussion } from "./Discussion";
import { AddQuestion } from "../components/AddQuestion";
import { ValidateResources } from "../components/ValidateResources";
import { ValidateQuestions } from "../components/ValidateQuestions";
import { ShowUnverifiedQuestions } from "../components/VerifyQuestions";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {},
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    position: "sticky",
    margin: "1rem 0 0",
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    maxWidth: "80rem",
    margin: "auto",
  },
}));

export const ShowSubtopic = () => {
  const { window } = () => {};
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const { moduleName, topic, subtopic, tag } = useParams();
  const [user] = useAuthState(auth);
  const [userData] = useDocumentDataOnce(db.collection("users").doc(user.uid));
  const [tags, setTags] = useState(tag ? [tag] : []);

  const [tab, setTab] = useState(0);
  if (userData === undefined) {
    return <Loader />;
  }

  if (
    userData?.modulePermissions === undefined ||
    userData.modulePermissions[moduleName] === undefined
  ) {
    return <UnAuthorized />;
  }
  const titles = [
    "Courses",
    "Resources",
    "Add Resources",
    "Discussion",
    "Add Question",
    "Verify Questions",
    "Validate Questions",
    "Validate Resources",
    "Questions",
  ];
  const icons = [
    <Notes />,
    <EventNote />,
    <AddCircle />,
    <QuestionAnswer />,
    <Add />,
    <CheckCircle />,
    <VerifiedUser />,
    <VerifiedUser />,
    <Assignment />,
  ];
  const Components = [
    <Courses userData={userData} topic={topic} subtopic={subtopic} />,
    <DisplayResources userData={userData} tags={tags} />,
    <AddResources />,
    <Discussion />,
    <AddQuestion />,
    <ShowUnverifiedQuestions />,
    <ValidateQuestions />,
    <ValidateResources />,
    <QuestionList userData={userData} tags={tags} report />,
  ];

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <Divider />
      <List>
        {titles.slice(0, 4).map((text, index) => (
          <ListItem button key={text} onClick={() => setTab(index)}>
            <ListItemIcon>{icons[index]}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      {userData?.type === "moderator" && (
        <List>
          {titles.slice(4).map((text, index) => (
            <ListItem button key={text} onClick={() => setTab(index + 4)}>
              <ListItemIcon>{icons[index + 4]}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {titles[tab]}
          </Typography>
        </Toolbar>
      </AppBar>
      <div style={{ display: "flex" }}>
        <nav className={classes.drawer} aria-label="mailbox folders">
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Hidden smUp implementation="css">
            <Drawer
              container={container}
              variant="temporary"
              anchor={theme.direction === "rtl" ? "right" : "left"}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {Components[tab]}
        </main>
      </div>
    </div>
  );
};
