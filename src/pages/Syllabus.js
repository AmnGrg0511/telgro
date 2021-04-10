import { db, auth } from '../firebase/fire';
import { Container, Typography, List } from '@material-ui/core';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { Module } from '../components/Module';
import { AccountTree } from '@material-ui/icons';

const moduleRef = db.doc('data/modules');




export const Syllabus = () => {

	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user.uid));

	const [value] = useDocumentDataOnce(moduleRef);
		let modules = Object.keys(value?.modules ?? {});
		modules = modules?.filter(module=>userData?.modulePermissions[module]);
	return (
		
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			<Typography variant="h4" component="h2">
				<AccountTree style={{fontSize:'2rem', margin:'1rem'}}/>Syllabus
			</Typography>
		
		 
			
				
	
				<List component="nav">
					{modules &&
						modules.map(module => (
							<Module key={module} module={module} syllabus={true}/>
						))}
				</List>
				
			
		</Container>

	);
};