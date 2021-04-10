import { Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions  } from '@material-ui/core';
import { PlainLink } from './Links';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { db } from '../firebase/fire';
import { useState } from 'react';
import {Resource} from './Resource';
import { useHistory, useParams } from 'react-router';
import { ArrowBack, Delete, Edit } from '@material-ui/icons';

export const ValidateResources = () => {
	const {module, topic, subtopic} = useParams();
	const [showDeleteDialogBox, setShowDeleteDialogBox] = useState(false);
	const [resourceId, setResourceId] = useState('');
	const location = useHistory();
	let [resources] = useCollectionDataOnce( 
		db.collection('resources')
			.where('topic', '==', topic)
			.where('subtopic', '==', subtopic)
			.limit(10)
		, { idField: 'id' });
	if(resources){
		resources = resources.filter(resource => resource.Reported && resource.Reported.length !== 0);
	}

	const handleClose = () => {
		setShowDeleteDialogBox(false);
	};

	const handleDeleteresource = async (id) => {
		await db.collection('resources').doc(id).delete();
		
		handleClose();
	};


	const DialogBox = () => (
		<Dialog
			open={showDeleteDialogBox}
			onClose={handleClose}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{`Are you sure you want to delete this resource`}</DialogTitle>
			<DialogContent>
			<DialogContentText id="alert-dialog-description">
				You will no longer be able to access this resource.
				Please verify.
			</DialogContentText>
			</DialogContent>
			<DialogActions>
			<Button onClick={handleClose} color="primary">
				Close
			</Button>
			<Button onClick={() => handleDeleteresource(resourceId)} color="primary" autoFocus>
				OKAY, Delete
			</Button>
			</DialogActions>
		</Dialog>
	)
	
	return (
		<Container maxWidth="sm" style={{ marginTop: '2rem' }}>
			<Typography variant="h4" component="h2">
				<ArrowBack style={{margin:'1rem .8rem 1rem 0'}} onClick={()=>(location.goBack())}/>Reported resources
			</Typography>
			{resources &&
				resources.map(res => (
					<div key={res.id}>
						<Resource res={res} reported/>
						<PlainLink to={`/module/${module}/edit-resources/${topic}/${subtopic}/${res.id}`} style={{textDecoration: 'none'}}>
							<Button
								variant="outlined"
								color="secondary"
								style={{marginTop:'.2rem'}}
								startIcon={<Edit/>}
							>
								Edit Resource
							</Button>
						</PlainLink>
						<Button
							variant="contained"
							color="secondary"
							style={{marginTop:'.2rem', marginLeft:'.4rem'}}
							startIcon={<Delete/>}
							onClick={() => { 
										setResourceId(res.id);
									 	setShowDeleteDialogBox(true) 
									}}
						>
							Remove Resource
						</Button>
					</div>
				))}
				<DialogBox />
			
		</Container>
	);
};