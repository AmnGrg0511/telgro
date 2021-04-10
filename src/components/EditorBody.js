import React from "react";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/mode-kotlin";
import "ace-builds/src-noconflict/mode-swift";

import {
  Button,
  TextField,
  Select,
  MenuItem,
  makeStyles,
  createStyles,
  Backdrop,
  CircularProgress,
  LinearProgress,
  Theme
} from "@material-ui/core";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import { ThemeProvider } from "@material-ui/styles";

import firebase from "../firebase/fire";
import axios from "axios";
import { createMuiTheme } from "@material-ui/core";
import { DoneAll } from "@material-ui/icons";

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
    body: {
      display: "grid",
      gridGap: "0 20px",
      gridTemplateRows: "calc(100% - 200px) 200px",
      // "& .ace_selection": {
      //   background: "#ff711e36 !important"
      // },
      resize:'both',
      "& .ace_gutter": {
        backgroundColor: "#19202b"
      },
      "& .ace_editor": {
        backgroundColor: "#19202b",
        fontFamily: 'monospace'
      },
      "& .ace_support.ace_function": {
        color: "#2196F3"
      },
      [theme.breakpoints.up("sm")]: {
        gridTemplateRows: "unset",
        gridTemplateColumns: "calc(100% - 350px) 330px"
      }
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: "#fff"
    },
    editor: {
      height: "100% !important",
      width: "100% !important",
      borderBottom: "2px solid #2196F3",
      "& *": {
        fontFamily: "monospace"
      },
      [theme.breakpoints.up("sm")]: {
        borderBottom: "none",
        borderRight: "2px solid #2196F3"
      }
    },
    output: {
      display: "grid",
      gridTemplateRows: "auto 1fr auto"
    },
    selectlang: {
      margin: "2px 7px",
      height: "32px"
    },
    runPanel: {
      textAlign: "left !important"
    },
    runBtn: {
      marginRight: 10,
      marginLeft: '10px',
      [theme.breakpoints.up("sm")]: {
        marginLeft: 0,
      }
    },
    submitBtn: {
      marginLeft: 10,
      color: 'white',
      backgroundColor: 'green'
    },
    inputModal: {
      height: "fit-content",
      width: "90%",
      maxHeight: 500,
      maxWidth: 400,
      background: "#19202b",
      borderRadius: "5px",
      padding: 15,
      textAlign: "left",
      "& text": {
        display: "block",
        color: "#2196F3",
        fontSize: "20px"
      },
      "& smallertext": {
        display: "block",
        fontSize: "14px"
      }
    },
    modalInput: {
      width: "100%",
      marginTop: "10px"
    },
    runBtnOnModal: {
      marginTop: "20px"
    },
    buttonProgress: {
      color: "white",
      margin: "auto"
    },
    outputTitle: {
      color: "#2196F3",
      margin: "7px 0",
      padding: '10px',
      textAlign: "left !important",
      [theme.breakpoints.up("sm")]: {
        padding: 0,
      }
    },
    outputTerminal: {
      textAlign: "left",
      color: "white",
      overflow: "auto",
      whiteSpace: "pre-line",
      fontFamily: "monospace",
      fontSize: "17px",
      padding: '10px',
      [theme.breakpoints.up("sm")]: {
        padding: 0,
      }
    }
  })
);

function EditorBody({ storeAt, index, testInput, testOutput }) {
  const classes = useStyles();
  const [codeFontSize, setCodeFontSize] = React.useState(20),
    [showLoader, setShowLoader] = React.useState(true),
    [lang, selectlang] = React.useState("py"),
    [editorLanguage, setEditorLanguage] = React.useState("c_cpp"),
    [code, setCode] = React.useState(``),
    [outputValue, setOutputValue] = React.useState(""),
    [submit, setSubmit] = React.useState(false),
    [takeInput, setTakeInput] = React.useState(false),
    [executing, setExecuting] = React.useState(false),
    [input, setInput] = React.useState("");

  let notOwner = true;

  function setNotOwner(bool) {
    notOwner = bool;
  }

  if (
    localStorage.getItem("codex-codes") &&
    JSON.parse(localStorage.getItem("codex-codes"))[index].key ===
    storeAt.substring(storeAt.indexOf("/") + 1)
  )
    setNotOwner(false);
  window.addEventListener("resize", (e) => {
    if (window.innerWidth > 600) {
      setCodeFontSize(20);
    } else {
      setCodeFontSize(14);
    }
  });

  React.useEffect(() => {
    if (window.innerWidth > 600) setCodeFontSize(20);
    else setCodeFontSize(14);

    // firebase
    //   .database()
    //   .ref(storeAt)
    //   .once("value")
    //   .then((snap) => {
    //     setShowLoader(false);
    //     selectlang(snap.val().language);
    //     setCode(snap.val().code);
    //   });
  }, []);

  React.useEffect(() => {
    if (lang !== "") {
      let langArray = {
        cpp: "c_cpp",
        java: "java",
        c: "c_cpp",
        cs: "csharp",
        rb: "ruby",
        py: "python",
        kt: "kotlin",
        swift: "swift"
      };
      console.log(langArray[lang]);
      setEditorLanguage(langArray[lang]);
    }
    if (lang !== "" && !notOwner) {
      firebase
        .database()
        .ref(storeAt + "/language")
        .set(lang);
      if (localStorage.getItem("codex-codes")) {
        let classNames = JSON.parse(localStorage.getItem("codex-codes"));
        classNames[index].lang = lang;
        localStorage.setItem("codex-codes", JSON.stringify(classNames));
      }
    }
  }, [lang]);

  React.useEffect(() => {
    if (code.trim() !== "" && !notOwner) {
      firebase
        .database()
        .ref(storeAt + "/code")
        .set(code);
    }
  }, [code]);

  const createExecutionRequest = (isSubmit) => {
    setTakeInput(false);
    setSubmit(false);
    setExecuting(true);
    var data = {
        code: code,
        language: lang,
        input: isSubmit ? testInput?.split(' ')?.join('\n') : input.split(' ').join('\n')
      };
  
      var config = {
        method: "post",
        url:
          "/.netlify/functions/enforceCode/",
        headers: {
          "Content-Type": "application/json",          
        },
        data: data
      };
      console.log(config);
  
      axios(config)
        .then(function (response) {
          console.log(response);
          setExecuting(false);
          isSubmit ? (testOutput === response.data.output ? setOutputValue("Success! You got it right, try next problem") : setOutputValue("test cases failed, try again!")) : setOutputValue(response.data.output);
        })
        .catch(function (error) {
          setExecuting(false);
          setOutputValue("Network Error");
        });
  };

  function SelectLanguage() {
    return (
      <Select
        labelId="demo-simple-select-filled-label"
        id="demo-simple-select-filled"
        value={lang}
        onChange={(e) => {
          selectlang(e.target.value);
        }}
        variant="outlined"
        className={classes.selectlang}
        disabled={executing}
      >
        <MenuItem value={"cpp"}>C++</MenuItem>
        <MenuItem value={"c"}>C</MenuItem>
        <MenuItem value={"cs"}>C#</MenuItem>
        <MenuItem value={"java"}>Java</MenuItem>
        <MenuItem value={"py"}>Python3</MenuItem>
        <MenuItem value={"rb"}>Ruby</MenuItem>
        <MenuItem value={"kt"}>Kotlin</MenuItem>
        <MenuItem value={"swift"}>Swift</MenuItem>
      </Select>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      {/* <Backdrop
        className={classes.backdrop}
        open={showLoader}
        onClick={() => {
          setShowLoader(false);
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop> */}
      <Backdrop
        className={classes.backdrop}
        open={takeInput}
        onClick={() => {
          setTakeInput(false);
          setExecuting(false);
        }}
      >
        <div
          className={classes.inputModal}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <text>Input</text>
          <smallertext>
            If your code requires an input, please type it down below otherwise
            leave it empty. For multiple inputs, type in all your inputs line by
            line.
          </smallertext>
          <TextField
            id="outlined-basic"
            label="STD Input"
            variant="filled"
            className={classes.modalInput}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            spellCheck={false}
            rowsMax={7}
            multiline
          />
          <Button
            variant="contained"
            color="primary"
            className={classes.runBtnOnModal}
            startIcon={<PlayArrowRoundedIcon />}
            onClick={()=>createExecutionRequest(false)}
          >
            Run
          </Button>
        </div>
      </Backdrop>
      <Backdrop
        className={classes.backdrop}
        open={submit}
        onClick={() => {
          setSubmit(false);
          setExecuting(false);
        }}
      >
        <div
          className={classes.inputModal}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <text>Submit</text>
          <smallertext style={{margin: '.5rem .2rem 1rem'}}>
            If your sample test cases are running it does not mean it will pass all the test cases.
            Please ensure that your code covers all the edge cases.
            Click submit to submit your code. 
          </smallertext>
          <Button
            variant="contained"
            color="primary"
            className={classes.submitBtnOnModal}
            startIcon={<PlayArrowRoundedIcon />}
            onClick={()=>createExecutionRequest(true)}
          >
            Submit
          </Button>
        </div>
      </Backdrop>
      <div className={classes.body}>
        <AceEditor
          mode={editorLanguage}
          theme="dracula"
          onChange={(e) => {
            setCode(e);
          }}
          name="UNIQUE_ID_OF_DIV"
          setOptions={{
            showPrintMargin: false,
            fontSize: codeFontSize
          }}
          value={code}
          className={classes.editor}
          editorProps={{
              $blockScrolling: true
          }}
        />
        <div className={classes.output}>
          <div className={classes.outputTitle}>Output</div>
          <div className={classes.outputTerminal}>{`${outputValue}`}</div>
          <div className={classes.runPanel}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              className={classes.runBtn}
              startIcon={<PlayArrowRoundedIcon />}
              onClick={() => {
                setTakeInput(true);
              }}
              disabled={executing}
            >
              Run
            </Button>
            <SelectLanguage />
            <Button
              size="small"
              variant="contained"
              className={classes.submitBtn}
              style={{backgroundColor: 'green'}}
              startIcon={<DoneAll />}
              onClick={() => {
                setSubmit(true);
              }}
              disabled={executing}
            >
              submit
            </Button>
            {executing && (
              <LinearProgress size={14} className={classes.buttonProgress} />
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default EditorBody;