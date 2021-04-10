import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { db, auth } from '../firebase/fire';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Container, MenuItem, TextField, Button, InputAdornment } from '@material-ui/core';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';

import {MyUploadAdapter} from './MyUploadAdaptor';
import { BlurOn, Clear, Send, Telegram } from '@material-ui/icons';

const moduleRef = db.doc('data/modules');

export const EditPost = () => {
	const location = useHistory();
	const {postId} = useParams();
	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
	const [content, setContent] = useState('');
	const [topic, setTopic] = useState('');

	const [value] = useDocumentDataOnce(moduleRef);
    let modules = Object.keys(value?.modules ?? {});
	modules=modules.filter(module => userData?.modulePermissions && userData?.modulePermissions[module]);
	const [module, setModule] = useState('Everyone');
	const defaultValues = {
		module:'Everyone'
	};

	useEffect(() => {
		const loadData = async () => {
			const post = (await db.collection('posts').doc(postId).get()).data();
			setTopic(post?.topic);
			setContent(post?.content);
			
		};

		if (postId) {
			loadData();
		}
	}, [postId]);


	let { register, control } = useForm({
		defaultValues,
	});	

	const submit = async event => {
		event.preventDefault();
		
		

		try {
		
			
			if(module==='Everyone'){
				await db.collection('posts').doc(postId).update({
					'topic' : topic.trim(),
					'content' : content,
					'timestamp' : new Date(),
					'user' : user.uid,
					'verified' : false
				})
			} else{
				await  db.collection('posts').doc(postId).update({
					'topic' : topic.trim(),
					'content' : content,
					'timestamp' : new Date(),
					'user' : user.uid,
					'verified' : false,
					'module': module
				})
			}


		}
		catch {
			console.log('Sorry');
		}
		location.push(`/post/${postId}`);
		
	};



	return (
		
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			
			<TextField
				InputProps={{
					startAdornment: (
					<InputAdornment position="start">
						<BlurOn />
					</InputAdornment>
					),
				}}
				label="Type"
                placeholder="Topic"
				name="Topic"
				value={topic}
				style= {{ display: 'flex', flex: '1', margin: '1rem 0' }}
				onChange={event => setTopic( event.target.value )}
                autoComplete='off'
			/>

			<Container maxWidth='md' style={{width:'100vw'}}>


				<CKEditor
					editor={ClassicEditor}
                    data={content}
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
                    
				

		
            /></Container>
			<div style={{display:'flex', margin:'1rem'}}>
					<Controller
						name="module"
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
								style={{ flex:'.5', margin: '1rem' }}
								inputRef={register}
								onClick={(e)=>{
									e.target.value && setModule(e.target.value);}}
							>
								{['Everyone', ...modules].map(option => (
									<MenuItem key={option} value={option}>
										{option}
									</MenuItem>
								))}
							</TextField>
						}
					/></div>

			<div style={{display:'flex', margin:'1rem'}}><Button variant="contained" color="secondary" style={{margin:'.4rem'}} onClick = {submit} startIcon={<Telegram/>} >
					Submit
			</Button>
            <Button variant="outlined" style={{margin:'.4rem'}} color="secondary" onClick = {() => {location.push(`/post/${postId}`)}} endIcon={<Clear/>}>
					Cancel
			</Button></div>


		</Container>

	);
};