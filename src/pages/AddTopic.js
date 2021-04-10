import { Container, Typography, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, InputAdornment } from '@material-ui/core';
import {db, FieldValue} from '../firebase/fire'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentData, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { PostAdd, PostAddTwoTone } from '@material-ui/icons';

const topicRef = db.doc('data/topics');
const moduleRef = db.doc('data/modules');

export const AddTopic = () => {

    const [value, loading, error] = useDocumentData(topicRef);
	const [showDeleteDialogBox, setShowDeleteDialogBox] = useState(false);
	const [selectedTopic, setSelectedTopic] = useState('');

	const [moduleValue] = useDocumentDataOnce(moduleRef);
    
	const modules = Object.keys(moduleValue?.modules ?? {});

    const [formData, setFormData] = useState({
        topic : '',
    });

    const topics = Object.keys(value?.topics ?? {});

    const setData = current => {
        setFormData(prev => ({ ...prev, ...current }));
    };

	const handleClose = () => {
		setShowDeleteDialogBox(false);
	};

	const handleDeleteTopic = async (topic) => {
		if(Object.keys(value?.topics[topic] ?? {}).length === 0) {
			modules.map( async module => {
				await db.collection('data').doc('modules').update({
					[`modules.${module}.topics`] : FieldValue.arrayRemove(topic)
				})
			})

			await db.collection('data').doc('topics').update({
				[`topics.${topic}`] : FieldValue.delete()
			})
			alert("Topic deleted successfully!");
		} else {
			alert("This topic can't be deleted, because there is data associated with it!");
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
				You will no longer be able to access related question or subtopics.
				This topic will also be no longer part of any module. 
				Please verify that you are not loosing any data.
			</DialogContentText>
			</DialogContent>
			<DialogActions>
			<Button onClick={handleClose} color="primary">
				Close
			</Button>
			<Button onClick={() => handleDeleteTopic(selectedTopic)} color="primary" autoFocus>
				OKAY, Delete
			</Button>
			</DialogActions>
		</Dialog>
	)
    const onSubmit = event => {
		event.preventDefault();
		if(topics && topics.includes(formData.topic.trim()))
		{
			alert('This topic is already present');
			
        	setData({
            	topic: ''
			})	
			return;
		}

		topicRef.update({
			[`topics.${formData.topic.trim()}`]: {}
		});
        
        setData({
            topic: ''
        })
        
	};

	

	return (
		<Container maxWidth="sm" style={{ marginTop: '2rem' }}>
			

            <Typography variant="h4" component="h2">
				Topics
			</Typography>

            {error && <strong>Error: {JSON.stringify(error)}</strong>}
			{loading && <span>Document: Loading...</span>}
            

            
            <List component="nav">
				{value &&
					Object.keys(value?.topics ?? {}).map(topic => (
						<div>
							<ListItem>
								<ListItemText primary={topic} />
								<ListItemSecondaryAction>
									<Button component={Link} onClick={() => { 
										setSelectedTopic(topic);
									 	setShowDeleteDialogBox(true) 
									}}>
										<DeleteOutlineOutlinedIcon />
									</Button>
									
								</ListItemSecondaryAction>
							</ListItem>
							
						</div>
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
							<PostAddTwoTone />
						</InputAdornment>
						),
					}}
					label="New Topic"
					name="Topic"
					value={formData.topic}
					onChange={event => setData({ topic: event.target.value })}
				/>

				<Button type="submit" variant="contained" color="secondary" startIcon={<PostAdd/>}>
					Add
				</Button>
			</form>
		</Container>
	);
};
