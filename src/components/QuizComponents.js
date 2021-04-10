import {
  Box,
  Button,
  Collapse,
  Container,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  AccessTime,
  ArrowBack,
  ArrowBackIos,
  ArrowForward,
  ArrowForwardIos,
  BlurOn,
  CollectionsBookmarkOutlined,
  DeleteOutline,
  DoneAllOutlined,
  Edit,
  EmojiObjectsOutlined,
  LibraryBooksOutlined,
  LocalOfferOutlined,
  NotListedLocationOutlined,
  PostAdd,
  Save,
} from "@material-ui/icons";
import { useEffect, useState } from "react";
import { MyUploadAdapter } from "../components/MyUploadAdaptor";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { db } from "../firebase/fire";
import { TagInput } from "./TagInput";
import { AllQuestionsList } from "./AllQuestionsList";
import { AddQuestion } from "./AddQuestion";
import { Question } from "./Question";
import { MathDisplay } from "./MathDisplay";
import { DisplayResources } from "./DisplayResources";
import { getAnswers } from "../firebase/api";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import { Discussion } from "../pages/Discussion";
import Chart from "react-apexcharts";
import { Posts } from "../pages/Posts";
import { Code } from "./Code";

var percentColors = [
  { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
  { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
  { pct: 1.0, color: { r: 0x00, g: 0x7f, b: 0 } },
];

var getColorForPercentage = function (pct) {
  for (var i = 1; i < percentColors.length - 1; i++) {
    if (pct < percentColors[i].pct) {
      break;
    }
  }
  var lower = percentColors[i - 1];
  var upper = percentColors[i];
  var range = upper.pct - lower.pct;
  var rangePct = (pct - lower.pct) / range;
  var pctLower = 1 - rangePct;
  var pctUpper = rangePct;
  var color = {
    r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
    g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
    b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper),
  };
  return "rgb(" + [color.r, color.g, color.b].join(",") + ")";
  // or output as hex if preferred
};

export const Overview = ({
  courseId,
  course,
  setTab,
  setContent,
  setTitle,
  setSession,
  isStudent = false,
}) => {
  const SessionItem = ({ idx, session }) => {
    const [edit, setEdit] = useState(false);
    const [hover, setHover] = useState(false);
    const [name, setName] = useState(session.name ?? "");
    const [edit2, setEdit2] = useState(false);
    const [tags, setTags] = useState(course?.content?.[idx]?.tags ?? []);

    const save = async (e) => {
      e.preventDefault();
      const newContent = [
        ...course.content.slice(0, idx),
        { name, posts: course.content[idx].posts, tags },
        ...course.content.slice(idx + 1),
      ];
      await db.collection("courses").doc(courseId).update({
        content: newContent,
      });
      setEdit(false);
    };

    const save2 = async (e) => {
      e.preventDefault();
      const newContent = [
        ...course.content.slice(0, idx),
        { name, posts: course.content[idx].posts, tags },
        ...course.content.slice(idx + 1),
      ];
      await db.collection("courses").doc(courseId).update({
        content: newContent,
      });
      setEdit2(false);
    };

    let totalDuration = 0;
    if (session.posts.length > 0)
      totalDuration = session.posts
        .map((post) => post.duration)
        ?.reduce((sum = 0, duration) => sum + duration);

    return (
      <List
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={"col-12 col-sm-5"}
        style={{
          border: "solid 2px #99bbad",
          backgroundColor: hover ? "#f4f9f9" : "",
          cursor: "pointer",
          margin: ".5rem",
          padding: "1rem",
          transition: "all ease .3s"
        }}
      >
        <ListItem className={"row"}>
          {edit ? (
            <form onSubmit={save}>
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BlurOn />
                    </InputAdornment>
                  ),
                }}
                autoFocus
                label="Session Name"
                placeholder="Session name"
                name="Name"
                value={name}
                style={{ display: "flex", flex: "1", margin: "1rem 0" }}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
                onBlur={save}
              />
              <Button style={{ display: "none" }} type="submit"></Button>
            </form>
          ) : (
            <ListItemText>
              <span style={{ fontWeight: "bold" }}>Session {idx + 1}:</span>{" "}
              <span>{session.name}</span>{" "}
              {!isStudent && (
                <Edit
                  style={{
                    color: "#025955",
                    fontSize: "1.2rem",
                    marginLeft: ".7rem",
                  }}
                  onClick={() => setEdit(true)}
                />
              )}
            </ListItemText>
          )}

          <List
            onClick={() => {
              setTab(1);
              setContent(session.posts);
              setTitle(session.name);
              setSession(idx);
            }}
            style={{
              border: "solid 1px #99bbad",
              backgroundColor: hover ? "white" : "#f4f9f9",
              margin: ".5rem",
              padding: "1rem",
              width: "100%",
              transition: "all ease .3s"
            }}
          >
            <ListItemText>
              <LibraryBooksOutlined style={{ margin: "0 .5rem" }} />
              <span style={{ fontWeight: "bold" }}>Total Posts:</span>{" "}
              {
                course.content[idx]?.posts.filter(
                  (post) => post.type === "post"
                ).length
              }
            </ListItemText>
          </List>
          <List
            onClick={() => {
              setTab(1);
              setContent(session.posts);
              setTitle(session.name);
              setSession(idx);
            }}
            style={{
              border: "solid 1px #99bbad",
              backgroundColor: hover ? "white" : "#f4f9f9",
              margin: ".5rem",
              padding: "1rem",
              width: "100%",
              transition: "all ease .3s"
            }}
          >
            <ListItemText>
              <CollectionsBookmarkOutlined style={{ margin: "0 .5rem" }} />
              <span style={{ fontWeight: "bold" }}>Total Quizes:</span>{" "}
              {
                course.content[idx]?.posts.filter(
                  (post) => post.type === "quiz"
                ).length
              }
            </ListItemText>
          </List>
          <ListItemText
            style={{ margin: "1rem 0", opacity: 0.8, textAlign: "right" }}
          >
            <span style={{ fontWeight: "bold" }}>Total Duration:</span>{" "}
            {totalDuration} mins
          </ListItemText>
          {edit2 ? (
            <form onSubmit={save2}>
              <Box
                display="flex"
                alignItems="baseline"
                justifyContent="space-between"
                style={{ marginTop: "1rem" }}
              >
                <TagInput
                  topic={course.topic}
                  style={{
                    display: "flex",
                    flex: "1",
                    margin: "1rem",
                    maxWidth: "20vw",
                  }}
                  subtopic={course.subtopic}
                  tags={tags}
                  onChange={(tags) => {
                    setTags(tags);
                  }}
                />
              </Box>
              <Button style={{ display: "none" }} type="submit"></Button>
            </form>
          ) : (
            !isStudent && (
              <LocalOfferOutlined
                color="primary"
                style={{ fontSize: "1.6rem", margin: ".4rem" }}
                onClick={() => {
                  setEdit2(true);
                }}
              />
            )
          )}
        </ListItem>
      </List>
    );
  };
  return (
    <div className={"row"} style={{ margin: "0 0 1rem" }}>
      <Typography className="col-12" variant="h3">
        {course?.title}
      </Typography>
      {course?.content.map((session, idx) => (
        <SessionItem key={idx} session={session} idx={idx} />
      ))}
    </div>
  );
};

export const AddPostTOCourse = ({
  setIdx,
  course,
  session,
  postIdx,
  setContent,
  setTab,
  courseId,
  setTitle,
}) => {
  const post = course.content[session].posts[postIdx];
  const [name, setName] = useState(post?.name ?? "");
  const [content, setPostContent] = useState(post?.content ?? "");
  const [duration, setDuration] = useState(post?.duration ?? 10);
  let i = 0,
    j = 0;
  const count = course.content[session].posts.map((post) => {
    return post.type === "post" ? ++i : ++j;
  });
  const save = async () => {
    const newContent = [
      ...course.content.slice(0, session),
      {
        name: course.content[session].name,
        posts: [
          ...course.content[session].posts.slice(0, postIdx),
          {
            type: "post",
            duration: parseInt(duration),
            name: name,
            content: content,
          },
          ...course.content[session].posts.slice(postIdx + 1),
        ],
        tags: course.content[session].tags ?? [],
      },
      ...course.content.slice(session + 1),
    ];
    setContent(newContent[session].posts);
    await db.collection("courses").doc(courseId).update({
      content: newContent,
    });
    setTab(1);
  };

  const goBack = async () => {
    setTitle((prev) => prev.split(" > ")[0]);
    setTab(1);
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <Button
          startIcon={<ArrowBackIos />}
          onClick={() => {
            setTitle(
              (prev) =>
                prev.split(" > ")[0] +
                " > " +
                (course.content[session].posts[postIdx - 1]?.type === "post"
                  ? "Post "
                  : "Quiz ") +
                count[postIdx - 1]
            );
            setIdx((prev) => prev - 1);
            setTab(
              course.content[session].posts[postIdx - 1]?.type === "post"
                ? 2
                : 3
            );
          }}
          disabled={postIdx === 0}
          style={{
            color: postIdx === 0 ? "#bbbbbb" : "#ff7171",
            margin: "0 2rem 1rem",
            marginLeft: "auto",
          }}
        >
          Prev
        </Button>

        <Button
          onClick={() => {
            setTitle(
              (prev) =>
                prev.split(" > ")[0] +
                " > " +
                (course.content[session].posts[postIdx + 1]?.type === "post"
                  ? "Post "
                  : "Quiz ") +
                count[postIdx + 1]
            );
            setIdx((prev) => prev + 1);
            setTab(
              course.content[session].posts[postIdx + 1]?.type === "post"
                ? 2
                : 3
            );
          }}
          disabled={postIdx === course.content[session].posts.length - 1}
          style={{
            color:
              postIdx === course.content[session].posts.length - 1
                ? "#bbbbbb"
                : "#ff7171",
            margin: "0 2rem 1rem",
          }}
          endIcon={<ArrowForwardIos />}
        >
          Next
        </Button>
      </div>

      <TextField
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <BlurOn />
            </InputAdornment>
          ),
        }}
        label="Name"
        placeholder="Post name"
        name="Name"
        value={name}
        style={{ display: "flex", flex: "1", margin: "1rem 0" }}
        onChange={(event) => setName(event.target.value)}
        autoComplete="off"
      />
      <Container style={{ maxWidth: "100vw" }}>
        <CKEditor
          editor={ClassicEditor}
          data={content}
          onReady={(editor) => {
            if (editor) {
              editor.plugins.get("FileRepository").createUploadAdapter = (
                loader
              ) => {
                const temp = new MyUploadAdapter(loader);
                return temp;
              };
            }
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            setPostContent(data);
          }}
        />
      </Container>
      <Box
        display="flex"
        alignItems="baseline"
        justifyContent="space-between"
        style={{ marginTop: "1rem" }}
      >
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccessTime />
              </InputAdornment>
            ),
          }}
          label="Duration in min"
          placeholder="Post Duration"
          name="duration"
          type="number"
          value={duration}
          style={{ flex: ".2", margin: "1rem" }}
          onChange={(event) => setDuration(event.target.value)}
          autoComplete="off"
        />
      </Box>
      <Button
        style={{ margin: "1rem" }}
        variant="contained"
        color="primary"
        startIcon={<Save />}
        onClick={save}
      >
        Save
      </Button>
      <Button
        style={{ margin: "1rem" }}
        variant="contained"
        color="primary"
        startIcon={<ArrowBack />}
        onClick={goBack}
      >
        Back
      </Button>
    </div>
  );
};

export const AddQuiz = ({
  setIdx,
  course,
  session,
  postIdx,
  setContent,
  setTab,
  courseId,
  setTitle,
}) => {
  const quiz = course.content[session].posts[postIdx];
  const [name, setName] = useState(quiz?.name ?? "");
  const [duration, setDuration] = useState(quiz?.duration ?? 10);
  const [addQuestion, setAddQuestion] = useState(false);
  const questions = course.content[session].posts[postIdx].questions ?? [];

  const [completeQuestions, setCompleteQuestions] = useState([]);

  useEffect(() => {
    questions.forEach((questionId) => {
      db.collection("questions")
        .doc(questionId)
        .get()
        .then((res) => {
          setCompleteQuestions((prev) => [...prev, res.data()]);
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let i = 0,
    j = 0;

  const count = course.content[session].posts.map((post) => {
    return post.type === "post" ? ++i : ++j;
  });
  const save = async () => {
    const newContent = [
      ...course.content.slice(0, session),
      {
        name: course.content[session].name,
        posts: [
          ...course.content[session].posts.slice(0, postIdx),
          {
            type: "quiz",
            duration: parseInt(duration),
            name: name,
            questions: [...questions],
          },
          ...course.content[session].posts.slice(postIdx + 1),
        ],
        tags: course.content[session].tags ?? [],
      },
      ...course.content.slice(session + 1),
    ];
    setContent(newContent[session].posts);
    await db.collection("courses").doc(courseId).update({
      content: newContent,
    });
    setTab(1);
  };

  const addQuestionId = async (queId) => {
    if (questions.includes(queId) && queId !== "1") {
      alert("This question is already in this quiz");
      return;
    }
    if (questions.length > 4) {
      alert("Can not add more than five questions");
      return;
    }
    const newContent = [
      ...course.content.slice(0, session),
      {
        name: course.content[session].name,
        posts: [
          ...course.content[session].posts.slice(0, postIdx),
          {
            type: "quiz",
            duration: parseInt(duration),
            name: name,
            questions: [...questions, queId],
          },
          ...course.content[session].posts.slice(postIdx + 1),
        ],
        tags: course.content[session].tags ?? [],
      },
      ...course.content.slice(session + 1),
    ];

    await db.collection("courses").doc(courseId).update({
      content: newContent,
    });
  };
  const removeQuestion = async (idx) => {
    const newContent = [
      ...course.content.slice(0, session),
      {
        name: course.content[session].name,
        posts: [
          ...course.content[session].posts.slice(0, postIdx),
          {
            type: "quiz",
            duration: parseInt(duration),
            name: name,
            questions: questions.filter((_, index) => index !== idx),
          },
          ...course.content[session].posts.slice(postIdx + 1),
        ],
        tags: course.content[session].tags ?? [],
      },
      ...course.content.slice(session + 1),
    ];

    await db.collection("courses").doc(courseId).update({
      content: newContent,
    });
  };

  const goBack = async () => {
    setTitle((prev) => prev.split(" > ")[0]);
    setTab(1);
  };
  const tags = course.content[session].tags ?? [];

  return addQuestion ? (
    <AddQuestion tagsPassed={tags} />
  ) : (
    <div>
      <div style={{ display: "flex" }}>
        <Button
          startIcon={<ArrowBackIos />}
          onClick={() => {
            setTitle(
              (prev) =>
                prev.split(" > ")[0] +
                " > " +
                (course.content[session].posts[postIdx - 1]?.type === "post"
                  ? "Post "
                  : "Quiz ") +
                count[postIdx - 1]
            );
            setIdx((prev) => prev - 1);
            setTab(
              course.content[session].posts[postIdx - 1].type === "post" ? 2 : 3
            );
          }}
          disabled={postIdx === 0}
          style={{
            color: postIdx === 0 ? "#bbbbbb" : "#ff7171",
            margin: "0 2rem 1rem",
            marginLeft: "auto",
          }}
        >
          Prev
        </Button>
        <Button
          onClick={() => {
            setTitle(
              (prev) =>
                prev.split(" > ")[0] +
                " > " +
                (course.content[session].posts[postIdx + 1]?.type === "post"
                  ? "Post "
                  : "Quiz ") +
                count[postIdx + 1]
            );
            setIdx((prev) => prev + 1);
            setTab(
              course.content[session].posts[postIdx + 1].type === "post" ? 2 : 3
            );
          }}
          disabled={postIdx === course.content[session].posts.length - 1}
          style={{
            color:
              postIdx === course.content[session].posts.length - 1
                ? "#bbbbbb"
                : "#ff7171",
            margin: "0 2rem 1rem",
          }}
          endIcon={<ArrowForwardIos />}
        >
          Next
        </Button>
      </div>
      <TextField
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <BlurOn />
            </InputAdornment>
          ),
        }}
        label="Name"
        placeholder="Quiz name"
        name="Name"
        value={name}
        style={{ display: "flex", flex: "1", margin: "1rem 0" }}
        onChange={(event) => setName(event.target.value)}
        autoComplete="off"
      />
      <AllQuestionsList tags={tags} addQuestionId={addQuestionId} />

      <Button
        style={{ margin: "1rem" }}
        disabled={!tags.length}
        variant="contained"
        color="secondary"
        startIcon={<PostAdd />}
        onClick={() => {
          setAddQuestion(true);
        }}
      >
        Add New Question
      </Button>
      <Button
        style={{ margin: "1rem" }}
        disabled={!tags.length}
        variant="outlined"
        color="secondary"
        startIcon={<PostAdd />}
        onClick={() => {
          addQuestionId("1");
        }}
      >
        Add Automatic Question
      </Button>

      <Typography variant="h4" style={{ marginTop: "2rem" }}>
        Added Questions
      </Typography>
      <div style={{ overflow: "auto", maxHeight: "30rem" }}>
        {completeQuestions.map((question, idx) => (
          <div key={idx}>
            <Question question={question} style={{ margin: "1rem 0 .2rem" }} />
            <Button
              style={{ color: "#ff7171" }}
              onClick={() => removeQuestion(idx)}
              endIcon={<DeleteOutline />}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Box
        display="flex"
        alignItems="baseline"
        justifyContent="space-between"
        style={{ marginTop: "1rem" }}
      >
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccessTime />
              </InputAdornment>
            ),
          }}
          label="Duration in min"
          placeholder="Quiz Duration"
          name="duration"
          type="number"
          value={duration}
          style={{ flex: "1", margin: "1rem" }}
          onChange={(event) => setDuration(event.target.value)}
          autoComplete="off"
        />
      </Box>
      <Button
        style={{ margin: "1rem" }}
        variant="contained"
        color="primary"
        startIcon={<Save />}
        onClick={save}
      >
        Save
      </Button>
      <Button
        style={{ margin: "1rem" }}
        variant="contained"
        color="primary"
        startIcon={<ArrowBack />}
        onClick={goBack}
      >
        Back
      </Button>
    </div>
  );
};

export const Authors = ({ course, isStudent, courseId }) => {
  const [moderator, setModerator] = useState({});
  const [content, setContent] = useState(course?.moderatorDesc ?? "");

  useEffect(() => {
    db.collection("users")
      .doc(course?.moderator ?? "")
      .get()
      .then((res) => {
        setModerator(res.data());
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    await db.collection("courses").doc(courseId).update({
      moderatorDesc: content,
    });
  };

  return (
    <div>
      <Typography variant="h4" style={{ margin: "2rem" }}>
        {moderator.name}
      </Typography>
      {isStudent ? (
        <MathDisplay
          math={course.moderatorDesc ?? ""}
          style={{ marginLeft: "2rem" }}
        />
      ) : (
        <Container maxWidth="md">
          <CKEditor
            editor={ClassicEditor}
            data={content}
            onReady={(editor) => {
              if (editor) {
                editor.plugins.get("FileRepository").createUploadAdapter = (
                  loader
                ) => {
                  const temp = new MyUploadAdapter(loader);
                  return temp;
                };
              }
            }}
            onChange={(event, editor) => {
              const data = editor.getData();
              setContent(data);
            }}
          />
          <Button
            style={{ margin: "1rem" }}
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={save}
          >
            Save
          </Button>
        </Container>
      )}
    </div>
  );
};

export const Notes = ({ courseId }) => {
  return (
    <div>
      <Posts course={courseId} />
    </div>
  );
};

export const Resources = ({ course }) => {
  let tags = [];
  course.content.forEach((session) => {
    tags = tags.concat(session.tags);
  });

  return (
    <div>
      <DisplayResources
        subtopicPassed={course.subtopic}
        topicPassed={course.topic}
        tags={tags}
      />
    </div>
  );
};

export const Doubts = ({ courseId }) => {
  return (
    <div>
      <Discussion courseId={courseId} />
    </div>
  );
};

export const DisplayPost = ({
  course,
  content,
  setTitle,
  setIdx,
  setTab,
  session,
  postIdx,
  setContent,
}) => {
  let i = 0,
    j = 0;

  const count = course.content[session].posts.map((post) => {
    return post.type === "post" ? ++i : ++j;
  });

  return (
    <div>
      <div style={{ display: "flex" }}>
        <Button
          startIcon={<ArrowBackIos />}
          onClick={() => {
            setContent(course.content[session].posts[postIdx - 1]?.content);
            setTitle(
              (prev) =>
                prev.split(" > ")[0] +
                " > " +
                (course.content[session].posts[postIdx - 1]?.type === "post"
                  ? "Post "
                  : "Quiz ") +
                count[postIdx - 1]
            );
            setIdx((prev) => prev - 1);
            setTab(
              course.content[session].posts[postIdx - 1]?.type === "post"
                ? 2
                : 3
            );
          }}
          disabled={postIdx === 0}
          style={{
            color: postIdx === 0 ? "#bbbbbb" : "#ff7171",
            margin: "0 2rem 1rem",
            marginLeft: "auto",
          }}
        >
          Prev
        </Button>

        <Button
          onClick={() => {
            setContent(course.content[session].posts[postIdx + 1]?.content);
            setTitle(
              (prev) =>
                prev.split(" > ")[0] +
                " > " +
                (course.content[session].posts[postIdx + 1]?.type === "post"
                  ? "Post "
                  : "Quiz ") +
                count[postIdx + 1]
            );
            setIdx((prev) => prev + 1);
            setTab(
              course.content[session].posts[postIdx + 1]?.type === "post"
                ? 2
                : 3
            );
          }}
          disabled={postIdx === course.content[session].posts.length - 1}
          style={{
            color:
              postIdx === course.content[session].posts.length - 1
                ? "#bbbbbb"
                : "#ff7171",
            margin: "0 2rem 1rem",
          }}
          endIcon={<ArrowForwardIos />}
        >
          Next
        </Button>
      </div>
      <div
        style={{ fontSize: "1.2rem" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export const DisplayQuiz = ({
  course,
  session,
  postIdx,
  setTitle,
  setPostIdx,
  setTab,
  setContent,
}) => {
  const questionIds = course.content[session].posts[postIdx].questions ?? [];
  const tags = course.content[session].tags ?? [];
  let [randomQuestions] = useCollectionDataOnce(
    db
      .collection("questions")
      .where("tags", "array-contains-any", tags.length ? tags : [""])
      .limit(10),
    { idField: "id" }
  );
  const questions = questionIds.map((id) =>
    id === "1"
      ? randomQuestions?.[Math.floor(Math.random() * 5)]?.id ??
        "tWJNVwWc5D5tiOdNX9eF"
      : id
  );

  let i = 0,
    j = 0;

  const count = course.content[session].posts.map((post) => {
    return post.type === "post" ? ++i : ++j;
  });

  const [answers, setAnswers] = useState([]);
  const [completeQuestions, setCompleteQuestions] = useState([]);
  const [done, setDone] = useState(false);
  const [idx, setIdx] = useState(0);
  const [values, setValues] = useState(Array(questions.length).fill(""));
  const correctAnswers = answers.reduce((total, ans, idx) => {
    console.log(values[idx], ans);
    return ans.toString() === values[idx] ? total + 1 : total + 0;
  }, 0);
  console.log(correctAnswers);
  const chart = {
    series: [(correctAnswers / questions.length) * 100],
    options: {
      chart: {
        height: 350,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "80%",
          },
          dataLabels: {
            name: {
              fontSize: "32px",
              color: "#888",
              offsetY: "-10",
              margin: "5px",
            },
            value: {
              fontSize: "36px",
              color: getColorForPercentage(correctAnswers / questions.length),
              margin: "5px",
            },
            total: {
              show: true,
              label: [
                correctAnswers === questions.length ? "Perfect Score" : "Score",
              ],
              formatter: function (w) {
                // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                return "" + correctAnswers + "/" + questions.length;
              },
            },
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
      labels: [correctAnswers === questions.length ? "Perfect Score" : "Score"],
      fill: {
        colors: getColorForPercentage(correctAnswers / questions.length),
      },
    },
  };

  useEffect(() => {
    setCompleteQuestions([]);
    questions.forEach((questionId) => {
      db.collection("questions")
        .doc(questionId)
        .get()
        .then((res) => {
          setCompleteQuestions((prev) => [...prev, res.data()]);
        });
    }, []);

    getAnswers(questions).then((res) => {
      setAnswers(res);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const QuestionItem = () => {
    const [value, setValue] = useState(values[idx]);
    const [counter, setCounter] = useState(0);
    const [seeHint1, setSeeHint1] = useState(false);
    const [seeHint2, setSeeHint2] = useState(false);
    const [seeSolution, setSeeSolution] = useState(false);
    const [seeResult, setSeeResult] = useState(false);
    return (
      <div>
        {done ? (
          <div className="row">
            <Chart
              className="col-12 col-lg-6"
              options={chart.options}
              series={chart.series}
              type="radialBar"
            />
            <div className="col-12 col-lg-6 alert">
              <Typography
                style={{
                  fontSize: "1.5rem",
                  textAlign: "center",
                  margin: "0 2rem",
                  padding: "2rem",
                  color: getColorForPercentage(
                    correctAnswers / questions.length
                  ),
                }}
              >
                {" "}
                You scored {correctAnswers} out of {questions.length}
              </Typography>
              {correctAnswers === questions.length && (
                <Typography
                  style={{
                    fontSize: "1.2rem",
                    textAlign: "center",
                    color: "#282846",
                    margin: "0 2rem",
                    padding: "2rem",
                  }}
                >
                  You are ready to move on to the next lesson{" "}
                  <ArrowForward
                    style={{ color: "blue", cursor: "pointer" }}
                    onClick={() => {
                      setContent(
                        course.content[session].posts[postIdx + 1]?.content
                      );
                      setTitle(
                        (prev) =>
                          prev.split(" > ")[0] +
                          " > " +
                          (course.content[session].posts[postIdx + 1]?.type ===
                          "post"
                            ? "Post "
                            : "Quiz ") +
                          count[postIdx + 1]
                      );
                      setPostIdx((prev) => prev + 1);
                      setTab(
                        course.content[session].posts[postIdx + 1]?.type ===
                          "post"
                          ? 2
                          : 3
                      );
                    }}
                    disabled={
                      postIdx === course.content[session].posts.length - 1
                    }
                  />
                </Typography>
              )}
            </div>
          </div>
        ) : (
          completeQuestions.length > 0 && (
            <Question
              question={completeQuestions[idx]}
              ansValue={value}
              onChange={(val) => {
                setValue(val);
                setValues((prev) => {
                  const newValues = prev;
                  newValues[idx] = val;
                  return newValues;
                });
              }}
              seeOptions
              seeHint1={seeHint1}
              seeHint2={seeHint2}
              seeSolution={seeSolution}
            />
          )
        )}
        {!done && completeQuestions[idx]?.type === "code" && <Code />}
        <Collapse
          in={seeResult}
          timeout={{ appear: 100, enter: 200, exit: 1000 }}
        >
          <div
            style={{
              justifyContent: "center",
              display: "flex",
              fontSize: "1.5rem",
              color:
                values[idx] === answers[idx]?.toString()
                  ? "#00917c"
                  : "#ec4646",
              margin: "1rem",
            }}
          >
            {values[idx] === answers[idx]?.toString()
              ? "Hooray! you got it right"
              : `Oops! try ${
                  seeHint2
                    ? "again"
                    : `taking ${seeHint1 ? "another hint" : "a hint"}`
                }`}
          </div>
        </Collapse>

        <div style={{ display: "flex" }}>
          <Button
            startIcon={<ArrowBackIos />}
            onClick={() => {
              if (idx === questions.length) setDone(false);
              setIdx((prev) => prev - 1);
            }}
            disabled={idx === 0}
            style={{ color: idx === 0 ? "#bbbbbb" : "#ff7171", margin: "1rem" }}
          >
            Prev
          </Button>
          <Button
            startIcon={<NotListedLocationOutlined />}
            onClick={() => {
              values[idx] !== answers[idx]?.toString()
                ? seeHint1
                  ? setCounter(2)
                  : setCounter(1)
                : setCounter(-1);
              setSeeResult(true);
              setTimeout(() => setSeeResult(false), 1000);
            }}
            variant="contained"
            disabled={questions.length === 0 || !values[idx]}
            style={{
              backgroundColor:
                questions.length === 0 || !values[idx] ? "#bbbbbb" : "#ff7171",
              margin: "1rem",
              color: "white",
              marginLeft: "auto",
            }}
          >
            Check
          </Button>
          {counter === -1 && completeQuestions[idx].solution && (
            <Button
              startIcon={<DoneAllOutlined />}
              onClick={() => {
                setSeeSolution(true);
              }}
              variant="outlined"
              style={{
                border: "1px solid green",
                margin: "1rem",
                color: "green",
              }}
            >
              See Solution
            </Button>
          )}
          {counter === 1 && completeQuestions[idx].hint && (
            <Button
              startIcon={<EmojiObjectsOutlined />}
              onClick={() => {
                setSeeHint1(true);
              }}
              variant="outlined"
              style={{
                border: "1px solid #db6400",
                margin: "1rem",
                color: "#db6400",
              }}
            >
              See Hint
            </Button>
          )}
          {counter > 1 && completeQuestions[idx].hint2 && (
            <Button
              startIcon={<EmojiObjectsOutlined />}
              onClick={() => {
                setSeeHint2(true);
              }}
              variant="outlined"
              style={{
                border: "1px solid #e45826",
                margin: "1rem",
                color: "#e45826",
              }}
            >
              See Another Hint
            </Button>
          )}
          <Button
            onClick={() => {
              if (idx === questions.length - 1) setDone(true);
              setIdx((prev) => prev + 1);
            }}
            disabled={idx === questions.length || questions.length === 0}
            style={{
              color:
                idx === questions.length || questions.length === 0
                  ? "#bbbbbb"
                  : "#ff7171",
              margin: "1rem",
            }}
            endIcon={<ArrowForwardIos />}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };
  return (
    <div>
      <div style={{ display: "flex" }}>
        <Button
          startIcon={<ArrowBackIos />}
          onClick={() => {
            setContent(course.content[session].posts[postIdx - 1]?.content);
            setTitle(
              (prev) =>
                prev.split(" > ")[0] +
                " > " +
                (course.content[session].posts[postIdx - 1]?.type === "post"
                  ? "Post "
                  : "Quiz ") +
                count[postIdx - 1]
            );
            setPostIdx((prev) => prev - 1);
            setTab(
              course.content[session].posts[postIdx - 1]?.type === "post"
                ? 2
                : 3
            );
          }}
          disabled={postIdx === 0}
          style={{
            color: postIdx === 0 ? "#bbbbbb" : "#ff7171",
            margin: "0 2rem 1rem",
            marginLeft: "auto",
          }}
        >
          Prev
        </Button>

        <Button
          onClick={() => {
            setContent(course.content[session].posts[postIdx + 1]?.content);
            setTitle(
              (prev) =>
                prev.split(" > ")[0] +
                " > " +
                (course.content[session].posts[postIdx + 1]?.type === "post"
                  ? "Post "
                  : "Quiz ") +
                count[postIdx + 1]
            );
            setPostIdx((prev) => prev + 1);
            setTab(
              course.content[session].posts[postIdx + 1]?.type === "post"
                ? 2
                : 3
            );
          }}
          disabled={postIdx === course.content[session].posts.length - 1}
          style={{
            color:
              postIdx === course.content[session].posts.length - 1
                ? "#bbbbbb"
                : "#ff7171",
            margin: "0 2rem 1rem",
          }}
          endIcon={<ArrowForwardIos />}
        >
          Next
        </Button>
      </div>
      <QuestionItem />
    </div>
  );
};
