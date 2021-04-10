import { Link, useParams } from "react-router-dom";
import { db } from "../firebase/fire";
import { useDocumentData } from "react-firebase-hooks/firestore";
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
  Add,
  ArrowForwardIos,
  AssignmentOutlined,
  DashboardOutlined,
  DeleteOutline,
  DescriptionOutlined,
  EventNoteOutlined,
  ExtensionOutlined,
  NoteOutlined,
  People,
  PeopleOutline,
  QuestionAnswerOutlined,
  Queue,
  Remove,
  SpeakerNotesOutlined,
} from "@material-ui/icons";
import { useState } from "react";
import { Button, ListItemSecondaryAction } from "@material-ui/core";
import { MathDisplay } from "./MathDisplay";
import {
  Overview,
  AddQuiz,
  AddPostTOCourse,
  Authors,
  Notes,
  Resources,
  Doubts,
} from "./QuizComponents";
import { Loader } from "./Loader";

const drawerWidth = "18rem";

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
      marginLeft: "14rem",
    },
  },
  drawerPaper: {
    width: drawerWidth,
    padding: "1rem",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: "8rem 2.5%",
    [theme.breakpoints.up("sm")]: {
      padding: "8rem 12%",
    },
  },
}));

export const MyCourse = () => {
  const { courseId } = useParams();
  const arr = ["description", "moderator", "notes", "resources", "doubts"];
  const [course, error, loading] = useDocumentData(
    db.collection("courses").doc(courseId)
  );
  const [session, setSession] = useState(0);
  const [title, setTitle] = useState("Overview");
  const [content, setContent] = useState("");
  const [postIdx, setPostIdx] = useState(0);
  const [tab, setTab] = useState(0);

  if (loading) {
    return <Loader />;
  }
  if (error) {
    return <div className="justify-content-center">{error}</div>;
  }
  const addSession = async () => {
    await db
      .collection("courses")
      .doc(courseId)
      .update({
        content: [
          ...course.content,
          { name: "Session " + (course.content.length + 1), posts: [] },
        ],
      });
  };

  const removeSession = async (idx) => {
    if (course.content[idx].posts.length === 0) {
      await db
        .collection("courses")
        .doc(courseId)
        .update({
          content: [
            ...course.content.slice(0, idx),
            ...course.content.slice(idx + 1),
          ],
        });
    } else {
      alert(
        "There is some content in Session " +
          (idx + 1) +
          ". Clear all the content first"
      );
    }
  };

  const addPost = async () => {
    const newContent = [
      ...course.content.slice(0, session),
      {
        name: course.content[session].name,
        posts: [
          ...course.content[session].posts,
          { type: "post", duration: 10, name: "Post name" },
        ],
      },
      ...course.content.slice(session + 1),
    ];
    setContent(newContent[session].posts);
    await db.collection("courses").doc(courseId).update({
      content: newContent,
    });
  };

  const removePost = async (idx) => {
    const newContent = [
      ...course.content.slice(0, session),
      {
        name: course.content[session].name,
        posts: [
          ...course.content[session].posts.slice(0, idx),
          ...course.content[session].posts.slice(idx + 1),
        ],
      },
      ...course.content.slice(session + 1),
    ];
    setContent(newContent[session].posts);
    await db.collection("courses").doc(courseId).update({
      content: newContent,
    });
  };

  const addQuiz = async () => {
    const newContent = [
      ...course.content.slice(0, session),
      {
        name: course.content[session].name,
        posts: [
          ...course.content[session].posts,
          { type: "quiz", duration: 10, name: "Quiz name" },
        ],
      },
      ...course.content.slice(session + 1),
    ];
    setContent(newContent[session].posts);
    await db.collection("courses").doc(courseId).update({
      content: newContent,
    });
  };

  function ResponsiveDrawer(props) {
    const { window } = props;
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen);
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
                <ListItemIcon>{<AssignmentOutlined />}</ListItemIcon>
                <ListItemText primary={"Session " + (index + 1)} />
                <ListItemSecondaryAction
                  onClick={() => {
                    removeSession(index);
                  }}
                >
                  <Remove
                    style={{
                      color: "#025955",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <ListItem button onClick={addSession}>
            <ListItemIcon>{<Queue />}</ListItemIcon>
            <ListItemText primary={"Add Session"} />
          </ListItem>
        </List>
        <Divider />
        <List>
          {["Description", "Authors", "Notes", "Resources", "Doubts"].map(
            (text, i) => (
              <ListItem
                button
                key={text}
                onClick={() => {
                  setTab(-i - 1);
                  setTitle(text);
                  setContent(course && course[arr[i]]);
                }}
              >
                <ListItemIcon>
                  {i === 0 ? (
                    <DescriptionOutlined />
                  ) : i === 1 ? (
                    <People />
                  ) : i === 2 ? (
                    <NoteOutlined />
                  ) : i === 3 ? (
                    <EventNoteOutlined />
                  ) : i === 4 ? (
                    <PeopleOutline />
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
            transition: "all ease .3s",
          }}
          onClick={() => {
            setTitle(
              (prev) =>
                prev.split(" > ")[0] +
                " > " +
                (post.type === "post" ? "Post " : "Quiz ") +
                count[idx]
            );
            setPostIdx(idx);
            setTab(post.type === "post" ? 2 : 3);
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
          <ListItemSecondaryAction onClick={() => removePost(idx)}>
            <DeleteOutline style={{ color: "#025955", cursor: "pointer" }} />
          </ListItemSecondaryAction>
        </ListItem>
      );
    };

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
              <List
                style={{
                  border: "solid 2px #99bbad",
                  flex: "inherit",
                  display: "block",
                  overflow: "auto",
                }}
              >
                {content.map((post, idx) => {
                  count[idx] = post.type === "post" ? ++i : ++j;
                  return <PostItem post={post} idx={idx} />;
                })}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Button
                    onClick={addPost}
                    size="large"
                    startIcon={<Add />}
                    style={{ backgroundColor: "#1687a7", margin: "1rem" }}
                    variant="contained"
                    color="primary"
                  >
                    Add Post
                  </Button>
                  <Button
                    onClick={addQuiz}
                    size="large"
                    startIcon={<Add />}
                    style={{ backgroundColor: "#1687a7", margin: "1rem" }}
                    variant="contained"
                    color="primary"
                  >
                    Add Quiz
                  </Button>
                </div>
              </List>
            ) : tab === 0 ? (
              <Overview
                courseId={courseId}
                course={course}
                setTab={setTab}
                setContent={setContent}
                setTitle={setTitle}
                setSession={setSession}
              />
            ) : tab === 2 ? (
              <AddPostTOCourse
                setIdx={setPostIdx}
                courseId={courseId}
                setContent={setContent}
                setTab={setTab}
                course={course}
                session={session}
                postIdx={postIdx}
                setTitle={setTitle}
              />
            ) : tab === 3 ? (
              <AddQuiz
                setIdx={setPostIdx}
                courseId={courseId}
                setContent={setContent}
                setTab={setTab}
                course={course}
                session={session}
                postIdx={postIdx}
                setTitle={setTitle}
              />
            ) : tab === -1 ? (
              <MathDisplay style={{ fontSize: "1.2rem" }} math={content} />
            ) : tab === -2 ? (
              <Authors course={course} courseId={courseId} isStudent={false} />
            ) : tab === -3 ? (
              <Notes courseId={courseId} />
            ) : tab === -4 ? (
              <Resources course={course} />
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
