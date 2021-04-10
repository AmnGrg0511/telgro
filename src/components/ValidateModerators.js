import { ListItemSecondaryAction, TextField, Typography, Container, List } from '@material-ui/core';
import { useCollectionData, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { auth, db } from '../firebase/fire';
import { ListItem, ListItemText, Button } from '@material-ui/core';
import { ADMIN_ID } from '../constants/adminConstants';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader } from './Loader';
import { UnAuthorized } from '../pages/Unauthorized';
import { useState } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { Beenhere } from '@material-ui/icons';


export const ValidateModerators = () => {
	let [users] = useCollectionData(
		db
			.collection('users')
			.where('valid', '==', false)
			.limit(10),
		{ idField: 'id' },
	);
	
	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));

	
	
	const handleVerifyUser =  (userId) => {
		db.collection('users').doc(userId).update({
			valid: true
		})


	}
		let options=[];
		options = users?.map(user=>user.name);
        options = options?.concat(users.map(user=>user.email));
        
        const [selectedUser, setUser] = useState(null);

        if(selectedUser){
            users = users?.filter(aUser=>aUser.name===selectedUser||aUser.email===selectedUser)
        }

	
		if(user === undefined || userData === undefined) {
			return <Loader />
		}

		if(user.uid !== ADMIN_ID) {
			return <UnAuthorized />
		}

	return (

		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			<Autocomplete
				style={{margin:'1.5rem'}}
				options={options}
				getOptionLabel={option => option}
				renderInput={params => <TextField {...params} label="Search Users" />}
				value={user}
				onChange={(_, val) => setUser( val )}
			/>
		<div
			style={{
				height: '100%',
				maxHeight: '100vh',
				flex: 1,
			}}
		>
			<Typography variant="h4" component="h2" gutterBottom>
				Invalid Moderators
			</Typography>
			<List component='nav'>
			{users &&
				users.map(que => (
					<ListItem>
                       <ListItemText primary={que.name + ' ( ' + que.email + ' )'}></ListItemText>
						<ListItemSecondaryAction>
							<Button
								variant='outlined'
								color='secondary'
								onClick={() => handleVerifyUser(que.id)}
								startIcon={<Beenhere/>}>
								verify
							</Button>
						</ListItemSecondaryAction>
                    </ListItem>
				))}
			</List>
		</div>

		</Container>
	);
};
