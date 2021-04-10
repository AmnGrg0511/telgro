import { Link, useParams } from "react-router-dom";
import { db } from "../firebase/fire";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import React from "react";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuIcon from "@material-ui/icons/Menu";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  ArrowForwardIos,
  Assignment,
  DashboardOutlined,
  Description,
  EventNote,
  ExtensionOutlined,
  Note,
  People,
  QuestionAnswerOutlined,
  SpeakerNotesOutlined,
} from "@material-ui/icons";
import { useState } from "react";
import { useEffect } from "react";
import {
  DisplayPost,
  Authors,
  DisplayQuiz,
  Doubts,
  Notes,
  Overview,
  Resources,
} from "../components/QuizComponents";
import { MathDisplay } from "../components/MathDisplay";
import { Loader } from "../components/Loader";

const drawerWidth = "16rem";
const useStyles = makeStyles((theme) => ({
  root: {
    margin: "1rem 0",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      marginTop: "5rem",
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    padding: ".5rem 0",
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: 0,
      position: "sticky!important",
      top: 0,
      zIndex: "1",
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: {
    ...theme.mixins.toolbar,
    fontSize: "2rem",
    color: "white",
    marginLeft: 0,
    [theme.breakpoints.up("sm")]: {
      marginLeft: "12rem",
    },
  },
  drawerPaper: {
    width: drawerWidth,
    padding: "1rem",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: "8rem 1%",
    [theme.breakpoints.up("sm")]: {
      padding: "8rem 12%",
    },
  },
}));

export const Course = () => {
  const { courseId } = useParams();
  const arr = ["description", "moderator", "notes", "resources", "doubts"];
  const [course, error, loading] = useDocumentDataOnce(
    db.collection("courses").doc(courseId)
  );

  const [title, setTitle] = useState("Overview");
  const [content, setContent] = useState("");
  const [postIdx, setPostIdx] = useState(0);
  const [session, setSession] = useState(0);

  const [tab, setTab] = useState(0);

  useEffect(() => {
    document.querySelectorAll("oembed[url]").forEach((element) => {
      // Create the <a href="..." class="embedly-card"></a> element that Embedly uses
      // to discover the media.
      const anchor = document.createElement("a");
      console.log(element.getAttribute("url"));

      anchor.setAttribute("href", element.getAttribute("url"));
      anchor.className = "embedly-card";

      element.appendChild(anchor);
    });
  });
  if (loading) {
    return <Loader />;
  }
  if (error) {
    return <div className="justify-content-center">{error}</div>;
  }
  function ResponsiveDrawer(props) {
    const { window } = props;
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen);
    };

    const PostItem = ({ post, idx }) => {
      const [hover, setHover] = useState(false);

      return (
        <ListItem
          button
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => {
            setHover(false);
          }}
          style={{
            backgroundColor: !hover ? "#87cff90a" : "#cad9fa",
            margin: ".5rem .5rem",
            padding: !hover ? ".7rem 1.2rem" : "1rem 1.2rem",
            width: "auto",
			transition: "all ease .3s"
          }}
          onClick={() => {
            setTitle(
              (prev) =>
                prev.split(" > ")[0] +
                " > " +
                (post.type === "post" ? "Post " : "Quiz ") +
                count[idx]
            );
            setTab(post.type === "post" ? 2 : 3);
            setPostIdx(idx);
            setContent(post.content);
            console.log(post.link);
          }}
        >
          <ListItemIcon>
            {post.type === "post" ? (
              <SpeakerNotesOutlined />
            ) : (
              <ExtensionOutlined />
            )}
          </ListItemIcon>
          <ListItemText>
            <span style={{ fontWeight: "bold", margin: ".3rem" }}>
              {post.type === "post" ? "Post" : "Quiz"} {count[idx]}:
            </span>{" "}
            {post.name}{" "}
            <span
              style={{
                fontSize: "12px",
                color: "#5b5b5b",
                fontStyle: "italic",
                margin: "0 .8rem",
              }}
            >
              ({post.duration} mins)
            </span>
          </ListItemText>
        </ListItem>
      );
    };

    const drawer = (
      <div>
        <Link to={"/"} style={{ fontSize: "2rem", color: "blue" }}>
          Telgro
        </Link>
        <Divider />
        <List>
          <ListItem
            button
            onClick={() => {
              setTitle("Overview");
              setTab(0);
              setContent("");
            }}
          >
            <ListItemIcon>{<DashboardOutlined />}</ListItemIcon>
            <ListItemText>Overview</ListItemText>
          </ListItem>
          <List style={{ paddingLeft: "2rem" }}>
            {course?.content?.map((session, index) => (
              <ListItem
                button
                key={index}
                onClick={() => {
                  setTitle(session.name);
                  setContent(session.posts);
                  setTab(1);
                  setSession(index);
                }}
              >
                <ListItemIcon>{<Assignment />}</ListItemIcon>
                <ListItemText primary={"Session " + (index + 1)} />
              </ListItem>
            ))}
          </List>
        </List>
        <Divider />
        <List>
          {["Description", "Authors", "Notes", "Resources", "Doubts"].map(
            (text, i) => (
              <ListItem
                button
                key={text}
                onClick={() => {
                  setTab(-1 - i);
                  setTitle(text);
                  setContent(course && course[arr[i]]);
                }}
              >
                <ListItemIcon>
                  {i === 0 ? (
                    <Description />
                  ) : i === 1 ? (
                    <People />
                  ) : i === 2 ? (
                    <Note />
                  ) : i === 3 ? (
                    <EventNote />
                  ) : (
                    <QuestionAnswerOutlined />
                  )}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            )
          )}
        </List>
      </div>
    );
    let i = 0,
      j = 0;
    let count = [];
    const container =
      window !== undefined ? () => window().document.body : undefined;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              style={{ marginLeft: "2rem", fontWeight: "bold" }}
              variant="h6"
              noWrap
            >
              <span
                style={{ cursor: title.split(">")[1] ? "pointer" : "text" }}
                onClick={
                  title.split(">")[1]
                    ? () => {
                        setTab(1);
                        setTitle(title.split(" > ")[0]);
                        setContent(course.content[session].posts);
                      }
                    : undefined
                }
              >
                {title.split(">")[0]}
              </span>
              {title.split(">")[1] ? <ArrowForwardIos /> : ""}
              {title.split(">")[1] ?? ""}
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
            {tab === 1 ? (
              <List style={{ border: "solid 2px #99bbad" }}>
                {content.map((post, idx) => {
                  count[idx] = post.type === "post" ? ++i : ++j;
                  return <PostItem key={idx} post={post} idx={idx} />;
                })}
              </List>
            ) : tab === 2 ? (
              <DisplayPost
                content={content}
                setIdx={setPostIdx}
                setContent={setContent}
                setTab={setTab}
                course={course}
                session={session}
                postIdx={postIdx}
                setTitle={setTitle}
              />
            ) : tab === 0 ? (
              <Overview
                isStudent={true}
                course={course}
                setContent={setContent}
                setTab={setTab}
                setSession={setSession}
                setTitle={setTitle}
              />
            ) : tab === -1 ? (
              <MathDisplay style={{ fontSize: "1.2rem" }} math={content} />
            ) : tab === -2 ? (
              <Authors course={course} courseId={courseId} isStudent={true} />
            ) : tab === -3 ? (
              <Notes courseId={courseId} />
            ) : tab === -4 ? (
              <Resources course={course} />
            ) : tab === 3 ? (
              <DisplayQuiz
                setContent={setContent}
                setPostIdx={setPostIdx}
                course={course}
                session={session}
                postIdx={postIdx}
                setTab={setTab}
                setSession={setSession}
                setTitle={setTitle}
              />
            ) : (
              <Doubts courseId={courseId} />
            )}
          </main>
        </div>
      </div>
    );
  }

  return <ResponsiveDrawer />;
};
