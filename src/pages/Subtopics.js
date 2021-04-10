import { auth, db } from "../firebase/fire";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  useDocumentDataOnce,
  useCollectionDataOnce,
} from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  Badge,
  Button,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { PlainLink } from "../components/Links";
import { UnAuthorized } from "./Unauthorized";
import { Loader } from "../components/Loader";
import { ADMIN_ID } from "../constants/adminConstants";
import Add from "@material-ui/icons/Add";
import {
  AddCircle,
  ArrowBack,
  ArrowForward,
  Book,
  CheckCircle,
  QuestionAnswer,
  Send,
  VerifiedUser,
} from "@material-ui/icons";

const topicRef = db.doc("data/topics");

function ListItemLink(props) {
  return <ListItem button component={Link} {...props} />;
}

export function Subtopics() {
  const location = useHistory();
  const { moduleName, topic } = useParams();
  const [topicData] = useDocumentDataOnce(topicRef);
  const [user] = useAuthState(auth);
  const [userData] = useDocumentDataOnce(db.collection("users").doc(user?.uid));
  const subtopics = Object.keys(topicData?.topics[topic] ?? {});
  const [resources] = useCollectionDataOnce(
    db
      .collection("resources")
      .where("topic", "==", topic)
      .where("approved", "==", false)
      .limit(10),
    { idField: "id" }
  );
  const [questions] = useCollectionDataOnce(
    db
      .collection("questions")
      .where("topic", "==", topic)
      .where("valid", "==", false)
      .limit(10),
    { idField: "id" }
  );

  const reportedQuestions = questions?.filter(
    (question) => question.Reported && question.Reported.length !== 0
  );
  const c1 =
    subtopics?.map(
      (subtopic) =>
        reportedQuestions?.filter((question) => question.subtopic === subtopic)
          ?.length
    ) ?? 0;

  const reportedResources = resources?.filter(
    (resource) => resource.Reported && resource.Reported.length !== 0
  );
  const c2 =
    subtopics?.map(
      (subtopic) =>
        reportedResources?.filter((resource) => resource.subtopic === subtopic)
          ?.length
    ) ?? 0;

  const newQuestions = questions
    ?.filter((question) => question.valid === false)
    ?.filter(
      (question) => !question.Reported || question.Reported.length === 0
    );
  const c3 =
    subtopics?.map(
      (subtopic) =>
        newQuestions?.filter((question) => question.subtopic === subtopic)
          ?.length
    ) ?? 0;

  const newResources = resources?.filter(
    (resource) => resource.approved === false
  );
  const c4 =
    subtopics?.map(
      (subtopic) =>
        newResources?.filter((resource) => resource.subtopic === subtopic)
          ?.length
    ) ?? 0;

  if (userData === undefined) {
    return <Loader />;
  }

  if (
    userData?.modulePermissions === undefined ||
    userData.modulePermissions[moduleName] === undefined
  ) {
    return <UnAuthorized />;
  }

  return (
    <Container maxWidth="md" style={{ marginTop: "2rem" }}>
      <h4 className="title">
        <IconButton
          style={{ margin: "1rem .6rem 1rem 0" }}
          onClick={() => location.goBack()}
        >
          <ArrowBack />
        </IconButton>
        {topic}
      </h4>
      <div className="row">
        {subtopics &&
          subtopics.map((subtopic, idx) => (
            <div className="col-12 col-sm-6 col-md-4">
              <Link
                style={{ textDecoration: "none" }}
                to={`${topic}/${subtopic}`}
              >
                <div class="card">
                  <div class="card__side card__side--back">
                    <div class="card__cover">
                      <h4 class="card__heading">
                        <span class="card__heading-span">{subtopic}</span>
                      </h4>
                    </div>
                    <hr />
                    <div class="card__details" style={{ padding: "1rem 0" }}>
                      <ul>
                        <div>
                          {user?.uid === ADMIN_ID && (
                            <PlainLink
                              style={{ textDecoration: "none" }}
                              to={`validate-questions/${topic}/${subtopic}`}
                            >
                              <Badge
                                color="secondary"
                                badgeContent={c1[idx]}
                                overlap="rectangle"
                                style={{ margin: ".6rem 0" }}
                              >
                                <Button
                                  variant="outlined"
                                  color="secondary"
                                  size="small"
                                  style={{
                                    whiteSpace: "nowrap",
                                    transition: "all ease .3s",
                                  }}
                                  startIcon={<VerifiedUser />}
                                >
                                  Validate Questions
                                </Button>
                              </Badge>
                            </PlainLink>
                          )}
                          {user?.uid === ADMIN_ID && (
                            <>
                              <PlainLink
                                style={{ textDecoration: "none" }}
                                to={`validate-resources/${topic}/${subtopic}`}
                              >
                                <Badge
                                  color="secondary"
                                  badgeContent={c2[idx]}
                                  overlap="rectangle"
                                  style={{ margin: ".6rem 0" }}
                                >
                                  <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    style={{
                                      whiteSpace: "nowrap",
                                      transition: "all ease .3s",
                                    }}
                                    startIcon={<VerifiedUser />}
                                  >
                                    Validate Resources
                                  </Button>
                                </Badge>
                              </PlainLink>
                            </>
                          )}
                          {userData?.type === "moderator" && (
                            <>
                              <PlainLink
                                style={{ textDecoration: "none" }}
                                to={`verify-questions/${topic}/${subtopic}`}
                              >
                                <Badge
                                  color="secondary"
                                  badgeContent={c3[idx]}
                                  overlap="rectangle"
                                  style={{ margin: ".6rem 0" }}
                                >
                                  <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    style={{
                                      whiteSpace: "nowrap",
                                      transition: "all ease .3s",
                                    }}
                                    startIcon={<CheckCircle />}
                                  >
                                    Verify Questions
                                  </Button>
                                </Badge>
                              </PlainLink>
                            </>
                          )}
                          {userData?.type === "moderator" && (
                            <>
                              <PlainLink
                                style={{ textDecoration: "none" }}
                                to={`add-question/${topic}/${subtopic}`}
                              >
                                <Badge
                                  color="secondary"
                                  badgeContent={0}
                                  overlap="rectangle"
                                  style={{ margin: ".6rem 0" }}
                                >
                                  <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    style={{
                                      whiteSpace: "nowrap",
                                      transition: "all ease .3s",
                                    }}
                                    startIcon={<Add />}
                                  >
                                    Add Questions
                                  </Button>
                                </Badge>
                              </PlainLink>
                            </>
                          )}
                          <PlainLink
                            style={{ textDecoration: "none" }}
                            to={`add-resources/${topic}/${subtopic}`}
                          >
                            <Badge
                              color="secondary"
                              badgeContent={
                                userData?.type === "student" ? 0 : c4[idx]
                              }
                              overlap="rectangle"
                              style={{ margin: ".6rem 0" }}
                            >
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                style={{
                                  whiteSpace: "nowrap",
                                  transition: "all ease .3s",
                                }}
                                startIcon={<AddCircle />}
                              >
                                Add Resources
                              </Button>
                            </Badge>
                          </PlainLink>
                          {userData && (
                            <Link
                              to={`/discuss/${subtopic}`}
                              style={{
                                color: "currentcolor",
                                textDecoration: "none",
                              }}
                            >
                              <Badge
                                color="secondary"
                                badgeContent={0}
                                overlap="rectangle"
                                style={{ margin: ".6rem 0" }}
                              >
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  style={{
                                    whiteSpace: "nowrap",
                                    transition: "all ease .3s",
                                  }}
                                  startIcon={<QuestionAnswer />}
                                >
                                  See Discussion
                                </Button>
                              </Badge>
                            </Link>
                          )}
                          {user?.uid !== ADMIN_ID && (
                            <PlainLink
                              style={{ textDecoration: "none" }}
                              to={`${topic}/${subtopic}`}
                            >
                              <Badge
                                color="secondary"
                                badgeContent={0}
                                overlap="rectangle"
                                style={{ margin: ".6rem 0" }}
                              >
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="large"
                                  style={{
                                    whiteSpace: "nowrap",
                                    transition: "all ease .3s",
                                  }}
                                  endIcon={<ArrowForward />}
                                >
                                  Explore
                                </Button>
                              </Badge>
                            </PlainLink>
                          )}
                        </div>
                      </ul>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </Container>
  );
}
