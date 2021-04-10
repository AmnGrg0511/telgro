import { Container, Typography, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, InputAdornment } from '@material-ui/core';
import { db, FieldValue} from '../firebase/fire'
import { useEffect, useState } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { Autocomplete } from '@material-ui/lab';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { Link } from 'react-router-dom';
import { NoteAdd } from '@material-ui/icons';

const topicRef = db.doc('data/topics');


export const AddSubtopic = () => {

	const [value, loading, error] = useDocumentData(topicRef);
	const [showDeleteDialogBox, setShowDeleteDialogBox] = useState(false);
	const [selectedTopic, setSelectedTopic] = useState('');
    let [subtopics, setSubtopics] = useState([]);
    const [formData, setFormData] = useState({
        topic : '',
        subtopic: ''
    });

    const topics = Object.keys(value?.topics ?? {});

    const setData = current => {
        setFormData(prev => ({ ...prev, ...current }));
    };

	subtopics = Object.keys(value?.topics[formData.topic] ?? {});


    useEffect(() => {
		setSubtopics(Object.keys(value?.topics[formData.topic] ?? {}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formData.topic]);
	
	const handleClose = () => {
		setShowDeleteDialogBox(false);
	};

	const handleDeleteTopic = async (subtopic) => {
		const tags = value?.topics[formData.topic][subtopic];
		if(tags.length === 0) {

			await db.collection('data').doc('topics').update({
				[`topics.${formData.topic}.${subtopic}`] : FieldValue.delete()
			})
			
			alert("Subtopic deleted successfully!");
        	setSubtopics(
				Object.keys(value?.topics[formData.topic] ?? {})
			
			);
        	setData({
            	topic: formData.topic,
            	subtopic: ''
        	})
		} else {
			alert("This subtopic can't be deleted, because there is data associated with it!");
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
			<DialogTitle id="alert-dialog-title">{`Are you sure you want to delete ${selectedTopic}`}</DialogTitle>
			<DialogContent>
			<DialogContentText id="alert-dialog-description">
				You will no longer be able to access related question or resources.
				This subtopic will also be no longer part of any topic. 
				Please verify that you are not loosing any data.
			</DialogContentText>
			</DialogContent>
			<DialogActions>
			<Button onClick={handleClose} color="primary">
				Close
			</Button>
			<Button onClick={() => {
				handleDeleteTopic(selectedTopic);
				handleClose();
				}} 
				color="primary" autoFocus>
				OKAY, Delete
			</Button>
			</DialogActions>
		</Dialog>
	)
    
    const onSubmit = async event => {
		event.preventDefault();

		if(subtopics && subtopics.includes(formData.subtopic.trim()))
		{
			alert('This subtopic is already present');
			setSubtopics(Object.keys(value?.topics[formData.topic] ?? {}));
        	setData({
            	topic: formData.topic,
            	subtopic: ''
			})	
			return;
		}

		value.topics[formData.topic][formData.subtopic.trim()] = []

		await topicRef.update({
			[`topics.${formData.topic}.${formData.subtopic.trim()}`]: []
		});
        setSubtopics(
			Object.keys(value?.topics[formData.topic] ?? {})
			
			);
        setData({
            topic: formData.topic,
            subtopic: ''
        })
        
	};

	return (
		<Container maxWidth="sm" style={{ marginTop: '2rem' }}>
			
            <Typography variant="h4" component="h2">
				Topics
			</Typography>

            {error && <strong>Error: {JSON.stringify(error)}</strong>}
			{loading && <span>Document: Loading...</span>}
            
            <Autocomplete
					options={topics}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Topic" />}
					value={formData.topic}
					onChange={(_, val) => setData({ topic: val })}
			/>
            
            <List component="nav">
				{subtopics &&
					subtopics.map(subtopic => (
						<ListItem>
							<ListItemText primary={subtopic} />
							<ListItemSecondaryAction >
								<Button component={Link} onClick={() => { 
									setSelectedTopic(subtopic);
								 	setShowDeleteDialogBox(true) 
								}}>
									<DeleteOutlineOutlinedIcon />
								</Button>
								
							</ListItemSecondaryAction>
						</ListItem>
					))}
			</List>
			<DialogBox />
			<form
				onSubmit={onSubmit}
				style={{
					display: 'grid',
					gap: '1rem',
				}}
			>

				<TextField
					InputProps={{
						startAdornment: (
						<InputAdornment position="start">
							<NoteAdd />
						</InputAdornment>
						),
					}}
					label="New Subtopic"
					name="Topic"
					value={formData.subtopic}
					onChange={event => setData({ subtopic: event.target.value })}
				/>

				<Button type="submit" variant="contained" color="secondary" startIcon={<NoteAdd/>}>
					Add
				</Button>
			</form>
		</Container>
	);
};
