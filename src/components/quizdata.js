import {
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Toolbar,
  Typography,
  IconButton,
  Hidden,
  Dialog,
  DialogTitle,
  Container,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { generateTest } from "../firebase/api";
import { Center } from "./Center";
import { Loader } from "./Loader";
import { Question } from "./Question";
import { Time } from "./Time";
import { evaluateTest, getAnswers } from "../firebase/api";
import { QuizResult } from "./QuizResult";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/fire";
import { count_of_questions } from "../constants/generalConstants";
import { Prompt } from "react-router";
import React from "react";
import {
  ArrowBackIos,
  ArrowForwardIos,
  AssignmentTurnedIn,
  Cancel,
  CheckCircle,
  PlayArrow,
  ReportProblem,
} from "@material-ui/icons";
const drawerWidth = 270;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: "auto",
  },
  content: {
    flexGrow: 1,
    padding: "3rem 0",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
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
}));

const SimpleDialog = (props) => {
  const { onClose, open, onSubmit } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="Confirmation Box"
      open={open}
    >
      <DialogTitle id="Confirmation Box">
        Are you sure you want to submit the test?
      </DialogTitle>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="secondary"
          style={{ margin: "1rem" }}
          onClick={onClose}
          endIcon={<Cancel />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{ margin: "1rem" }}
          onClick={onSubmit}
          endIcon={<CheckCircle />}
        >
          Submit
        </Button>
      </div>
    </Dialog>
  );
};

function Quiz({ items, isAnswered, answeredQuestions, pastResult }) {
  const classes = useStyles();
  let isStarted = false;
  if (isAnswered) {
    isStarted = true;
  }
  const { moduleName, topic, subtopic } = useParams();
  const [user] = useAuthState(auth);
  const interval = useRef();
  const totalTimeRef = useRef();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queIndex, setQueIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [started, setStarted] = useState(isStarted);
  const [result, setResult] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [isReported, setIsReported] = useState([]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const setAnswer = (ans, index) => {
    setAnswers((prev) => [
      ...prev.slice(0, index),
      ans,
      ...prev.slice(index + 1),
    ]);
  };
  useEffect(() => {
    const loadQuestions = async () => {
      let questions = [];

      if (isAnswered) {
        questions = answeredQuestions;
      } else {
        const topic_list = topic.split("$");
        const subtopic_list = subtopic.split("$");
        if (subtopic === "all" || !subtopic) {
          for (const ind_topic of topic_list) {
            // console.log("For: ", ind_topic);
            let cnt = 10;
            if (
              count_of_questions[moduleName] !== undefined &&
              count_of_questions[moduleName][ind_topic] !== undefined
            ) {
              cnt = count_of_questions[moduleName][ind_topic];
            }
            let temp = await generateTest({
              count: cnt,
              topic: topic,
              subtopic: undefined,
              userId: user.uid,
            });
            // console.log("temp: ", temp);
            questions = questions.concat(temp);
            // console.log("after questions: ", questions)
          }
        }
        for (const ind_subtopic of subtopic_list) {
          let temp = await generateTest({
            count: 30,
            topic: undefined,
            subtopic: ind_subtopic,
            userId: user.uid,
          });
          questions = questions.concat(temp);
          // console.log("after questions: ", questions)
        }

        // topic_list.map(async ind_topic => {
        // 	console.log("ind_topic: ", ind_topic)
        // 	questions = questions.concat(await generateTest({count: 30, ind_topic, undefined}));
        // })

        // let questions = await generateTest({ count: 10, topic, subtopic });
        questions = questions.map((que) => ({
          ...que,
          time: que.time ? (que.time > 300 ? 300 : que.time) : 60,
        }));
      }

      let correctAnswers = await getAnswers(questions.map((que) => que.id));
      const alphabetic = ["a", "b", "c", "d", "e", "f"];
      correctAnswers = correctAnswers.map((ans) => alphabetic[ans]);
      setCorrectAnswers(correctAnswers);
      let isReported = correctAnswers.map((ans) => false);
      setIsReported(isReported);
      totalTimeRef.current = questions.reduce((sum, que) => {
        return sum + (que.time ? que.time : 20);
      }, 0);
      setRemainingTime(totalTimeRef.current);

      setQuestions(questions);
      setAnswers(Array(questions.length).fill(""));
      setLoading(false);
    };
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, subtopic]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async () => {
    clearInterval(interval.current);
    const timeUsed = totalTimeRef.current - remainingTime;
    setRemainingTime(0);
    const result = isAnswered
      ? pastResult
      : await evaluateTest(questions, answers, timeUsed, user.uid, topic);
    setResult(result);
  };

  const report = (index) => {
    const qid = questions[index].id;
    db.collection("questions")
      .doc(qid)
      .update({
        [`Reported.${user.uid}`]: true,
      });
    setIsReported((prev) =>
      prev.map((reportState, i) => (i === index ? true : reportState))
    );
  };

  const startQuiz = () => {
    interval.current = setInterval(() => {
      if (remainingTime <= 0) {
        onSubmit();
        return;
      }

      setRemainingTime((prev) => {
        let temp = prev - 1;
        // if(lastPaused !== undefined) {
        // 	console.log("yes");
        // 	temp = (prev - new Date() + lastPaused) - 1;
        // 	console.log(temp);
        // 	lastPaused = undefined;
        // }

        return temp;
      });
    }, 1000);
    setStarted(true);
  };

  if (loading) {
    return <Loader />;
  }

  // if(userData === undefined) {
  // 	return <Loader />
  // }

  // if((userData?.modulePermissions === undefined) || userData.modulePermissions[moduleName] === undefined) {
  // 	return(
  // 		<UnAuthorized />
  // 	)
  // }
  let topicNames = "";
  let subtopicNames = "";
  const topic_list = topic.split("$");
  topicNames = topic_list.join(", ");

  if (subtopic) {
    const subtopic_list = subtopic.split("$");
    subtopicNames = subtopic_list.join(", ");
  }
  if (!started) {
    return (
      <Center>
        <div
          style={{ display: "flex", flexDirection: "column", fontSize: "16px" }}
        >
          <ol>
            <li>
              The test topic is {topicNames} / {subtopicNames}.
            </li>
            <li>There are total {questions.length} questions.</li>
            <li>
              Duration is <Time seconds={remainingTime} />.
            </li>
          </ol>

          <div style={{ height: "1rem" }} />

          <Button
            variant="contained"
            color="primary"
            onClick={startQuiz}
            startIcon={<PlayArrow />}
          >
            Start
          </Button>
        </div>
      </Center>
    );
  }

  if (remainingTime <= 0) {
    if (result) return <QuizResult result={result} questions={questions} />;
    else return <Center>Loading result...</Center>;
  }

  const drawer = (
    <div className={classes.drawerContainer}>
      <List>
        {questions.map((que, index) => (
          <ListItem
            button
            key={index}
            onClick={() => setQueIndex(index)}
            selected={queIndex === index}
          >
            <ListItemText
              primary={`Question ${index + 1}${answers[index] && " ✔"}`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Container>
      <Prompt
        when={true}
        message={() => {
          return "Are you sure you want to leave this page?";
        }}
      />

      <div className={classes.root}>
        <div className={classes.drawer}>
          <Hidden smUp implementation="css">
            <Drawer
              variant="temporary"
              classes={{ paper: classes.drawerPaper }}
              open={mobileOpen}
              onClose={handleDrawerToggle}
            >
              <Toolbar />
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
              <Toolbar />
              {drawer}
            </Drawer>
          </Hidden>
        </div>

        <div className={classes.content}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {topicNames}/{subtopicNames}
            </div>
            {!isAnswered && (
              <Typography variant={"h5"} component="div">
                <Time seconds={remainingTime} />
              </Typography>
            )}
          </div>
          <br />
          <Typography variant="h4" component="h3">
            Question {queIndex + 1}
          </Typography>
          <Question
            disabled={isAnswered}
            question={questions[queIndex]}
            onChange={(ans) => setAnswer(ans, queIndex)}
            ansValue={answers[queIndex]}
            seeOptions={true}
          />

          {isAnswered && (
            <div
              style={{
                backgroundColor: "#ddffff",
                margin: ".5rem",
                padding: ".4rem",
                borderLeft: "6px solid #2196F3",
              }}
            >
              <Typography variant="h6" component="h5">
                Correct Answer: {correctAnswers[queIndex]}
              </Typography>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              style={{ margin: "1rem" }}
              onClick={() => report(queIndex)}
              disabled={isReported[queIndex]}
              startIcon={<ReportProblem />}
            >
              Report
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="secondary"
              style={{ margin: "1rem" }}
              onClick={() => setQueIndex((prev) => Math.max(0, prev - 1))}
              disabled={queIndex === 0}
              startIcon={<ArrowBackIos />}
            >
              Prev
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="secondary"
              style={{ margin: "1rem" }}
              onClick={() =>
                setQueIndex((prev) => Math.min(questions.length - 1, prev + 1))
              }
              disabled={queIndex === questions.length - 1}
              endIcon={<ArrowForwardIos />}
            >
              Next
            </Button>

            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{ margin: "1rem" }}
              onClick={isAnswered ? onSubmit : handleClickOpen}
              startIcon={<AssignmentTurnedIn />}
            >
              End Test
            </Button>
            {open && (
              <SimpleDialog
                open={open}
                onClose={handleClose}
                onSubmit={onSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
export default Quiz;
