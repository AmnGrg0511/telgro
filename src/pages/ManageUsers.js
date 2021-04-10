import { auth, db } from '../firebase/fire';
import { Link, Redirect } from 'react-router-dom';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import {
	Container,
	List,
	ListItem,
	ListItemText,
    TextField,
	Typography,
} from '@material-ui/core';
import { useState } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { UnAuthorized } from './Unauthorized';
import { ADMIN_ID } from '../constants/adminConstants';
import { Group, Person } from '@material-ui/icons';
function ListItemLink(props) {
	return <ListItem button component={Link} {...props} />;
}

export function ManageUsers () 

    {
	    let [users] = useCollectionDataOnce(
            db
                .collection("users")
			    .orderBy("modulePermissions", "asc"),
            { idField: 'id' },
        );
        let options = users?.map(user=>user.name);
        options = options?.concat(users.map(user=>user.email));
        
        const [user, setUser] = useState(null);

        if(user){
            users = users?.filter(aUser=>aUser.name===user||aUser.email===user)
        }
        
        if(auth.currentUser == null) {
            return <Redirect to='/' />
        }
    
        if(auth.currentUser.uid !== ADMIN_ID) {
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
                <Typography variant="h4" component="h2" style={{margin:'1rem'}}>
                    <Group style={{fontSize:'2rem', margin:'1rem'}}/>Users
                </Typography>

                <List component="nav">
                    {users &&
                        users.map(user => (
                            <ListItemLink key={user.id} to={`/manage-users/${user.id}`}>
                                <ListItemText><Person style={{margin:'.5rem'}}/>{user.name + ' (' + user.email + ') '} </ListItemText>
                            </ListItemLink>
                        ))}
                </List>
                
            </Container>
        );
}
