import {
	Button,
	Drawer,
	List,
	ListItem,
	ListItemText,
	makeStyles,
	Toolbar,
	Typography,
} from '@material-ui/core';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generateCustomTest } from '../firebase/api';
import { Center } from './Center';
import { Loader } from './Loader';
import { Question } from './Question';
import { Time } from './Time';
import { evaluateTest } from '../firebase/api';
import { QuizResult } from './QuizResult';
import { auth, db } from '../firebase/fire';
import { useAuthState } from 'react-firebase-hooks/auth';
const drawerWidth = 270;

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
	},
	drawerContainer: {
		overflow: 'auto',
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3),
	},
}));

function CustomQuiz() {

	
	const classes = useStyles();
	const { testId} = useParams();

    const [user] = useAuthState(auth);

	const interval = useRef();
	const totalTimeRef = useRef();
    const {topic, subtopic} = {topic: 'some', subtopic: 'wat'}
	const [questions, setQuestions] = useState([]);
	const [answers, setAnswers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [queIndex, setQueIndex] = useState(0);
	const [remainingTime, setRemainingTime] = useState(null);
	const [started, setStarted] = useState(false);
	const [result, setResult] = useState(null);

	const [customTest, setCustomTest] = useState(null);

	const setAnswer = (ans, index) => {
		setAnswers(prev => [
			...prev.slice(0, index),
			ans,
			...prev.slice(index + 1),
		]);
	};

	useEffect(() => {
		const loadQuestions = async () => {
            
			let questions = await generateCustomTest({ testId: testId });
			let customTest = await db.collection('customTests').doc(testId).get();

			setCustomTest(customTest);
            questions = questions.map(que => ({ ...que, time: que.time ?? 60 }));

            totalTimeRef.current = questions.reduce((sum, que) => sum + que.time, 0);

			

			if(customTest.data().isScheduled) {
				totalTimeRef.current = Math.floor((customTest.data().endTime - customTest.data().startTime));
			}

            let session = await db.collection('sessions').doc(user.uid).get();
            
            if(session === undefined || session.data() === undefined) {
                
                await db.collection('sessions').doc(user.uid).set({
                    'sessions': {
                        [testId] : {
                            responses: Array(questions.length).fill(''),
                            remainingTime :  totalTimeRef.current
                        }
                    }
                })
            } else if(session.data()['sessions'][testId] === undefined) {
                await db.collection('sessions').doc(user.uid).update({
                    [`sessions.${testId}.responses`] : Array(questions.length).fill(''),
                    [`sessions.${testId}.remainingTime`] : totalTimeRef.current
                })
            }
            
            session = await db.collection('sessions').doc(user.uid).get();
            setAnswers(session.data()['sessions'][testId]['responses']);
            setRemainingTime(session.data()['sessions'][testId]['remainingTime']);

			

			// 
			// setRemainingTime(totalTimeRef.current);

            setQuestions(questions);
        
			
			setLoading(false);
		};
		loadQuestions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [topic, subtopic]);

	const onSubmit = async () => {
		clearInterval(interval.current);
		const timeUsed = totalTimeRef.current - remainingTime;
		setRemainingTime(0);
		const result = await evaluateTest(questions, answers, timeUsed);
		setResult(result);
	};

	const startQuiz = () => {

		if(customTest === null)
			return;

		if(customTest.isScheduled && (new Date() < customTest.startTime.toDate())) {

			alert("This test is not started");
			return;
		}

		if(customTest.isScheduled && (new Date() > customTest.endTime.toDate())) {
			alert("This test is ended");
			return;
		}

		interval.current = setInterval(async () => {
			if (remainingTime <= 0) {
				onSubmit();
				return;
            }
            setRemainingTime(prev => Math.max(prev - 1, 0));
            
		}, 1000);
		setStarted(true);
	};

	if (loading) {
		return <Loader />;
	}

	

    if(remainingTime%5 === 0) {
        db.collection('sessions').doc(user.uid).update({
            [`sessions.${testId}.responses`] : answers,
            [`sessions.${testId}.remainingTime`] : remainingTime
        })
    }

	if (!started) {
		return (
			<Center>
				<div
					style={{ display: 'flex', flexDirection: 'column', fontSize: '16px' }}
				>
					<ol>
						<li>
							The test topic is {topic} / {subtopic}.
						</li>
						<li>There are total {questions.length} questions.</li>
						<li>
							Duration is <Time seconds={remainingTime} />.
						</li>
					</ol>

					<div style={{ height: '1rem' }} />

					<Button variant="contained" color="primary" onClick={startQuiz}>
						Start
					</Button>
				</div>
			</Center>
		);
	}

	if (remainingTime <= 0) {
		if (result) return <QuizResult {...result} />;
		else return <Center>Loading result...</Center>;
	}

	return (
		<div style={{ height: '100%', display: 'flex' }}>
			<Drawer
				variant="permanent"
				className={classes.drawer}
				classes={{ paper: classes.drawerPaper }}
			>
				<Toolbar />
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
									primary={`Question ${index + 1}${answers[index] && ' ✔'}`}
								/>
							</ListItem>
						))}
					</List>
				</div>
			</Drawer>

			<div className={classes.content}>
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<div>
						{topic}/{subtopic}
					</div>
					<Typography variant={'h5'} component="div">
						<Time seconds={remainingTime} />
					</Typography>
				</div>
				<br />
				<Typography variant="h4" component="h3">
					Question {queIndex + 1}
				</Typography>
				<Question
					question={questions[queIndex]}
					onChange={ans => setAnswer(ans, queIndex)}
					ansValue={answers[queIndex]}
				/>

				<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<Button
						variant="outlined"
						color="secondary"
						style={{ margin: '1rem' }}
						onClick={() => setQueIndex(prev => Math.max(0, prev - 1))}
						disabled={queIndex === 0}
					>
						Prev
					</Button>

					<Button
						variant="outlined"
						color="secondary"
						style={{ margin: '1rem' }}
						onClick={() =>
							setQueIndex(prev => Math.min(questions.length - 1, prev + 1))
						}
						disabled={queIndex === questions.length - 1}
					>
						Next
					</Button>

					<Button
						variant="contained"
						color="primary"
						style={{ margin: '1rem' }}
						onClick={onSubmit}
					>
						End Test
					</Button>
				</div>
			</div>
		</div>
	);
}
export default CustomQuiz;
