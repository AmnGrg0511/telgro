import { Button, TextField, Typography } from '@material-ui/core';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { db, auth } from '../firebase/fire';
import { Autocomplete } from '@material-ui/lab';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Container } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { Flare } from '@material-ui/icons';
import { useState } from 'react';

const topicRef = db.doc('data/topics');
const moduleRef = db.doc('data/modules');

export const CreateTestWithModule = () => {

	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));

    const [moduleValue, moduleLoading, moduleError] = useDocumentDataOnce(moduleRef);
    
	let modules = Object.keys(moduleValue?.modules ?? {});
	modules=modules.filter(module => userData?.modulePermissions && userData?.modulePermissions[module]);

	const [topicValue, topicLoading, topicError] = useDocumentDataOnce(topicRef);
    
    const [formData, setFormData] = useState({
        module: null,
		tag: [],
		topic: [],
        subtopic: [],
        reet_level: '1'
	});
    
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    const [topics, setTopics] = useState([]);
	const [selectedTopics, setSelectedTopics] = useState();
	

	let subs = []
    
    selectedTopics?.map(topic => {
		subs = subs.concat(Object.keys(topicValue?.topics[topic] ?? {}));	
		return 0;
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

	if(formSubmitted && !((formData.topic?.length) === 0 && (formData.subtopic?.length) === 0) && (formData.module !== 'REET' || (formData.reet_level === '1' || formData.reet_level === '2') )) {
		// console.log(formData.topic.length);
		if(formData.topic?.length === 0)
			formData.topic.push('all');
		if(formData.subtopic?.length === 0)
			formData.subtopic.push('all');
		const topicString = formData.topic.join('$');
        const subtopicString = formData.subtopic.join('$')
        const moduleName = formData.module + (formData.module === 'REET' ? `_${formData.reet_level}` : '');
		const REDIRECT_URL = '/quiz/' + moduleName + '/' + topicString + '/' + subtopicString;
		return (
			<Redirect to={REDIRECT_URL} />
		)
	}

	if(formSubmitted && ((formData.topic?.length) === 0 && (formData.subtopic?.length) === 0))
		setFormSubmitted(false);
    
	return (
		<>
		<Container maxWidth="sm" style={{ marginTop: '2rem' }}>
			<Typography variant="h4" component="h2">
				Create Test
			</Typography>

			{moduleError && <strong>Error: {JSON.stringify(moduleError)}</strong>}
            {topicError && <strong>Error: {JSON.stringify(topicError)}</strong>}
			{moduleLoading && <span>Document: Loading...</span>}
            {topicLoading && <span>Document: Loading...</span>}

			<form
				onSubmit={onSubmit}
				style={{
					display: 'grid',
					gap: '1rem',
				}}
			>

                <Autocomplete  
					options={modules}
					disableClearable
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Module" />}
					value={formData.module}
					onChange={(_, val) => {setTopics(moduleValue.modules[val]?.topics); setData({ module: val, topic: [], subtopic: [] }); }}
					
	 			/>

                {
                    formData.module === 'REET'
                    &&
                <Autocomplete  
					options={['1', '2']}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Level" />}
					value={formData.reet_level}
					onChange={(_, val) => {setData({ reet_level: val}); }}
					
	 			/>
                }
                

				<Autocomplete
					multiple
					options={topics}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Topic" />}
					value={formData.topic}
					onChange={(_, val) => {setSelectedTopics(val);setData({ topic: val })}}
					
	 			/>

	 			{
                    formData.module?.length > 0 && formData.module === 'IIT JEE'
                     &&
                    <Autocomplete
				 	multiple
					options={subs}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Sub Topic" />}
					value={formData.subtopic}
					onChange={(_, val) => setData({ subtopic: val })}
				/>}

				<Button type="submit" variant="contained" color="secondary" startIcon={<Flare/>}>
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
