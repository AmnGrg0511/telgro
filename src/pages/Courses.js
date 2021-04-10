import { db } from "../firebase/fire";
import { Link, useHistory } from "react-router-dom";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import {
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  ArrowForwardIos,
  LibraryBooks,
  Notes,
  Translate,
} from "@material-ui/icons";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";

function ListItemLink(props) {
  return <ListItem button component={Link} {...props} />;
}
export function Courses({ subtopic, userData }) {
  let [courses] = useCollectionDataOnce(
    db.collection("courses").where("subtopic", "==", subtopic).limit(10),

    { idField: "id" }
  );

  const defaultValues = {
    language: userData.language ?? "हिन्दी",
  };
  let { register, control } = useForm({
    defaultValues,
  });
  const history = useHistory();
  const [language, setLanguage] = useState(userData.language ?? "हिन्दी");
  if (language) {
    courses = courses?.filter(
      (course) =>
        course.language === language ||
        (!course.language && language === "हिन्दी")
    );
  }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h4" component="h2">
          <Notes style={{ margin: ".5rem" }} />
          Courses
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

      <List component="nav">
        {courses?.map((course) => (
          <div class="courses-container">
            <div class="course">
              <div class="course-preview">
                <h6>Course</h6>
                <h2>{course.title}</h2>
                <a onClick={()=>history.push(`/course/${course.id}`)} href="">
                  View all chapters <ArrowForwardIos />
                </a>
              </div>
              <div class="course-info">
                <div class="progress-container">
                  <div class="progress"></div>
                  <span class="progress-text">6/9 Challenges</span>
                </div>
                <h6>Chapter {course?.content?.length}</h6>
                <h2>{course?.content?.[course?.content?.length -1]?.name}</h2>
                <button onClick={()=>history.push(`/course/${course.id}`)} class="btn">Continue</button>
              </div>
            </div>
          </div>
        ))}
      </List>
    </div>
  );
}
