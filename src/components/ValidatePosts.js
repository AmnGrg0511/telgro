import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { db} from '../firebase/fire';
import { Container, Typography, Paper, Button } from '@material-ui/core';
import { MathDisplay } from './MathDisplay';
import { Beenhere } from '@material-ui/icons';
import { useState } from 'react';



export const ValidatePosts = () => {
	const [posts] = useCollectionDataOnce(
		db
			.collection("posts")
			.orderBy("timestamp", "desc")
			.limit(10),

		{ idField: 'id' },
	);
	const [verified, setVerified] = useState(false);
	return (
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			{posts?.filter(post => !post.verified).map( post => (<Paper style={{ padding: '1rem', margin: '1rem' }}>
				<Typography variant='h5'>{post.topic}</Typography>
				<MathDisplay math={post.content} />
				<Typography style={{ fontSize:'10px', margin:'2px', textAlign: 'right' }} color='textSecondary'>{post.timestamp.toDate().toString()}</Typography>
				<Button style={{ textTransform: 'none' }} variant='outlined' color='primary' onClick = {async () => 
								{
									await db.collection('posts').doc(post.id).update({
										verified: true
									})
									setVerified(true);
								}
							} disabled={verified} startIcon={<Beenhere/>}>Validate</Button>
			</Paper>)
			
			)}
		</Container>

	);
};