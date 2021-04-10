import { Collapse, Container, List, ListItem, ListItemText } from '@material-ui/core';
import { AmpStories, Assignment, ClearAll, Collections, Dashboard, EventNote, ExpandLess, ExpandMore, PostAdd, VerifiedUser } from '@material-ui/icons';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const Moderator = () => {
	const [open, setOpen] = useState(true);
	const [open2, setOpen2] = useState(true);
	const [open3, setOpen3] = useState(true);
	return (
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			
			<List>
				<ListItem style={{padding:'1rem'}} button onClick={()=>{setOpen(prev=>!prev)}}>
					<ListItemText><ClearAll style={{margin:'.5rem'}}/>Manage</ListItemText>
        			{open ? <ExpandLess /> : <ExpandMore />}
				</ListItem>
				<Collapse in={open} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to='/add-tags'>
							<ListItemText><AmpStories style={{margin:'.5rem'}}/>Tags</ListItemText>
						</ListItem>
					</List>
				</Collapse>
				<ListItem style={{padding:'1rem'}} button onClick={()=>{setOpen2(prev=>!prev)}}>
					<ListItemText><VerifiedUser style={{margin:'.5rem'}}/>Validate</ListItemText>
        			{open2 ? <ExpandLess /> : <ExpandMore />}
				</ListItem>
				<Collapse in={open2} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to="/validate-resources" >
							<ListItemText><EventNote style={{margin:'.5rem'}}/>Resources</ListItemText>
						</ListItem>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to="/validate-questions" >
							<ListItemText><Assignment style={{margin:'.5rem'}}/>Questions</ListItemText>
						</ListItem>
					</List>
				</Collapse>
				<ListItem style={{padding:'1rem'}} button onClick={()=>{setOpen3(prev=>!prev)}}>
					<ListItemText><PostAdd style={{margin:'.5rem'}}/>Create</ListItemText>
        			{open3 ? <ExpandLess /> : <ExpandMore />}
				</ListItem>
				<Collapse in={open3} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to="/my-custom-test" >
							<ListItemText><Dashboard style={{margin:'.5rem'}}/>Custom Test</ListItemText>
						</ListItem>
					</List>
					<List component="div" disablePadding>
						<ListItem style={{padding:'1rem', paddingLeft:'4rem'}} button component={Link} to="/my-courses" >
							<ListItemText><Collections style={{margin:'.5rem'}}/>Course</ListItemText>
						</ListItem>
					</List>
				</Collapse>
				
				
				
			</List>

		</Container>
	);
};