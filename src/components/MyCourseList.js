import { db, auth } from '../firebase/fire';
import { Link, useHistory } from 'react-router-dom';
import { useCollectionData, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState } from 'react';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {MyUploadAdapter} from './MyUploadAdaptor';

import {
	Container,
	List,
	ListItem,
	ListItemText,
    Typography,
    Button, TextField, MenuItem, InputAdornment
} from '@material-ui/core';

import { Autocomplete } from '@material-ui/lab';
import { Collections, CreateNewFolder, Edit, Translate } from '@material-ui/icons';

function ListItemLink(props) {
	return <ListItem button component={Link} {...props} />;
}



export function MyCourseList() {
	
	const location = useHistory();

	const [user] = useAuthState(auth);
	
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
	
	const [value] = useCollectionData(
		db.collection('courses').where('moderator', '==', user?.uid).limit(10),
		{ idField: 'id' },
	);
	
	const [moduleValue] = useDocumentDataOnce(db.collection('data').doc('modules'));
	const [topicValue] = useDocumentDataOnce(db.collection('data').doc('topics'));

	let modules = Object.keys(moduleValue?.modules || {});
	modules=modules.filter(module => userData?.modulePermissions && userData?.modulePermissions[module]);
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({
		title: '',
		timestamp: new Date(),
		description: '',
		module: '',
		topic: '',
		subtopic: '',
		language: 'हिन्दी',
	})

	const setData = current => {
		setFormData(prev => ({ ...prev, ...current }));
	};
	
	const onSubmit = async event => {
		event.preventDefault();
		
		
		if(Object.keys(value?.courses ?? {}).includes(formData.title.trim())) {
			alert("There is an existing test with same title");
			return;
		}


		try {
		
			await db.collection('courses').add({
				'title' : formData.title.trim(),
				'content' : [{name:'Session 1', posts: []}],
				'timestamp' : formData.timestamp,
				'moderator' : user.uid,
				'module' : formData.module,
				'topic' : formData.topic,
				'subtopic' : formData.subtopic,
				'description' : formData.description,
				'language' : formData.language,
			})

		}
		catch(e) {
			console.log(e);
		}
		
		
		setData({
			title: '',
			timestamp: new Date(),
			description: '',
			module: ''
		})	

		setShowForm(false);
	};
	
	return (

		<Container maxWidth="md" style={{ marginTop: '2rem' }}>

		{ !showForm &&
		
		<div>
			<Typography variant="h4" component="h2">
				<Collections style={{fontSize:'2rem', margin:'1rem'}}/>Courses
			</Typography>

			<List component="nav">
				{value &&
					value.map(course => (
						<ListItem>
						<ListItemLink key={course.id} to={`/my-course/${course.id}`}>
							<ListItemText primary={course.title} />
						</ListItemLink>
						
						<Button
							variant="outlined"
							color="secondary"
							style={{margin:'0 .1rem'}}
							startIcon={<Edit/>}
							onClick = {() => {location.push(`/course/${course.id}/edit`)}}
						>
							Edit
						</Button>

						</ListItem>
					))}
			</List>

            <Button onClick={() => setShowForm(!showForm)} color='secondary' variant='contained' startIcon={<CreateNewFolder/>}>
                Create a new Course
            </Button>

		</div>
		}
		{
			showForm && 
			
			<form
				onSubmit={onSubmit}
				style={{
					display: 'grid',
					gap: '1rem',
				}}
			>

				<TextField
					required
					label="Title of Course"
					name="title"
					value={formData.title}
					onChange={event => setData({ title: event.target.value, timestamp: new Date() })}
				/>
				<TextField
						InputProps={{
							startAdornment: (
							<InputAdornment position="start">
								<Translate />
							</InputAdornment>
							),
						}}
						select
						label="Language"
						value={formData.language}
						required
						style={{ flex: '.4', margin: '.5rem 15rem' }}
						onClick={(e)=>{
							e.target.value && setData({language:e.target.value});}}
					>
						{['हिन्दी', 'English'].map(option => (
							<MenuItem key={option} value={option}>
								{option}
							</MenuItem>
						))}
					</TextField>

                <Container maxWidth='md' style={{width:'100vw'}}>


                    <CKEditor
                        editor={ClassicEditor}
                        data={formData.description}
                        onReady={editor => {
                        editor.plugins.get("FileRepository").createUploadAdapter = loader => {
                            const temp = new MyUploadAdapter(loader);
                            return temp;
                        };
                        }}
                        
                        

                        onChange={ ( event, editor ) => {
                            const data = editor.getData();
                            setData({description : data})
                        } }
                        



                    />
                </Container>


			

				<Autocomplete
					required
					options={modules}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Module" />}
					value={formData.module}
					onChange={(_, val) => setData({ module: val })}
				/>
				<Autocomplete
					required
					options={moduleValue?.modules?.[formData.module]?.topics ?? []}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Topic" />}
					value={formData.topic}
					onChange={(_, val) => setData({ topic: val })}
				/>
				<Autocomplete
					required
					options={Object.keys(topicValue?.topics?.[formData.topic] ?? {})}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Subtopic" />}
					value={formData.subtopic}
					onChange={(_, val) => setData({ subtopic: val })}
				/>

				<Button type="submit" variant="contained" color="secondary" disabled={!formData.module||!formData.topic||!formData.subtopic||!formData.description}>
					Create
				</Button>
			</form>
		}	
		</Container>
	);
}


