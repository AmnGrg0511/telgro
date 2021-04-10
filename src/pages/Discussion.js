import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db, auth } from '../firebase/fire';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Container, Typography, List, ListItem, ListItemText, Button, Paper } from '@material-ui/core';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MathDisplay } from '../components/MathDisplay';
import {MyUploadAdapter} from '../components/MyUploadAdaptor';
import { Add, Clear, QuestionAnswer, Send } from '@material-ui/icons';
const DISCUSS_COLLECTION_NAME = "discuss_questions"

export const Discussion = ({courseId}) => {
	const {subtopic} = useParams();
	const [user] = useAuthState(auth);
	const [posts] = useCollectionData(
		db
			.collection(DISCUSS_COLLECTION_NAME)
			.orderBy("timestamp", "desc")
			.limit(10),

		{ idField: 'id' },
	);
    
    
	const [content, setContent] = useState('');
	const [isCreatingPost, setIsCreatingPost] = useState(false);

	const submit = async event => {
		event.preventDefault();
		
		

		try {
		
			await db.collection(DISCUSS_COLLECTION_NAME).add({
				'subtopic' : courseId ?? subtopic,
				'content' : content,
				'timestamp' : new Date(),
				'user' : user.uid,
				'verified' : false,
			})


		}
		catch(e) {
			console.log(e);
		}
		
		setContent('');
		setIsCreatingPost(false);
		
	};

    const location = useHistory();

	return (
		
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			<List>
				<ListItem button style={{color:'blue'}} onClick = {() => setIsCreatingPost(!isCreatingPost)} >
					<ListItemText primary = {isCreatingPost ? <span><Clear style={{marginBottom:'.2rem'}}/> Cancel</span> : <span><Add style={{marginBottom:'.2rem'}}/> New Question</span>} />
				</ListItem>
			</List>

            

			{
				isCreatingPost && <Container maxWidth='md' style={{width:'100vw'}}>
				<CKEditor
					editor={ClassicEditor}
					style= {{ display: 'flex', flex: '1', margin: '1rem' }}
                    
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
                    
					
            	/>
			</Container>}

			{isCreatingPost && <Button variant="contained" color="secondary" onClick = {submit} style= {{ display: 'flex', flex: '1', margin: '1rem' }} endIcon={<Send/>}>
					Submit
			</Button>}
			
			<Typography variant="h4" component="h2" style = {{ marginLeft: '1rem' }}>
				<QuestionAnswer style={{margin:'1rem', fontSize:'2rem'}}/>Discussion Forum
			</Typography>

                        
           
			    {posts?.filter(post=>post?.subtopic === (courseId ?? subtopic))?.map( post => (
            
                
                    <Paper style={{ padding: '1rem', margin: '1rem' }} onClick={() => location.push(`/discuss-question/${post.id}`)} onTouchMove>
                        <MathDisplay math={post.content} />
                        <Typography style={{ fontSize:'10px', margin:'2px', textAlign: 'right' }} color='textSecondary'>{post.timestamp.toDate().toString().substring(3,15)}</Typography>
                    </Paper>
                
            )
			
			)}
           

		</Container>

	);
};