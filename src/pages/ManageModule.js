import { db } from '../firebase/fire';
import { Link } from 'react-router-dom';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import {
	Button,
	Container,
	InputAdornment,
	List,
	ListItem,
	ListItemText,
	TextField,
	Typography,
} from '@material-ui/core';
import { useState } from 'react';
import { LibraryAdd, LibraryAddCheck, LibraryBooks, Notes } from '@material-ui/icons';

const moduleRef = db.doc('data/modules');

function ListItemLink(props) {
	return <ListItem button component={Link} {...props} />;
}

export function ManageModule() {
    
	const [value] = useDocumentData(moduleRef);
    
	let modules = Object.keys(value?.modules ?? {});

	const [formData, setFormData] = useState({
        module : '',
    });

    const setData = current => {
        setFormData(prev => ({ ...prev, ...current }));
    };

    const onSubmit = event => {
		event.preventDefault();
		if(modules && modules.includes(formData.module.trim()))
		{
			alert('This module is already present');
			
        	setData({
            	module: ''
			})	
			return;
		}

		moduleRef.update({
			[`modules.${formData.module.trim()}`]: {
				topics : []
			}
		});
        
        setData({
            module: ''
        })
        
	};

	return (
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			<Typography variant="h4" component="h2">
				<Notes style={{fontSize:'2rem', margin:'1rem'}}/>Modules
			</Typography>

			<List component="nav">
				{modules &&
					modules.map(module => (
						<ListItemLink key={module} to={`/manage-module/${module}/add-topic`} >
							<LibraryBooks style={{margin:'.8rem'}}/><ListItemText primary={module} />
						</ListItemLink>
					))}
			</List>
			
			<form
				onSubmit={onSubmit}
				style={{
					display: 'grid',
					gap: '1rem',
				}}
			>

				<TextField
					InputProps={{
						startAdornment: (
						<InputAdornment position="start">
							<LibraryAdd/>
						</InputAdornment>
						),
					}}
					label="New Module"
					name="Module"
					value={formData.module}
					onChange={event => setData({ module: event.target.value })}
				/>

				<Button type="submit" variant="contained" color="secondary" startIcon={<LibraryAddCheck />}>
					Add
				</Button>
			</form>

			
		</Container>
	);
}
