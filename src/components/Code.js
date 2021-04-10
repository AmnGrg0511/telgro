import React from "react";
import { useHistory } from "react-router-dom";
import { Resizable, ResizableBox } from 'react-resizable';
import { makeStyles, createStyles, Theme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";

import EditorBody from "./EditorBody";

import firebase from "../firebase/fire";
import { createMuiTheme } from "@material-ui/core";

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#2196F3"
    },
    typography: {
      fontFamily: '"Poppins", sans-serif',
      color: "white"
    },
    text: {
      primary: "#fff",
      hint: "#fff"
    },
    background: {
      paper: "#19202b"
    }
  }
});

const useStyles = makeStyles((theme) =>
  createStyles({
    editorPage: {
      minHeight: '350px',
      minWidth: '200px',
      display: "grid",
      gridGap: "14px",
      gridTemplateRows: "auto 1fr"
    },
    brandingLogo: {
      cursor: "pointer"
    },
    header: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      "& > *": {
        margin: "auto 0"
      }
    },
    codeTitle: {
      color: "#2196F3",
      backgroundColor: "transparent",
      border: "none",
      outline: "none",
      textAlign: "center",
      height: "100%",
      width: "100%"
    },
    body: {
      height: "100%",
      width: "100%",
      display: "grid",
      gridTemplateRows: "70% 30%"
    }
  })
);

export function Code(props) {
  const classes = useStyles();
  const history = useHistory();
  const [className, setClassName] = React.useState(""),
    [notOwner, setNotOwner] = React.useState(false);

  // let notOwner = true;

  // function setNotOwner(bool) {
  //   notOwner = bool;
  // }

//   React.useEffect(() => {
//     firebase
//       .database()
//       .ref("CodeX/" + props.match.params.editorID + "/className")
//       .once("value")
//       .then((snap) => {
//         setClassName(snap.val());
//       });
//     if (
//       localStorage.getItem("codex-codes") &&
//       JSON.parse(localStorage.getItem("codex-codes"))[
//         props.match.params.editorIndex
//       ].key === props.match.params.editorID
//     )
//       setNotOwner(true);
//   }, []);

  React.useEffect(() => {
    if (className.trim() !== "" && notOwner) {
    //   firebase
    //     .database()
    //     .ref("CodeX/" + props.match.params.editorID + "/className")
    //     .set(className);

      console.log(localStorage.getItem("codex-codes"));
      if (localStorage.getItem("codex-codes")) {
        let classNames = JSON.parse(localStorage.getItem("codex-codes"));
        localStorage.setItem("codex-codes", JSON.stringify(classNames));
      }
    }
  }, [className]);

  return (
    <ThemeProvider theme={darkTheme}>
      <ResizableBox className={classes.editorPage} style={{backgroundColor: "#19202b"}}>
        <div className={classes.header}>
          <input
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
            }}
            className={classes.codeTitle}
            spellCheck={false}
          />
        </div>
        <EditorBody
        />
      </ResizableBox>
    </ThemeProvider>
  );
}
