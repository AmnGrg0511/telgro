import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db, auth } from '../firebase/fire';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Container, Typography, List, ListItem, ListItemText, Button, Paper } from '@material-ui/core';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MathDisplay } from '../components/MathDisplay';
import {MyUploadAdapter} from '../components/MyUploadAdaptor';
import { Add, Clear, Send, ThumbDown, ThumbsUpDown, ThumbUp } from '@material-ui/icons';
const DISCUSS_COLLECTION_NAME = "discuss_questions"
const DISCUSS_COLLECTION_ANSWER_NAME = "discuss_answers"

export const DiscussionQuestion = () => {

    const {discussId} = useParams();

	const [posts] = useCollectionData(
		db
			.collection(DISCUSS_COLLECTION_NAME)
			.orderBy("timestamp", "desc")
			.limit(10),

		{ idField: 'id' },
	);
	
	const [allAnswers] = useCollectionData(
		db
			.collection(DISCUSS_COLLECTION_ANSWER_NAME)
			.orderBy("timestamp", "desc")
			.limit(10),

		{ idField: 'id' },
	);
    
	const answers = allAnswers?.filter(answer => answer.questionId === discussId);

    const post = posts?.filter(post => post.id === discussId)[0];

	const [user] = useAuthState(auth);
	const [content, setContent] = useState('');
	const [isCreatingPost, setIsCreatingPost] = useState(false);
	const [setTopic] = useState('');

	const submit = async event => {
		event.preventDefault();
		
		

		try {
		
			await db.collection(DISCUSS_COLLECTION_ANSWER_NAME).add({
				'module' : module,
				'content' : content,
				'timestamp' : new Date(),
				'user' : user.uid,
				'questionId' : discussId,
				'upvotes' : {},
				'downvotes' : {}
			})


		}
		catch {
			console.log('Sorry');
		}
		
		setTopic('');
		setContent('');
		setIsCreatingPost(false);
		
	};


	const handleUpvote = (postId) => {
		const currentAnswer = answers.filter(ans => ans.id === postId)[0];
		currentAnswer.upvotes = currentAnswer.upvotes || {}
		if(Object.keys(currentAnswer?.upvotes || {}).includes(user.uid) && currentAnswer.upvotes[user.uid] === true) {
			alert("You have already voted this answer");
			return;
		}

		if(Object.keys(currentAnswer?.downvotes || {}).includes(user.uid) && currentAnswer.downvotes[user.uid] === true) {
			alert("You have already voted this answer");
			return;
		}

		answers?.forEach(ans => {
			if(ans?.id === postId) {
				if(ans.upvotes === undefined) {
					ans.upvotes = {};
				}
				ans.upvotes[user.uid] = true;
			}
		})

		db.collection(DISCUSS_COLLECTION_ANSWER_NAME).doc(postId).update({
			[`upvotes.${user.uid}`] : true
		})

	}

	const handleDownvote = (postId) => {
		const currentAnswer = answers.filter(ans => ans.id === postId)[0];
		
		currentAnswer.downvotes = currentAnswer.downvotes || {}
		
		if(Object.keys(currentAnswer?.upvotes || {}).includes(user.uid) && currentAnswer.upvotes[user.uid] === true) {
			alert("You have already voted this answer");
			return;
		}

		if(Object.keys(currentAnswer?.downvotes || {}).includes(user.uid) && currentAnswer.downvotes[user.uid] === true) {
			alert("You have already voted this answer");
			return;
		}
		
		answers?.forEach(ans => {
			if(ans?.id === postId) {
				if(ans.downvotes === undefined) {
					ans.downvotes = {};
				}
				ans.downvotes[user.uid] = true;
			}
		})

		db.collection(DISCUSS_COLLECTION_ANSWER_NAME).doc(postId).update({
			[`downvotes.${user.uid}`] : true
		})

	}

	const getNumOfUpvotes = (post) => {
		const num_upvotes = Object.keys(post.upvotes || {}).length
		const num_dnvotes = Object.keys(post.downvotes || {}).length
		return num_upvotes - num_dnvotes;
	}

	return (
		
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			<List>
				<ListItem button style={{color:'blue'}} onClick = {() => setIsCreatingPost(!isCreatingPost)} >
					<ListItemText primary = {isCreatingPost ? <span><Clear style={{marginBottom:'.2rem'}}/> Cancel</span> : <span><Add style={{marginBottom:'.2rem'}}/> New Answer</span>}  />
				</ListItem>
			</List>

			{isCreatingPost && <Container maxWidth='md' style={{width:'100vw'}}>

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

			{isCreatingPost && <Button variant="contained" color="secondary" onClick = {submit} style= {{ display: 'flex', flex: '1', margin: '1rem' }} endIcon={<Send/>}>
					Submit
			</Button>}
			
			<Typography variant="h4" component="h2" style = {{ marginLeft: '1rem' }}>
                <MathDisplay math={post?.content} />
			</Typography>

            <Typography style={{ fontSize:'10px', margin:'2px', textAlign: 'right' }} color='textSecondary'>{post?.timestamp.toDate().toString()}</Typography>



            
			{answers?.map( post => (<Paper style={{ padding: '1rem', margin: '1rem' }}>
				<MathDisplay math={post?.content} />
				<Typography style={{ fontSize:'10px', margin:'2px', textAlign: 'right' }} color='textSecondary'>{post?.timestamp.toDate().toString()}</Typography>
				<Typography style={{ fontSize:'20px', margin:'2px', textAlign: 'right' }} color='primary'><ThumbsUpDown style={{margin:'.5rem'}}/>{getNumOfUpvotes(post)}</Typography>
                <Button style={{margin:'2px', textAlign:'right'}} color='primary' startIcon={<ThumbUp/>} onClick={() => {
					handleUpvote(post.id)
				}}>
					Upvote
				</Button>
				<Button style={{margin:'2px', textAlign:'right'}} color='secondary' startIcon={<ThumbDown/>} onClick={() => handleDownvote(post.id)}>
					Downvote
				</Button>

			</Paper>)
			
			)}


		</Container>

	);
};