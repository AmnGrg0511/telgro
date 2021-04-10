import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import {
	TextField,
	MenuItem,
	Typography,
	InputAdornment,
} from '@material-ui/core';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../firebase/fire';
import './QuizResult.css';
import { Question } from './Question';
import { Controller, useForm } from 'react-hook-form';
import { Assignment, Translate } from '@material-ui/icons';
import { useAuthState } from 'react-firebase-hooks/auth';

export const QuestionList = ({
	verifyQuestions = false,
	tags,
	report = false,
	userData
}) => {
	const { topic, subtopic } = useParams();
	const [user] = useAuthState(auth);
	let [questions] = useCollectionDataOnce(
		db
			.collection('questions')
			.where('topic', '==', topic)
			.where('subtopic', '==', subtopic)
			.where('valid', '==', !verifyQuestions)
			.limit(10),

		{ idField: 'id' },
	);
	let [answers] = useCollectionDataOnce(
		db
			.collection('answers'),

		{ idField: 'id' },
	);
	
	questions = questions?.filter(question => !question.Reported);
	const [language, setLanguage] = useState(userData?.language ?? 'हिन्दी');
	if(tags !== undefined && tags?.length > 0){
		questions = questions?.filter(question => question.tags.some(item => tags.includes(item)));
	}
	const defaultValues = {
		language:userData?.language ?? 'हिन्दी'
	};

	let { register, control } = useForm({
		defaultValues,
	});	

	if(language){
		questions = questions?.filter(question => question.language === language || (!question.language && language === 'हिन्दी'));
	}
	const questionIds = questions?.map(question=>question.id);
	const reqAnswers = answers?.filter(answer=>(questionIds?.includes(answer.id)));
	reqAnswers?.sort((a,b)=>questionIds?.indexOf(a.id)-questionIds?.indexOf(b.id));
	return (
		<div className='noPrint'>
			<div style={{display:'flex', alignItems:'center'}}>
				<Typography variant="h4" component="h2">
					<Assignment style={{margin:'.5rem'}}/>Questions
				</Typography>

				<Controller
					name="language"
					control={control}
					as={
						<TextField
							select
							style={{ width:'10rem', margin: '1rem', marginLeft:'auto' }}
							inputRef={register}
							InputProps={{
								startAdornment: (
								  <InputAdornment position="start">
									<Translate />
								  </InputAdornment>
								),
							  }}
							onClick={(e)=>{
								e.target.value && setLanguage(e.target.value);}}
						>
							{['हिन्दी', 'English'].map(option => (
								<MenuItem key={option} value={option}>
									{option}
								</MenuItem>
							))}
						</TextField>
					}
				/>
			</div>

			<div
				style={{
					height: '100%',
					overflow: 'scroll',
					overflowX: 'hidden',
					maxHeight: '78vh',
					flex: 1,
				}}
			>
				

				{questions && reqAnswers &&
					questions.map((que,idx) => (
						<Question userId={user.uid} value={verifyQuestions? (reqAnswers[idx]?.answer?.toString()) :''} key={que.id} style={{ marginTop: '1rem' }} question={que} verifyButton={verifyQuestions} questionId={que.id} reportButton={report}/>
						
					))}
			</div>
		</div>

);
};
