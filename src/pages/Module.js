import { auth, db } from "../firebase/fire";
import { Link, useHistory, useParams } from "react-router-dom";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import {
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { useAuthState } from "react-firebase-hooks/auth";
import { UnAuthorized } from "./Unauthorized";
import { Loader } from "../components/Loader";
import { ArrowBack, MenuBook } from "@material-ui/icons";
import { Card } from "../components/Card";

const moduleRef = db.doc("data/modules");
const topicRef = db.doc("data/topics");

function ListItemLink(props) {
  return <ListItem button component={Link} {...props} />;
}

export function Module() {
  const location = useHistory();
  const { moduleName } = useParams();
  let [value] = useDocumentDataOnce(moduleRef);
  let [values] = useDocumentDataOnce(topicRef);

  const [user] = useAuthState(auth);
  const [userData] = useDocumentDataOnce(db.collection("users").doc(user?.uid));

  const topics = value?.modules[moduleName]?.topics ?? [];
  const permittedTopics =
    userData?.type === "student"
      ? topics
      : topics.filter(
          (topic) =>
            userData?.topicPermissions && userData?.topicPermissions[topic]
        );

  if (userData === undefined) {
    return <Loader />;
  }
  if (
    userData.modulePermissions === undefined ||
    userData.modulePermissions[moduleName] === undefined ||
    userData.modulePermissions[moduleName] === false
  ) {
    return (
      <UnAuthorized
        module={moduleName}
        isRequested={
          userData?.modulePermissions &&
          userData?.modulePermissions[moduleName] === false
        }
      />
    );
  }

  return (
    <Container maxWidth="md" style={{ marginTop: "2rem" }}>
      <h4 className="title">
        <IconButton
          style={{ margin: "1rem .8rem 1rem 0" }}
          onClick={() => location.goBack()}
        >
          <ArrowBack />
        </IconButton>
        {moduleName}
      </h4>

      <div className="row">
        {permittedTopics &&
          permittedTopics.map((topic) => (
            <ol className="articles">
                <Card
                  module={moduleName}
				  isTopic
				  topic={topic}
                  topics={Object.keys(values?.topics?.[topic] ?? {})}
                />
              </ol>
          ))}
      </div>
    </Container>
  );
}
