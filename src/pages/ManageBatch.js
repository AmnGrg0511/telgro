import { auth, db, FieldValue } from '../firebase/fire';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useDocumentDataOnce, useCollectionData } from 'react-firebase-hooks/firestore';
import {
    Button,
	Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
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
import { Transition } from 'react-transition-group';
import { ADMIN_ID } from '../constants/adminConstants';
import { PersonAdd, Remove, Timeline } from '@material-ui/icons';

export function ManageBatch() {
    
    const location = useHistory();
    const {batch} = useParams()
    function ListItemLink(props) {
        return <ListItem button component={Link} {...props} />;
    }
    let [users] = useCollectionData(
        db
            .collection('users')
            .where('valid', '==', true)
            .limit(10),
        { idField: 'id' },
    );
    
    users = (users?.filter(user => {return user.batches !== undefined && user.batches[batch] === true}));
    

    // let [value, loading, error] = useDocumentDataOnce(batch);
    
    // console.log(value?.batches[batch] ?? [])

	// const topics = value?.modules[moduleName]?.topics ?? [];

	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
    
    const [showDeleteConfimation, setShowDeleteConfirmation] = useState(false);


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
				Students of {batch}
			</Typography>

			<List component="nav">
				{users &&
					users.map(user => (

						<ListItemLink key={user.id} to={`/profile/${user.id}`}>
                            <ListItemText primary={`${user.name} (${user.email})`} />
                            

                            <Button onClick={() => {setShowDeleteConfirmation(true)}} color='secondary' startIcon={<Remove/>}>
                                Remove
                            </Button>

                            <Dialog
                                open={showDeleteConfimation}
                                TransitionComponent={Transition}
                                keepMounted
                                onClose={() => setShowDeleteConfirmation(false)}
                                aria-labelledby="alert-dialog-slide-title"
                                aria-describedby="alert-dialog-slide-description"
                            >
                                <DialogTitle id="alert-dialog-slide-title">{`Are you sure, you want to remove ${user.name} from ${batch}`}</DialogTitle>
                                <DialogContent>
                                <DialogContentText id="alert-dialog-slide-description">
                                    {user.name} will not be able to get any updates on {batch}
                                </DialogContentText>
                                
                                </DialogContent>
                                <DialogActions>
                                <Button onClick={() => setShowDeleteConfirmation(false)} color="primary">
                                    Disagree
                                </Button>
                                <Button onClick={async () => {db.collection('users').doc(user.id).update({[`batches.${batch}`] : FieldValue.delete()}); setShowDeleteConfirmation(false)}} color="primary">
                                    Agree
                                </Button>
                                </DialogActions>
                            </Dialog>
                        </ListItemLink>
					))}
			</List>

            <Button color='secondary' variant='contained' onClick={() => location.push(`/manage-batch/${batch}/add-user`)} startIcon={<PersonAdd/>}>
                Add User
            </Button>
			
            {
                // showAddUserForm &&
                
                // <Container maxWidth="md" style={{ marginTop: '2rem' }}>
                //     <Autocomplete
                //         options={users}>
                //     </Autocomplete>

                //     <Button>
                //         Add
                //     </Button>

                //     <Button>
                //         Cancel
                //     </Button>
                // </Container>
            }

				<Button component={Link} to={`/batch-analysis/${batch}`} endIcon={<Timeline/>} variant="outlined" color="secondary" style={{margin:'1rem', textDecoration:'none', color:'red'}}>
					Analyse Batch
				</Button>
		</Container>
	);
}
