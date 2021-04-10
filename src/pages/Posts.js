import { useCollectionDataOnce, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { db, auth } from '../firebase/fire';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Container, Typography, MenuItem, TextField, Button, Paper, InputAdornment } from '@material-ui/core';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Autocomplete } from '@material-ui/lab';
import { useHistory } from 'react-router-dom';

import {MyUploadAdapter} from '../components/MyUploadAdaptor';
import { BlurOn, Clear, Send, SpeakerNotes, Telegram } from '@material-ui/icons';

const moduleRef = db.doc('data/modules');

export const Posts = (props) => {
	console.log(props);
	const {course} = props;
	let [posts] = useCollectionDataOnce(
		db
			.collection("posts")
			.orderBy("timestamp", "desc")
			.limit(10),

		{ idField: 'id' },
	);

	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
	const [content, setContent] = useState('');
	const [isCreatingPost, setIsCreatingPost] = useState(false);
	const [topic, setTopic] = useState('');
	const [post, setPost] = useState(null);
	posts = posts?.filter(post => post.verified).filter(post => {
		if(post.module){
			return userData?.modulePermissions?.[post.module];
		}
		if(!course && post.course){
			return false;
		}
		return true;
	});
	if(course){
		posts = posts?.filter(post => post.verified).filter(post => {
			if(post.course){
				return post.course === course;
			}
			return false;
		});
	}

	const options = posts?.map(post=>post.topic);
	if(post){
		posts=posts?.filter(aPost=>aPost.topic===post);
	}

	const [value] = useDocumentDataOnce(moduleRef);
    let modules = Object.keys(value?.modules ?? {});
	modules=modules.filter(module => userData?.modulePermissions && userData?.modulePermissions[module]);
	const [module, setModule] = useState('Everyone');
	const defaultValues = {
		module:'Everyone'
	};

	let { register, control } = useForm({
		defaultValues,
	});	

	const submit = async event => {
		event.preventDefault();
		
		

		try {
		
			if(module==='Everyone'){
				if(course){
					await db.collection('posts').add({
						'topic' : topic.trim(),
						'content' : content,
						'timestamp' : new Date(),
						'user' : user.uid,
						'verified' : true,
						'course' : course,
					})
				} else {
					await db.collection('posts').add({
						'topic' : topic.trim(),
						'content' : content,
						'timestamp' : new Date(),
						'user' : user.uid,
						'verified' : false,
					})
				}
				
			} else{
				await db.collection('posts').add({
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
		
		setTopic('');
		setContent('');
		setIsCreatingPost(false);
		
	};
	const location = useHistory();


	const Post = ({post}) => {
		const [hover, setHover] = useState(false);
		return (
		<Paper onMouseEnter={()=>setHover(true)} onMouseLeave={()=>{setHover(false)}} className='row' style={{ padding: '1rem', margin: '1rem', cursor:'pointer', boxShadow: hover ? '4px 8px 5px #888888' : '1px 2px 2px #888888' }} onClick={()=>location.push(`/post/${post.id}`)}>
			<Typography className='col-8' variant='h6'>{post.topic}</Typography>
			<Typography className='col-4' style={{ fontSize:'10px', margin:'auto', textAlign: 'right', padding:0 }} color='textSecondary'>{post.timestamp.toDate().toString().substring(3,15)}</Typography>
		</Paper>)
	}
	console.log(course);

	return (
		
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			
			{(userData?.type === 'moderator' || course) && <TextField
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
                onFocus={()=>setIsCreatingPost(true)}
                autoComplete='off'
			/>}

			{isCreatingPost && <Container style={{padding:'1%'}}>


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
			{isCreatingPost && !course && <div style={{display:'flex', margin:'1rem'}}>
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
					/></div>}

			{isCreatingPost && <div style={{display:'flex', margin:'1rem'}}><Button variant="contained" color="secondary" style={{margin:'.4rem'}} onClick = {submit} startIcon={<Telegram/>} >
					Submit
			</Button>
            <Button variant="outlined" style={{margin:'.4rem'}} color="secondary" onClick = {() => setIsCreatingPost(false)} endIcon={<Clear/>}>
					Cancel
			</Button></div>}
			<Autocomplete
					style={{margin:'1.5rem'}}
					options={options}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Search Posts" />}
					value={post}
					onChange={(_, val) => setPost( val )}
				/>
			<Typography variant="h4" component="h2" style = {{ marginLeft: '1rem' }}>
				<SpeakerNotes style={{fontSize:'2rem', margin:'1rem'}}/>{course ? 'Notes' : 'Posts'}
			</Typography>

			{posts?.map( post => <Post post={post}/>)}


		</Container>

	);
};