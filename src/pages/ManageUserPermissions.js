import { auth, db} from '../firebase/fire';
import { Link, Redirect, useParams } from 'react-router-dom';
import { useDocumentData, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import styled from 'styled-components';
import { Module } from '../components/Module';
import {
    Button,
	Container,
	List,
	ListItem,
    ListItemSecondaryAction,
	ListItemText,
	Typography,
} from '@material-ui/core';
import { ADMIN_ID } from '../constants/adminConstants';
import { UnAuthorized } from './Unauthorized';
import { Notes, PlaylistAdd} from '@material-ui/icons';

const moduleRef = db.doc('data/modules');

function ListItemLink(props) {
	return <ListItem button component={Link} {...props} />;
}

const Layout = styled.div`
	/* display: grid;
	grid-template-columns: 1fr 1fr; */
	display: flex;
	align-items: stretch;
`;

export function ManageUserPermissions() {

    const {userId} = useParams();
    
    const [user] = useDocumentData(db.collection('users').doc(userId));
	
    

    const [value] = useDocumentDataOnce(moduleRef);
    
	let modules = Object.keys(value?.modules ?? {});
	const userPermissions = modules.filter(module => user?.modulePermissions && user?.modulePermissions[module]);
	modules = modules.filter(module => user?.modulePermissions === undefined || !user?.modulePermissions[module]);
    if(auth.currentUser == null) {
        return <Redirect to='/' />
    }

    if(auth.currentUser.uid !== ADMIN_ID) {
        return <UnAuthorized />
    }

	return (
		
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			<Typography variant="h4" component="h2">
				{value?.name}
			</Typography>

            <Layout>

              { 
                <Container maxWidth="md" style={{ marginTop: '2rem' }}>
                <Typography variant="h4" component="h2">
				   <Notes/> Modules
			    </Typography>

			    <List component="nav">
				    {modules &&
					    modules.map(module => (
                            
						    <ListItemLink key={module} to={`/module/${module}`} >
							    <ListItemText primary={module} />
                                <ListItemSecondaryAction>
                                    <Button onClick={() => {db.collection('users').doc(userId).update({
                                        [`modulePermissions.${module}`] : true
                                    })}}
                                    
                                    color='secondary'
                                    variant='outlined'
									startIcon={<PlaylistAdd/>}>
                                        Add
                                    </Button>
                                </ListItemSecondaryAction>
						    </ListItemLink>
                            
					))}
			    </List>
                </Container>
              }
                    
              { 
                <Container maxWidth="md" style={{ marginTop: '2rem' }}>
                <Typography variant="h4" component="h2">
				    {user?.name} Permissions
			    </Typography>

			    <List component="nav">
				    {userPermissions &&
					    userPermissions.map(userPermission => (
						    <ListItem>
								<Module module={userPermission} permission={true} user={user} userId={userId}/>
							</ListItem>
					))}
			    </List>
                </Container>
              }

            </Layout>
			{/* <List component="nav">
				{topics &&
					topics.map(topic => (
						<ListItemLink key={topic} to={`/${topic}`}>
							<ListItemText primary={topic} />
						</ListItemLink>
					))}
			</List> */}
			
		</Container>
	);
}
