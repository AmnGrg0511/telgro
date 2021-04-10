import { db, auth } from "../firebase/fire";
import { Link, useHistory } from "react-router-dom";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import {
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Typography,
  Paper,
  IconButton,
} from "@material-ui/core";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  Add,
  ArrowBack,
  Clear,
  LibraryBooks,
  Notes,
  PlaylistAdd,
  Send,
} from "@material-ui/icons";
import { useState } from "react";
import { Loader } from "../components/Loader";
import { Card } from "../components/Card";

const moduleRef = db.doc("data/modules");

function ListItemLink(props) {
  return <ListItem button component={Link} {...props} />;
}
export function ModuleList({ addModule = false }) {
  const [value] = useDocumentDataOnce(moduleRef);

  let modules = Object.keys(value?.modules ?? {});
  const [user] = useAuthState(auth);
  const [userData] = useDocumentDataOnce(db.collection("users").doc(user?.uid));
  const [hover, setHover] = useState(false);
  const location = useHistory();

  if (userData === undefined) {
    return <Loader />;
  }

  let unauthorizedModules = modules;
  if (userData?.modulePermissions) {
    unauthorizedModules = modules.filter(
      (module) => !userData?.modulePermissions[module]
    );
    modules = modules.filter((module) => userData?.modulePermissions[module]);
  } else {
    modules = [];
  }

  const ModuleItem = ({ module }) => {
    const [disabled, setDisabled] = useState(
      userData?.modulePermissions &&
        userData.modulePermissions[module] === false
    );
    const handleClick = async () => {
      await db
        .collection("users")
        .doc(user?.uid)
        .update({
          [`modulePermissions.${module}`]: false,
        });
      alert("Your request of " + module + " module has been sent successfully");
      setDisabled(true);
    };
    return (
      <ol className="articles">
        <Card
          module={module}
          topics={value?.modules?.[module]?.topics}
          handleClick={handleClick}
          disabled={disabled}
        />
      </ol>
    );
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "2rem" }}>
      <h4 component="h2" className="title">
        <IconButton onClick={()=>location.goBack()} style={{ margin: "1rem .8rem 1rem 0" }}>
          <ArrowBack />
        </IconButton>
        Modules
      </h4>

      <div className="row">
        {addModule
          ? unauthorizedModules?.map((module) => <ModuleItem module={module} />)
          : modules?.map((module) => (
              <ol className="articles">
                <Card
                  module={module}
                  topics={value?.modules?.[module]?.topics}
                />
              </ol>
            ))}
      </div>

      {userData && (
        <Container
          maxWidth="md"
          style={{ marginTop: "1rem", position: "relative" }}
        >
          <a
            onClick={() =>
              !addModule ? location.push(`add-modules`) : location.goBack()
            }
            class="btns"
            target="_blank"
          >
            {!addModule ? (
              <Add style={{ marginBottom: "4px" }} />
            ) : (
              <ArrowBack style={{ marginBottom: "4px" }} />
            )}
            <span> Module</span>
          </a>
        </Container>
      )}
    </Container>
  );
}
