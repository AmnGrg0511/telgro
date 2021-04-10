import { auth, db } from '../firebase/fire';
import { useParams } from 'react-router-dom';
import { useDocumentDataOnce, useCollectionData } from 'react-firebase-hooks/firestore';
import {
    Button,
	Container,
	List,
	ListItem,
	ListItemText,
	Typography,
    TextField
} from '@material-ui/core';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UnAuthorized } from './Unauthorized';
import { Loader } from '../components/Loader';
import { useState } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { ADMIN_ID } from '../constants/adminConstants';
import { PersonAdd } from '@material-ui/icons';


export function AddUserToBatch() {
    
    const {batch} = useParams()
    
    let [users] = useCollectionData(
        db
            .collection('users')
            .where('valid', '==', true)
            .limit(10),
        { idField: 'id' },
    );

    // let [value, loading, error] = useDocumentDataOnce(batch);
    
    // console.log(value?.batches[batch] ?? [])

	// const topics = value?.modules[moduleName]?.topics ?? [];

	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
	let options=[];
		options = users?.map(user=>user.name);
        options = options?.concat(users.map(user=>user.email));
        
        const [selectedUser, setUser] = useState(null);

        if(selectedUser){
            users = users?.filter(aUser=>aUser.name===selectedUser||aUser.email===selectedUser)
        }
	if(userData === undefined) {
        return <Loader />;
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
			<Typography variant="h4" component="h2">
				Students requested for batch
			</Typography>

            <List component="nav">
				{users &&
					users.filter(user => user.batches?.[batch]===false).map(user => (
						<ListItem key={user.id}>
                            <ListItemText primary={`${user.name} (${user.email})`} />
                            <Button onClick={ async () => {await db.collection('users').doc(user.id).update({
                                [`batches.${batch}`] : true
                            })
                        
                            alert(`${user.name} (${user.email}) is added to ${batch}`);}
                        }
                            
                            color='secondary'
                            variant='contained'>
                                Add
                            </Button>
                        </ListItem>
					))}
			</List>


            
            <Typography variant="h4" component="h2">
				Add Students to {batch}
			</Typography>

			<List component="nav">
				{users &&
					users.map(user => (
						<ListItem key={user.id}>
                            <ListItemText primary={`${user.name} (${user.email})`} />
                            <Button onClick={ async () => {await db.collection('users').doc(user.id).update({
                                [`batches.${batch}`] : true
                            })
                        
                            alert(`${user.name} (${user.email}) is added to ${batch}`);}
                        }
                            
                            color='secondary'
                            startIcon={<PersonAdd/>}
                            variant='contained'>
                                Add
                            </Button>
                        </ListItem>
					))}
			</List>

            
		</Container>
	);
}
