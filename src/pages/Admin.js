import { Collapse, Container, List, ListItem, ListItemText } from '@material-ui/core';
import { AmpStories, Book, ClearAll, Comment, ExpandLess, ExpandMore, Group, LibraryBooks, MenuBook, RecentActors, VerifiedUser } from '@material-ui/icons';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const Admin = () => {

	const [open, setOpen] = useState(true);
	const [open2, setOpen2] = useState(true);
	return (
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			<List>
				<ListItem style={{padding:'1rem'}} button onClick={()=>{setOpen(prev=>!prev)}}>
					<ListItemText><ClearAll style={{margin:'.5rem'}}/>Manage</ListItemText>
        			{open ? <ExpandLess /> : <ExpandMore />}
				</ListItem>
				<Collapse in={open} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to="/manage-module" >
							<ListItemText><LibraryBooks style={{margin:'.5rem'}}/>Modules</ListItemText>
						</ListItem>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to='/add-topic' >
							<ListItemText><MenuBook style={{margin:'.5rem'}}/>Topics</ListItemText>
						</ListItem>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to='/add-subtopic' >
							<ListItemText><Book style={{margin:'.5rem'}}/>Subtopics</ListItemText>
						</ListItem>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to='/add-tags'>
							<ListItemText><AmpStories style={{margin:'.5rem'}}/>Tags</ListItemText>
						</ListItem>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to="/manage-users" >
							<ListItemText><RecentActors style={{margin:'.5rem'}}/>Users</ListItemText>
						</ListItem>
					</List>
				</Collapse>
				<ListItem style={{padding:'1rem'}} button onClick={()=>{setOpen2(prev=>!prev)}}>
					<ListItemText><VerifiedUser style={{margin:'.5rem'}}/>Validate</ListItemText>
        			{open2 ? <ExpandLess /> : <ExpandMore />}
				</ListItem>
				<Collapse in={open2} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to="/validate-users" >
							<ListItemText><Group style={{margin:'.5rem'}}/>Moderators</ListItemText>
						</ListItem>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to="/validate-posts" >
							<ListItemText><Comment style={{margin:'.5rem'}}/>Posts</ListItemText>
						</ListItem>
					</List>
				</Collapse>
				
				
			</List>

		</Container>
	);
};
