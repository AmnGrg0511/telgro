import { db, auth } from '../firebase/fire';
import { Link } from 'react-router-dom';
import { useCollectionDataOnce, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState } from 'react'
import {
	Container,
	List,
	ListItem,
	ListItemText,
    Typography,
	TextField
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Assignment } from '@material-ui/icons';


function ListItemLink(props) {
	return <ListItem button component={Link} {...props} />;
}

export function CustomTestsList() {
	
	const [user] = useAuthState(auth);
	
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
	
	const [value] = useCollectionDataOnce(
		db.collection('customTests')
		.where('activated', '==', true)
		.limit(10),
		{ idField: 'id' },
	);
	
	const [module, setModule] = useState('');
	
	const [moduleValue] = useDocumentDataOnce(db.collection('data').doc('modules'));
	
	let modules = Object.keys(moduleValue?.modules || {});
	modules=modules.filter(module => userData?.modulePermissions && userData?.modulePermissions[module]);

	if(user == null) {
		return (
			<div>
			</div>
		)
    }
	
	let displayTests = value;

	if(value)
	{	
		if(module !== null && module.length > 0)
			displayTests = value.filter(val => val.module === module);
		else
			displayTests = value;
	}

	return (

		<Container maxWidth="md" style={{ marginTop: '2rem' }}>

			<Typography variant="h4" component="h2">
				Custom Tests
			</Typography>

			<Autocomplete
					options={modules}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Module" />}
					value={module}
					onChange={(_, val) => setModule(val)}
			/>

			<List component="nav">
				{displayTests &&
					displayTests.map(customTest => (
						<ListItem>
						<ListItemLink key={customTest.id} to={`/custom-test/${customTest.id}`}>
							<Assignment style={{margin:'.5rem'}}/>
							<ListItemText primary={customTest.name} />
						</ListItemLink>
						</ListItem>
					))}
			</List>

		</Container>
	);
}
