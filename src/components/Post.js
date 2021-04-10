import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { db, auth } from '../firebase/fire';
import { Container, Typography, Button } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import { MathDisplay } from '../components/MathDisplay';
import { useAuthState } from 'react-firebase-hooks/auth';
import { PlainLink } from './Links';
import { Edit } from '@material-ui/icons';

export const Post = () => {
    const [user] = useAuthState(auth);
    const {postId} = useParams();
	const [post] = useDocumentDataOnce(db.collection('posts').doc(postId));
	const [userData] = useDocumentDataOnce(db.collection('users').doc(post?.user));
    //console.log(userData);
	
	return (
		
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			<Typography variant="h4" component="h4" style = {{ marginLeft: '1rem' }}>
				{post?.topic}
			</Typography>
			
			<Typography variant="h6" component="h6" style = {{ marginLeft: '1rem', maxWidth: '90vw' }}>
                <MathDisplay math={post?.content} />
			</Typography>

            <Typography style={{ fontSize:'18px', margin:'2px', textAlign: 'right' }} color='textSecondary'>{post?.timestamp.toDate().toString()}</Typography>

            <Typography style={{ fontSize:'24px', margin:'2px', textAlign: 'right' }} color='textSecondary'>by {userData?.name}</Typography>
			{user?.uid === post?.user && <PlainLink to={`/edit-post/${postId}`} style={{textDecoration: 'none'}}>
							<Button
								variant="outlined"
								color="secondary"
								style={{ margin:'2px 2px 100px 2px'}}
								startIcon={<Edit/>}
							>
								Edit Post
							</Button>
						</PlainLink>}
		</Container>

	);
};