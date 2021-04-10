import { Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions  } from '@material-ui/core';
import { PlainLink } from './Links';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { Question } from './Question';
import { db } from '../firebase/fire';
import { useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { ArrowBack, Delete, Edit } from '@material-ui/icons';

export const ValidateQuestions = () => {
	const location = useHistory()	
	const {module, topic, subtopic} = useParams();
	const [showDeleteDialogBox, setShowDeleteDialogBox] = useState(false);
	const [questionId, setQuestionId] = useState('');

	let [questions] = useCollectionDataOnce( 
		db.collection('questions')
			.where('topic', '==', topic)
			.where('subtopic', '==', subtopic)
			.where('valid', '==', false)
			.limit(10)
		, { idField: 'id' });
	if(questions){
		questions = questions.filter(question => question.Reported && question.Reported.length !== 0);
	}

	const handleClose = () => {
		setShowDeleteDialogBox(false);
	};

	const handleDeleteQuestion = async (id) => {
		await db.collection('questions').doc(id).delete();
		
		handleClose();
	};


	const DialogBox = () => (
		<Dialog
			open={showDeleteDialogBox}
			onClose={handleClose}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{`Are you sure you want to delete this question`}</DialogTitle>
			<DialogContent>
			<DialogContentText id="alert-dialog-description">
				You will no longer be able to access this question.
				Please verify.
			</DialogContentText>
			</DialogContent>
			<DialogActions>
			<Button onClick={handleClose} color="primary">
				Close
			</Button>
			<Button onClick={() => handleDeleteQuestion(questionId)} color="primary" autoFocus>
				OKAY, Delete
			</Button>
			</DialogActions>
		</Dialog>
	)
	
	return (
		<Container maxWidth="sm" style={{ marginTop: '2rem' }}>
			<Typography variant="h4" component="h2">
				<ArrowBack style={{margin:'1rem .8rem 1rem 0'}} onClick={()=>(location.goBack())}/>Reported Questions
			</Typography>
			{questions &&
				questions.map(que => (
					<div key={que.id}>
						<Question  
						style={{ marginTop: '1rem' }} 
						question={que} 
						verifyButton={false} 
						questionId={que.id}/>
						<PlainLink to={`/module/${module}/edit-question/${que.topic}/${que.subtopic}/${que.id}`} style={{textDecoration: 'none'}}>
							<Button
								variant="outlined"
								color="secondary"
								style={{marginTop:'.2rem'}}
								startIcon={<Edit/>}
							>
								Edit Question
							</Button>
						</PlainLink>
						<Button
							variant="contained"
							color="secondary"
							style={{marginTop:'.2rem', marginLeft:'.4rem'}}
							startIcon={<Delete/>}
							onClick={() => { 
										setQuestionId(que.id);
									 	setShowDeleteDialogBox(true) 
									}}
						>
							Remove Question
						</Button>
					</div>
				))}
				<DialogBox />
			
		</Container>
	);
};