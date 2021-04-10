import { Typography, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, InputAdornment } from '@material-ui/core';
import { useCollectionDataOnce, useDocumentDataOnce } from 'react-firebase-hooks/firestore';

import firebase from 'firebase/app';
import {db, FieldValue} from '../../firebase/fire'
import { Autocomplete } from '@material-ui/lab';
import { useEffect, useState } from 'react';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { Link } from 'react-router-dom';
import { PlaylistAdd } from '@material-ui/icons';

const topicRef = db.doc('data/topics');

export const TagList = () => {
	
	let [questions] = useCollectionDataOnce( db.collection('questions').limit(10), { idField: 'id' });
	let [resources] = useCollectionDataOnce( db.collection('resources').limit(10), { idField: 'id' });
	const [value, loading, error] = useDocumentDataOnce(topicRef);
	const [showDeleteDialogBox, setShowDeleteDialogBox] = useState(false);
	const [formData, setFormData] = useState({
		tag: '',
		topic: '',
		subtopic: '',
	});
	const [subtopics, setSubtopics] = useState([]);
	let [tags, setTags] = useState([]);
	const [selectedTag, setSelectedTag] = useState('');


	const setData = current => {
		setFormData(prev => ({ ...prev, ...current }));
	};

	const topics = Object.keys(value?.topics ?? {});

	useEffect(() => {
		setSubtopics(Object.keys(value?.topics[formData.topic] ?? {}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formData.topic]);


	useEffect(() => {
		setTags(value?.topics[formData.topic][formData.subtopic]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formData.subtopic]);


	const handleClose = () => {
		setShowDeleteDialogBox(false);
	};

	const handleDeleteTopic = async (tag) => {
		let relatedQuestions = [], relatedResources = [];		
		
		if(tag !== undefined && tag !== ''){
			relatedQuestions = questions.filter(question => question.topic === formData.topic && question.subtopic === formData.subtopic && question.tags.includes(tag));
		}


		if(tag !== undefined && tag !== ''){
			relatedResources = resources.filter(resource => resource.topic === formData.topic && resource.subtopic === formData.subtopic && resource.tags.includes(tag));
		}


		if(relatedQuestions.length === 0 && relatedResources.length === 0) {

			await db.collection('data').doc('topics').update({
				[`topics.${formData.topic}.${formData.subtopic}`] : FieldValue.arrayRemove(tag)
			})
			setTags(prev => prev.filter(prevTag => prevTag !== tag));
			alert("Tag deleted successfully!");
			
		} else {
			alert("This Tag can't be deleted, because there is data associated with it!");
		}
		
		handleClose();
	};


	const DialogBox = () => (
		<Dialog
			open={showDeleteDialogBox}
			onClose={handleClose}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{`Are you sure you want to delete ${selectedTag}`}</DialogTitle>
			<DialogContent>
			<DialogContentText id="alert-dialog-description">
				You will no longer be able to access related question or resources.
				This tag will also be no longer part of any subtopic. 
				Please verify that you are not loosing any data.
			</DialogContentText>
			</DialogContent>
			<DialogActions>
			<Button onClick={handleClose} color="primary">
				Close
			</Button>
			<Button onClick={() => {
				handleDeleteTopic(selectedTag);
				handleClose();
				}} 
				color="primary" autoFocus>
				OKAY, Delete
			</Button>
			</DialogActions>
		</Dialog>
	)



	const onSubmit = event => {
		event.preventDefault();

		topicRef.update({
			[`topics.${formData.topic}.${formData.subtopic}`]: firebase.firestore.FieldValue.arrayUnion(
				formData.tag.trim(),
			),
		});
		setTags( prev => [...prev, formData.tag.trim()]);
		setData({
			topic: formData.topic,
			subtopic: formData.subtopic,
			tag: ''
		})
	
	};

	return (
		<>
			<Typography variant="h4" component="h2" style = {{ paddingBottom: '1rem' }}>
				Tags
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
					options={topics}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Topic" />}
					value={formData.topic}
					onChange={(_, val) => setData({ topic: val })}
				/>

				<Autocomplete
					options={subtopics}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Sub Topic" />}
					value={formData.subtopic}
					onChange={(_, val) => setData({ subtopic: val })}
				/>

				<List component="nav">
					{tags &&
						tags.map((tag, idx) => (
							<ListItem key={idx}>
								<ListItemText primary={tag} />
								<ListItemSecondaryAction>
									<Button component={Link} onClick={() => { 
										setSelectedTag(tag);
										setShowDeleteDialogBox(true) 
									}}>
										<DeleteOutlineOutlinedIcon />
									</Button>
									
								</ListItemSecondaryAction>
							</ListItem>
						))
					}
				</List>
				<DialogBox />

				<TextField
					InputProps={{
						startAdornment: (
						<InputAdornment position="start">
							<PlaylistAdd />
						</InputAdornment>
						),
					}}
					label="New Tag"
					name="tag"
					value={formData.tag}
					onChange={event => setData({ tag: event.target.value })}
				/>

				<Button type="submit" variant="contained" color="secondary" startIcon={<PlaylistAdd/>}>
					Add
				</Button>
			</form>
		</>
	);
};
