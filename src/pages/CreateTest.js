import { Button, TextField, Typography } from '@material-ui/core';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';

import firebase from 'firebase/app';
import { db } from '../firebase/fire';
import { Autocomplete } from '@material-ui/lab';
import { useEffect, useState } from 'react';
import { Container } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
const topicRef = db.doc('data/topics');

export const CreateTest = () => {
	const [value, loading, error] = useDocumentDataOnce(topicRef);
	const [formData, setFormData] = useState({
		tag: [],
		topic: [],
		subtopic: [],
	});
	const [formSubmitted, setFormSubmitted] = useState(false);
    const [subtopics, setSubtopics] = useState([]);
    
	const topics = Object.keys(value?.topics ?? {});

	let subs = []
	topics.map(topic => {
		subs = subs.concat(Object.keys(value?.topics[topic] ?? {}));	
	})

	const setData = current => {
		setFormData(prev => ({ ...prev, ...current }));
	};

	

	// useEffect(() => {
	// 	setSubtopics(Object.keys(value?.topics[formData.topic] ?? {}));
	// }, [formData.topic]);

	const onSubmit = event => {
		event.preventDefault();
		setFormSubmitted(true);
		
		
		// topicRef.update({
		// 	[`topics.${formData.topic}.${formData.subtopic}`]: firebase.firestore.FieldValue.arrayUnion(
		// 		formData.tag.trim(),
		// 	),
		// });
		
	};

	if(formSubmitted && !((formData.topic.length) == 0 && (formData.subtopic.length) == 0)) {
		// console.log(formData.topic.length);
		if(formData.topic.length == 0)
			formData.topic.push('all');
		if(formData.subtopic.length == 0)
			formData.subtopic.push('all');
		const topicString = formData.topic.join('$');
		const subtopicString = formData.subtopic.join('$');
		const REDIRECT_URL = '/quiz/' + '/' + topicString + '/' + subtopicString;
		return (
			<Redirect to={REDIRECT_URL} />
		)
	}

	if(formSubmitted && ((formData.topic.length) == 0 && (formData.subtopic.length) == 0))
		setFormSubmitted(false);
		
	return (
		<>
		<Container maxWidth="sm" style={{ marginTop: '2rem' }}>
			<Typography variant="h4" component="h2">
				Create Test
			</Typography>

			{error && <strong>Error: {JSON.stringify(error)}</strong>}
			{loading && <span>Document: Loading...</span>}

			<form
				onSubmit={onSubmit}
				style={{
					display: 'grid',
					gap: '1rem',
				}}
			>
				<Autocomplete
					multiple
					options={topics}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Topic" />}
					value={formData.topic}
					onChange={(_, val) => setData({ topic: val })}
					
	 			/>

	 			<Autocomplete
				 	multiple
					options={subs}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Sub Topic" />}
					value={formData.subtopic}
					onChange={(_, val) => setData({ subtopic: val })}
				/>

				<Button type="submit" variant="contained" color="secondary">
					Start test
				</Button>
	 		</form>
		</Container>
	 	</>
		 
     );
    
    // return (
    //     <div>
    //         HELLO
    //     </div>
    // )
};
