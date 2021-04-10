import {
	Box,
	Button,
	Container,
	MenuItem,
	TextField,
	Typography,
} from '@material-ui/core';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Loader } from '../components/Loader';
import { MathDisplay } from '../components/MathDisplay';
import { TagInput } from '../components/TagInput';
import { generateCustomTestId } from '../constants/functions';
import { generateCustomTest, getQuestionAnswer, saveQuestion } from '../firebase/api';
import { auth, db } from '../firebase/fire';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import { UnAuthorized } from './Unauthorized';

const FormField = styled(TextField)`
	margin-bottom: 1rem;
`;

const latexHelp = 'Use LaTeX inside $$...$ $';

const levelOptions = Array(5)
	.fill(0)
	.map((_val, idx) => (idx + 1).toString());
const markingOptions = Array(5)
	.fill(0)
	.map((_val, idx) => (-idx).toString());

const EditQuestion = (
	customTest = false,

) => {
	const location = useHistory();
	let { moduleName, id, topic, subtopic } = useParams();
	let { testname } = useParams();

	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
	
	

	if(topic === undefined) {
		topic = "custom_question";
		subtopic = "custom_question";
	}

	const defaultValues = {
		question: {
			text: '',
			options: [{ text: '' }],
			level: '1',
			tags: [],
			time: '',
			negativeMarking: '0',
		},
		answer: 1,
	};

	const { register, handleSubmit, control, setValue, watch } = useForm({
		defaultValues,
	});
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'question.options',
	});

	const watchText = watch('question.text');
	const watchOptions = watch('question.options', fields);

	

	useEffect(() => {
		const loadData = async () => {
			const data = await getQuestionAnswer(id);
			setValue('question', data.question);
			setValue('answer', data.answer);
		};

		if (id) {
			loadData();
		}
	}, [id, setValue]);

	const onSubmit = async data => {
		const [minutes, seconds] = data.question.time
			.split(':')
			.map(val => parseInt(val));
		const question = {
			...data.question,
			options: data.question.options.map(option => option.text).filter(option => {return option !== '' && option !== undefined}),
			level: parseInt(data.question.level),
			time: minutes * 60 + seconds ,
			topic,
			subtopic,
			type: 'mcq',
			negativeMarking: parseInt(data.question.negativeMarking),
		};
		const answer = parseInt(data.answer) - 1;

		if(customTest.customTest === true) {
			alert('Custom Answer inserted', id, topic, subtopic, testname);
			question.user = auth.currentUser.uid;
			question.testname = testname;
			question.locked = true;
			question.topic = 'custom_question';
			question[generateCustomTestId(auth.currentUser.uid, testname)] = true
			id = await saveQuestion(question, answer);
			
			await db.collection('customTests').doc(auth.currentUser.uid).update ({
				[`customTests.${testname.trim()}.questions.${id}`] : true
			})
			
			
			return;
		}
		
		question.valid = false;
		await saveQuestion(question, answer, id);
		
		window.location.reload();
		
	};

	if(userData === undefined) {
		return <Loader />
	}

	if((userData?.modulePermissions === undefined) || userData.modulePermissions[moduleName] === undefined) {
		return(
			<UnAuthorized />
		)
	}

	return (
		<Container maxWidth="sm" style={{ marginTop: '2rem' }}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Typography variant="h4" component="h2" gutterBottom>
					{id ? 'Edit' : 'Add'} Question
				</Typography>
				<Controller
					as={
						<FormField
							label="Question"
							fullWidth
							required
							multiline
							helperText={latexHelp}
						/>
					}
					name="question.text"
					control={control}
				/>

				{watchText && <MathDisplay preview math={watchText} />}

				{
					!customTest.customTest && 
				<Controller
					render={({ onChange }) => (
						<TagInput topic={topic} subtopic={subtopic} onChange={onChange} />
					)}
					name="question.tags"
					control={control}
				/>
				}
				<div style = {{ marginTop: '1rem' }}>
				<Typography variant="h5" component="h3" gutterBottom>
					Image
				</Typography>
				</div>

				<input
      			  accept="image/*"
      			  id="contained-button-file"
      			  type="file"
      			/>
				<label htmlFor="contained-button-file">
      			  <IconButton color="primary" aria-label="upload picture" component="span">
      			    <PhotoCamera />
      			  </IconButton>
      			</label>

				<Typography variant="h5" component="h3" gutterBottom>
					Options
				</Typography>
				{fields.map((item, index) => (
					<div key={item.id}>
						<Box display="flex" alignItems="baseline">
							<FormField
								name={`question.options[${index}].text`}
								label={`Option ${index + 1}`}
								inputRef={register()}
								defaultValue=""
								style={{ flex: '1' }}
								helperText={latexHelp}
							/>
							<Button onClick={() => remove(index)}>Delete</Button>
						</Box>

						{watchOptions[index].text && (
							<MathDisplay preview math={watchOptions[index].text} />
						)}
					</div>
				))}
				<Box display="flex" justifyContent="center" paddingBottom="1rem">
					<Button
						variant="contained"
						color="secondary"
						onClick={() => append({ text: '' }, true)}
						style={{ marginRight: '1rem' }}
					>
						Add option
					</Button>
				</Box>
				<Box
					display="flex"
					alignItems="baseline"
					justifyContent="space-between"
				>
					<Controller
						name="question.level"
						control={control}
						as={
							<FormField
								select
								label="Level"
								type="number"
								required
								style={{ flex: '1', marginRight: '1rem' }}
								inputRef={register}
							>
								{levelOptions.map(option => (
									<MenuItem key={option} value={option}>
										Level {option}
									</MenuItem>
								))}
							</FormField>
						}
					/>

					<FormField
						label="Correct Option"
						name="answer"
						type="number"
						required
						style={{ flex: '1', margin: '1rem' }}
						inputRef={register}
						inputMode="decimal"
						inputProps={{ min: 1, max: fields.length }}
					/>
				</Box>

				<Box display="flex" justifyContent="center">
					<FormField
						label="Estimated Time"
						name="question.time"
						type="time"
						views={["minutes", "seconds"]}
    				    format="mm:ss"
						required
						style={{ flex: '1', marginRight: '1rem' }}
						inputRef={register}
						InputLabelProps={{
        				  shrink: true,
        				}}
						
						placeholder="MM:SS"
					/>
				</Box>

				<Box display="flex" justifyContent="center">
					<Controller
						name="question.negativeMarking"
						control={control}
						as={
							<FormField
								select
								label="Negative Marking"
								type="number"
								required
								style={{ flex: '1', marginRight: '1rem' }}
								inputRef={register}
							>
								{markingOptions.map(option => (
									<MenuItem key={option} value={option}>
										{option}
									</MenuItem>
								))}
							</FormField>
						}
					/>
				</Box>


				<Box display="flex" justifyContent="center" paddingBottom="3rem">
					<Button variant="contained" color="primary" type="submit">
						Submit
					</Button>
				</Box>
			</form>
		</Container>
	);
};

export { EditQuestion };
