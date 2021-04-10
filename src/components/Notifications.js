import { useCollectionData, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { db, auth } from '../firebase/fire';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Container, Typography, TextField, Button, Paper, MenuItem, InputAdornment } from '@material-ui/core';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useState } from 'react';
import { MathDisplay } from '../components/MathDisplay';
import { Controller, useForm } from 'react-hook-form';


import {MyUploadAdapter} from '../components/MyUploadAdaptor';
import { AddAlert, Clear, NotificationsActive, Send, Telegram } from '@material-ui/icons';

const batchRef = db.doc('data/batches');

export const Notifications = () => {
	const [notifications] = useCollectionData(
		db
			.collection("notifications")
			.orderBy("timestamp", "desc")
			.limit(10),

		{ idField: 'id' },
	);

	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
	const [content, setContent] = useState('');
	const [isCreatingNotification, setIsCreatingNotification] = useState(false);
	const [topic, setTopic] = useState('');
	const [value] = useDocumentDataOnce(batchRef);
    let batches = Object.keys(value?.batches ?? {});
	batches=batches.filter(batch => userData?.batches && userData?.batches[batch]);
	const [batch, setBatch] = useState('Everyone');
	const defaultValues = {
		batch:'Everyone'
	};

	let { register, control } = useForm({
		defaultValues,
	});	



	const submit = async event => {
		event.preventDefault();
		

		try {
			if(batch==='Everyone'){
				await db.collection('notifications').add({
				'topic' : topic.trim(),
				'content' : content,
				'timestamp' : new Date(),
				'user' : user?.uid,
				'verified' : false
				})
			} else{
				await db.collection('notifications').add({
					'topic' : topic.trim(),
					'content' : content,
					'timestamp' : new Date(),
					'user' : user?.uid,
					'verified' : false,
					'batch': batch
				})
			}

		}
		catch {
			console.log('Sorry');
		}
		
		setTopic('');
		setContent('');
		setIsCreatingNotification(false);
		
	};



	return (
		
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			

			{userData?.type === 'moderator' && <TextField
				InputProps={{
					startAdornment: (
					<InputAdornment position="start">
						<AddAlert />
					</InputAdornment>
					),
				}}
				label="New Notification"
                placeholder="Topic"
				name="Topic"
				value={topic}
				style= {{ display: 'flex', flex: '1', margin: '1rem 0' }}
				onChange={event => setTopic( event.target.value )}
                onFocus={()=>setIsCreatingNotification(true)}
                autoComplete='off'
			/>}

			{isCreatingNotification && <Container maxWidth='md' style={{width:'100vw'}}>
			
			<CKEditor
			editor={ClassicEditor}
			
			onReady={editor => {
			  editor.plugins.get("FileRepository").createUploadAdapter = loader => {
				const temp = new MyUploadAdapter(loader);
				return temp;
			  };
			}}
			
			

			onChange={ ( event, editor ) => {
				const data = editor.getData();
				setContent(data)
			} }
		
            /></Container>}
			{isCreatingNotification && <div style={{display:'flex', margin:'.8rem'}}> <Controller
						name="batch"
						control={control}
						as={
							<TextField
								InputProps={{
									startAdornment: (
									<InputAdornment position="start">
										<Send />
									</InputAdornment>
									),
								}}
								select
								label="Group"
								required
								style={{ flex:'.5', margin: '.8rem' }}
								inputRef={register}
								onClick={(e)=>{
									e.target.value && setBatch(e.target.value);}}
							>
								{['Everyone', ...batches].map(option => (
									<MenuItem key={option} value={option}>
										{option}
									</MenuItem>
								))}
							</TextField>
						}
					/></div>}

			{isCreatingNotification && <div style={{display:'flex', margin:'1rem'}}><Button variant="contained" color="secondary" style={{margin:'.4rem'}} onClick = {submit} startIcon={<Telegram/>}>
					Send
			</Button>
            <Button variant="outlined" style={{margin:'.4rem'}} color="secondary" onClick = {() => setIsCreatingNotification(false)} endIcon={<Clear/>}>
					Cancel
			</Button></div>}
			
			<Typography variant="h4" component="h2" style = {{ margin: '2rem' }}>
				<NotificationsActive style={{fontSize:'2rem', margin:'1rem'}}/>Notifications
			</Typography>

			{notifications?.filter(notification => {
				if(notification.batch){
					return userData?.batches?.[notification.batch];
				}
				return true;
			}).map( notification => (<Paper key={notification.id} style={{ padding: '1rem', margin: '1rem' }}>
				<Typography variant='h5'>{notification.topic}</Typography>
				<MathDisplay math={notification.content} />
				<Typography style={{ fontSize:'10px', margin:'2px', textAlign: 'right' }} color='textSecondary'>{notification.timestamp.toDate().toString()}</Typography>
			</Paper>)
			
			)}


		</Container>

	);
};