import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Typography, MenuItem, TextField, Button, Box,} from '@material-ui/core';
import {  db, FieldValue } from '../firebase/fire';
import { useHistory } from 'react-router-dom';
import { useDocumentDataOnce, useCollectionData, useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { AllQuestionsList } from './AllQuestionsList';
import { Question } from './Question';
import { Loader } from './Loader';
import { useEffect, useState } from 'react';
import { TagInput } from '../components/TagInput';
import { Autocomplete } from '@material-ui/lab';
const FormField = styled(TextField)`
	margin-bottom: 1rem;
`;

const topicRef = db.doc('data/topics');
const Layout = styled.div`
	/* display: grid;
	grid-template-columns: 1fr 1fr; */
	display: flex;
	align-items: stretch;
`;

export const MyCustomTest = () => {
	const location = useHistory();
	const { testId } = useParams();
	
	const [value] = useDocumentDataOnce(topicRef);
	
	const [customTests] = useCollectionDataOnce(db.collection('customTests').limit(10), {idField: 'id'});
	
	const [loading, setLoading] = useState(false);
	const [activated, setActivated] = useState(false);

	const [formData, setFormData] = useState({
		tag: '',
		topic: '',
		subtopic: '',
	});
	const [subtopics, setSubtopics] = useState([]);
	const [type, setType] = useState('mcq');
	const [typeOfMcq, setTypeOfMcq] = useState('Single Correct');
	const [language, setLanguage] = useState('हिन्दी');

	const setData = current => {
		setFormData(prev => ({ ...prev, ...current }));
	};
	let topics = [];

	useEffect(() => {
		setSubtopics(Object.keys(value?.topics[formData.topic] ?? {}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formData.topic]);


	let customTest = undefined;

	if(customTests !== undefined) {
		customTest = customTests.filter(ct => ct.id === testId)[0]
		if(!activated && customTest.activated)
		{

			setActivated(true);
		}
	}

	const [moduleValue] = useDocumentDataOnce(db.collection('data').doc('modules'));
	
	if(customTest){
		topics=moduleValue?.modules[customTest.module]?.topics ?? [];
	}
	// // const [value, loading, error] = useDocumentData(db.collection('customTests').doc(user.uid))

	// // const testhash = generateCustomTestId(user.uid, testname);
	
	const [questions] = useCollectionData(
		db
			.collection('questions')
			.where(`${testId}`, '==', true)
			.limit(10),
		{ idField: 'id' },
	);

	const [tags, setTags] = useState([]);
	
	
	if(loading) {
		return <Loader />
	}
		

	return (

		<div>
	
			<Layout>

			<form
				style={{
					padding: '1rem',
					maxWidth: '50%',
					minWidth: '50%',
				}}
			>
				<Autocomplete
					options={topics}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Topic" />}
					value={formData.topic}
					onChange={(_, val) => setData({ topic: val })}
				/>

				<Autocomplete
					style={{margin:'1.5rem'}}
					options={subtopics}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Sub Topic" />}
					value={formData.subtopic}
					onChange={(_, val) => setData({ subtopic: val })}
				/>

				<Box
					display="flex"
					alignItems="baseline"
					justifyContent="center"
					paddingBottom="1rem"
				>
					<TagInput
						topic={formData.topic}
						subtopic={formData.subtopic}
						value={tags}
						onChange={setTags}
					/>
				</Box>
				<Box display="flex" justifyContent="space-between">
					<FormField
						select
						label="Type"
						value={type}
						required
						style={{ flex: '.4', margin: '.5rem' }}
						onClick={(e)=>{
								e.target.value && setType(e.target.value);}}
					>
						{['mcq', 'sub'].map(option => (
							<MenuItem key={option} value={option} >
								{option}
							</MenuItem>
						))}
					</FormField>

					{type==='mcq' && <FormField
						select
						label="Type of mcq"
						value={typeOfMcq}
						required
						style={{ flex: '.4', margin: '.5rem' }}
						onClick={(e)=>{
							e.target.value && setTypeOfMcq(e.target.value);}}
					>
						{['Single Correct', 'Multiple Correct'].map(option => (
							<MenuItem key={option} value={option} >
								{option}
							</MenuItem>
						))}
					</FormField>}

					<FormField
						select
						label="Language"
						value={language}
						required
						style={{ flex: '.4', margin: '.5rem' }}
						onClick={(e)=>{
							e.target.value && setLanguage(e.target.value);}}
					>
						{['हिन्दी','English'].map(option => (
							<MenuItem key={option} value={option}>
								{option}
							</MenuItem>
						))}
					</FormField>

					

					
				</Box>

				<AllQuestionsList testId={testId} tags={tags} type={type} language={language} typeOfMcq={typeOfMcq}/>
			</form>


				{	
					<div
					style={{
						height: '100%',
						overflow: 'scroll',
						maxHeight: '100vh',
						flex: 1,
					}}
				>
					<Typography>
						{customTest?.name}
					</Typography>
					
					{
					customTest
						&&
					<Button onClick={async () => { await db.collection('customTests').doc(testId).update({
						activated : !activated
					}); setActivated(!activated)}} color='secondary' variant='contained' style={{margin:'1rem .5rem 0'}}>
						{ (activated) ?  'Deactivate' : 'Activate'}
					</Button>
					}

			
					{

					<Button onClick = {() => location.push(`/my-custom-test/add-question/${testId}`)} 
							type="submit" variant="outlined" color="secondary" style={{marginTop:'1rem'}}>
							Add new Question
					</Button>

					}

					{questions &&
						questions.map(que => (
							<div>
								<Question key={que.id} style={{ marginTop: '1rem' }} question={que} />
								<Button 
									variant='contained'
									onClick={async () => {

									setLoading(true);
									await db.collection('questions').doc(que.id).update ({
									[testId] : FieldValue.delete()
									})
									setLoading(false)
									// await db.collection('customTests').doc(user.uid).update ({
					
									// 	[`customTests.${testname.trim()}.questions.${que.id}`] : null
									// })
								
								}}>
									Remove
								</Button>
							</div>
						))}

				</div>

				}
				
			</Layout>
			
			{/* <FabLink variant="extended" to={`/quiz/${topic}/${subtopic}`}>
				<QuizIcon style={{ marginRight: '1rem' }} /> Quiz
			</FabLink> */}
		</div>
	);
};
