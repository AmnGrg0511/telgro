import { useState } from "react";
import {
  MenuItem,
  List,
  TextField,
  Typography,
  InputAdornment,
} from "@material-ui/core";
import {
  useCollectionDataOnce,
  useDocumentDataOnce,
} from "react-firebase-hooks/firestore";
import { db } from "../firebase/fire";
import { useParams } from "react-router-dom";
import { Resource } from "./Resource";
import { Controller, useForm } from "react-hook-form";
import { EventNote, Translate } from "@material-ui/icons";

const topicRef = db.doc("data/topics");

export const DisplayResources = ({
  topicPassed,
  subtopicPassed,
  tags,
  userData,
}) => {
  const { topic, subtopic } = useParams();
  let [resources] = useCollectionDataOnce(
    db
      .collection("resources")
      .where("topic", "==", topicPassed ?? topic)
      .where("subtopic", "==", subtopicPassed ?? subtopic)
      .where("approved", "==", true)
      .limit(10),
    { idField: "id" }
  );
  const [language, setLanguage] = useState(userData.language ?? "हिन्दी");
  if (tags !== undefined && tags?.length > 0) {
    resources = resources?.filter((resource) =>
      resource.tags.some((item) => tags.includes(item))
    );
  }

  const defaultValues = {
    language: userData.language ?? "हिन्दी",
  };

  let { register, control } = useForm({
    defaultValues,
  });

  if (language) {
    resources = resources?.filter(
      (resource) =>
        resource.language === language ||
        (!resource.language && language === "हिन्दी")
    );
  }

  const [value] = useDocumentDataOnce(topicRef);
  if (value) {
    resources?.sort(
      (resource1, resource2) =>
        value.topics[topicPassed ?? topic][subtopicPassed ?? subtopic].indexOf(
          resource1.tags[0]
        ) -
        value.topics[topicPassed ?? topic][subtopicPassed ?? subtopic].indexOf(
          resource2.tags[0]
        )
    );
  }

  return (
    <div style={{ marginRight: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h4" component="h2">
          <EventNote style={{ margin: ".5rem" }} />
          Resources
        </Typography>

        <Controller
          name="language"
          control={control}
          as={
            <TextField
              select
              style={{ width: "10rem", margin: "1rem", marginLeft: "auto" }}
              inputRef={register}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Translate />
                  </InputAdornment>
                ),
              }}
              onClick={(e) => {
                e.target.value && setLanguage(e.target.value);
              }}
            >
              {["हिन्दी", "English"].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          }
        />
      </div>

      <Typography variant="h6" component="h4" gutterBottom align="right">
        Your Rating &nbsp;
      </Typography>

      <div
        style={{
          height: "100%",
          flex: 1,
        }}
      >
        <List component="nav">
          {resources && resources.map((res) => <Resource res={res} />)}
        </List>
      </div>
    </div>
  );
};
