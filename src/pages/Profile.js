import {
	Container,
	Typography,
} from '@material-ui/core';
import { useDocumentDataOnce, useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { auth, db } from '../firebase/fire';
import {Link, useParams} from 'react-router-dom'
import UserProfile from '../components/UserProfile';
import {PastTests} from '../components/PastTests';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Module } from '../components/Module';

const moduleRef = db.doc('data/modules');

export const Profile = () => {

	const {userId} = useParams();
    const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(userId ? userId : user?.uid));
	const [value] = useDocumentDataOnce(
		db.collection('knowledgeProfiles').doc(userId ? userId : user?.uid),
	);
	const [moduleData] = useDocumentDataOnce(moduleRef);
	const modules = Object.keys(moduleData?.modules ?? {});
	const [submissions] = useCollectionDataOnce(
				db
				.collection("submissions")
				.where("uid", "==", (userId ? userId : user?.uid))
				.limit(10),
		
				{ idField: 'id' },
			); 


	if(auth.currentUser == null)
		return (
			<Link to='/'>
			</Link>
		)

	
	
	return (
		<div>
			

			<Container maxWidth="sm">

				<UserProfile userData={userData} />

				<Typography variant="h4" component="h3" gutterBottom>
					Knowledge Profile
				</Typography>
				
				{modules &&
						modules.filter(module => userData?.modulePermissions[module]).map(module => (
							<Module key={module} module={module} value={value}/>
						))}
				<Typography variant="h4" component="h3" gutterBottom style={{marginTop:'1.5rem'}}>
					Past Tests
				</Typography>

				<PastTests submissions={submissions} />


			</Container>
		</div>
	);
};
