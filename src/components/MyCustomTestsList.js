import { db, auth } from '../firebase/fire';
import { Link, useHistory } from 'react-router-dom';
import { useCollectionDataOnce, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState } from 'react'

import {
	Container,
	List,
	ListItem,
	ListItemText,
    Typography,
    Button, TextField, Checkbox, Grid
} from '@material-ui/core';
import { BASE_URL_PROD } from '../constants/SiteConstants';

import {
	DatePicker,
	MuiPickersUtilsProvider,
	TimePicker
} from '@material-ui/pickers'

import DateFnsUtils from '@date-io/date-fns';
import { Autocomplete } from '@material-ui/lab';
import { CreateNewFolder, Dashboard, Edit, InsertLink, } from '@material-ui/icons';
import { generateCustomTestId } from '../constants/functions';

function ListItemLink(props) {
	return <ListItem button component={Link} {...props} />;
}



export function MyCustomTestsList() {
	
	const location = useHistory();

	const [user] = useAuthState(auth);
	
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
	
	const [value] = useCollectionDataOnce(
		db.collection('customTests').where('user', '==', user?.uid).limit(10),
		{ idField: 'id' },
	);
	
	const [moduleValue] = useDocumentDataOnce(db.collection('data').doc('modules'));
	
	let modules = Object.keys(moduleValue?.modules || {});
	modules=modules.filter(module => userData?.modulePermissions && userData?.modulePermissions[module]);
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		timestamp: new Date(),
		scheduled: false,
		startTime: new Date(),
		endTime: new Date(),
		description: '',
		module: ''
	})

	if(user == null) {
		return (
			<div>
			</div>
		)
	}

	const setData = current => {
		setFormData(prev => ({ ...prev, ...current }));
	};
	
	const onSubmit = async event => {
		event.preventDefault();
		
		
		if(Object.keys(value?.customTests ?? {}).includes(formData.name.trim())) {
			alert("There is an existing test with same name");
			return;
		}

		if(formData.scheduled) {
			if(formData.startTime < new Date())
			{
				alert('Start time needs to be in future');
				return;
			}

			if(formData.endTime <= formData.startTime) {
				alert('End time needs to be after start time');
				return;
			}
		}

		try {
		
			await db.collection('customTests').add({
				'name' : formData.name.trim(),
				'timestamp' : formData.timestamp,
				'user' : user.uid,
				'isScheduled' : formData.scheduled,
				'startTime' : formData.startTime,
				'endTime' : formData.endTime,
				'module' : formData.module
			})


		// if(Object.keys(value?.customTests ?? {}).length == 0 ) {
		// 	await db.collection('customTests').doc(user.uid).set({
		// 		'customTests' : {
		// 			[formData.name.trim()] : {
		// 				'timestamp' : formData.timestamp
		// 			}
		// 		}
		// 	})	
		// } else {
		// 	await db.collection('customTests').doc(user.uid).update({
		// 		[`customTests.${formData.name.trim()}`] : {
		// 			'timestamp' : formData.timestamp
		// 		}
		// 	})
		// }
		}
		catch {

		}
		
		
		setData({
			name: '',
			timestamp: new Date()
		})	

		setShowForm(false);
	};
	
	return (

		<Container maxWidth="md" style={{ marginTop: '2rem' }}>

		{ !showForm &&
		
		<div>
			<Typography variant="h4" component="h2">
				<Dashboard style={{fontSize:'2rem', margin:'1rem'}}/>Custom Tests
			</Typography>

			<List component="nav">
				{value &&
					value.map(customTest => (
						<ListItem>
						<ListItemLink key={customTest.id} to={`/my-custom-test/${customTest.id}`}>
							<ListItemText primary={customTest.name} />
						</ListItemLink>
						<Button
									variant="outlined"
									color="secondary"
									style={{margin:'0 .1rem'}}
									startIcon={ <InsertLink/>}
									onClick={() => {alert('Test Link: ' + BASE_URL_PROD + '/start-custom-test/' + generateCustomTestId(user.uid, customTest.name))}}
								>
									Link
						</Button>
						
						<Button
							variant="outlined"
							color="secondary"
							style={{margin:'0 .1rem'}}
							startIcon={<Edit/>}
							onClick = {() => {location.push(`/custom-test/${customTest.id}/edit`)}}
						>
							Edit
						</Button>

						</ListItem>
					))}
			</List>

            <Button onClick={() => setShowForm(!showForm)} color='secondary' variant='contained' startIcon={<CreateNewFolder/>}>
                Create a new Test
            </Button>

		</div>
		}
		{
			showForm && 
			
			<form
				onSubmit={onSubmit}
				style={{
					display: 'grid',
					gap: '1rem',
				}}
			>

				<TextField
					label="Name of Test"
					name="Topic"
					value={formData.topic}
					onChange={event => setData({ name: event.target.value, timestamp: new Date() })}
				/>

				<TextField
					label="Description of Test"				
					value={formData.description}
					onChange={event => setData({description: event.target.value})}
				/>

				<div>
				<Checkbox
					label="Scheduled test"
					onChange={event => {return setData({scheduled: event.target.checked})}}
					checked={formData.scheduled}
					inputProps={{ 'aria-label': 'primary checkbox' }}
				/>
				Scheduled
				</div>

				{
					formData.scheduled &&
					<MuiPickersUtilsProvider utils={DateFnsUtils}>
					<Grid container justify="space-around">
					  <DatePicker
						  minDate={new Date()}
						  minDateMessage={'Date cannot be less than today'}
						margin="normal"
						label="Start Date"
						value={formData.startTime}
						onChange={date => setData({startTime : date})}
					  />
					 <TimePicker
						margin="normal"
						label="Start Time"
						value={formData.startTime}
						onChange={date => setData({startTime : date})}
					/>
					</Grid>
				  </MuiPickersUtilsProvider>
				}

				{
					formData.scheduled &&
					<MuiPickersUtilsProvider utils={DateFnsUtils}>
					<Grid container justify="space-around">
					  <DatePicker
					  	minDate={new Date()}
						margin="normal"
						label="Terminate Date"
						value={formData.endTime}
						onChange={date => setData({endTime : date})}
					  />
					 <TimePicker
						margin="normal"
						label="Terminate Time"
						value={formData.endTime}
						onChange={date => setData({endTime : date})}
					/>
					</Grid>
				  </MuiPickersUtilsProvider>
				}

				<Autocomplete
					options={modules}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Module" />}
					value={formData.module}
					onChange={(_, val) => setData({ module: val })}
				/>

				<Button type="submit" variant="contained" color="secondary">
					Create
				</Button>
			</form>
		}	
		</Container>
	);
}


