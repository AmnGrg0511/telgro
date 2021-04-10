import { db, auth } from '../firebase/fire';
import { useParams } from 'react-router-dom';
import {useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react'

import {
	Container,
    Button, TextField, Checkbox, Grid, styled, InputAdornment
} from '@material-ui/core';

import {
	DatePicker,
	MuiPickersUtilsProvider,
	TimePicker
} from '@material-ui/pickers'

import DateFnsUtils from '@date-io/date-fns';
import { Autocomplete } from '@material-ui/lab';
import { useForm } from 'react-hook-form';
import { BlurOn, CloudUpload,DescriptionOutlined } from '@material-ui/icons';


const FormField = styled(TextField)`
  margin-bottom: 1rem;
`;

export function EditCustomTest() {

	const {testId} = useParams();

	const [user] = useAuthState(auth);

	const [moduleValue] = useDocumentDataOnce(db.collection('data').doc('modules'));
	
	const modules = Object.keys(moduleValue?.modules || {});
	
	const [scheduled, setScheduled] = useState(false);
	const [startTime, setStartTime] = useState(new Date());
	const [endTime, setEndTime] = useState(new Date());
	
	// const [formData, setFormData] = useState({
	// 	name: '',
	// 	timestamp: new Date(),
	// 	scheduled: false,
	// 	startTime: new Date(),
	// 	endTime: new Date(),
	// 	description: '',
	// 	module: '',
	// 	activated: false
	// })

	// const setData = current => {
	// 	setFormData(prev => ({ ...prev, ...current }));
	// };
	

	

	
	const onSubmit = async data => {
		// event.preventDefault();
		
		// console.log("New Form: ", formData)

		if(scheduled) {
			if(startTime < new Date())
			{
				alert('Start time needs to be in future');
				return;
			}

			if(endTime <= startTime) {
				alert('End time needs to be after start time');
				return;
			}
		}
		else
		{
			setStartTime(null);
			setEndTime(null);
		}

		try {
		
			await db.collection('customTests').doc(testId).update({
				...data.customTest,
				isScheduled: scheduled,
				startTime: startTime,
				endTime: endTime
			})

		// 	console.log("inserted Test Id: ", testId);


		// // if(Object.keys(value?.customTests ?? {}).length == 0 ) {
		// // 	await db.collection('customTests').doc(user.uid).set({
		// // 		'customTests' : {
		// // 			[formData.name.trim()] : {
		// // 				'timestamp' : formData.timestamp
		// // 			}
		// // 		}
		// // 	})	
		// // } else {
		// // 	await db.collection('customTests').doc(user.uid).update({
		// // 		[`customTests.${formData.name.trim()}`] : {
		// // 			'timestamp' : formData.timestamp
		// // 		}
		// // 	})
		// // }
		}
		catch {

		}
		
		
		// setValue({
		// 	name: '',
		// 	timestamp: new Date()
		// })	
		alert(`${customTest.name} is updated`);
		window.location.reload();
		
	};


	const defaultValues = {
		customTest : {
			name : '',
			timestamp : new Date(),
			user : user.uid,
			isScheduled : '',
			startTime : '',
			endTime : '',
			module : ''
		}
	};

	let { register, handleSubmit, setValue, watch } = useForm({
		defaultValues,
	});

	const customTest = watch('customTest', null);

	useEffect(() => {
		const loadData = async () => {
			const data = await db.collection('customTests').doc(testId).get();
			const customTest = data.data();
			setValue('customTest', customTest);
			setScheduled(customTest.isScheduled)
			setStartTime(customTest?.startTime?.toDate())
			setEndTime(customTest?.endTime?.toDate())
		};

		if (testId) {
			loadData();
		}
	}, [testId, setValue]);
	

    return(

		<Container maxWidth="md" style={{ marginTop: '2rem' }}>

			<form
				onSubmit={handleSubmit(onSubmit)}
				style={{
					display: 'grid',
					gap: '1rem',
				}}
			
			>
				
				<FormField
					InputProps={{
						startAdornment: (
						<InputAdornment position="start">
							<BlurOn />
						</InputAdornment>
						),
					}}
					name="customTest.name"
					placeholder='Name'
					required
					inputRef={register}
				/>

				<FormField
					InputProps={{
						startAdornment: (
						<InputAdornment position="start">
							<DescriptionOutlined />
						</InputAdornment>
						),
					}}
					name="customTest.description"
					required
					placeholder="Description"
					inputRef = {register}
				/>

				<div>
					<Checkbox
						name="customTest.isScheduled"
						inputRef={register}
						
						checked={scheduled}
						inputProps={{ 'aria-label': 'primary checkbox' }}
						onChange={event => {setScheduled(event.target.checked); }}
					/>
				Scheduled
				</div>

				{
					scheduled &&
					<MuiPickersUtilsProvider utils={DateFnsUtils}>
					<Grid container justify="space-around">
					  <DatePicker
						  name="customTest.startTime"
						  minDate={new Date()}
						  minDateMessage={'Date cannot be less than today'}
						margin="normal"
						label="Start Date"
						inputRef={register}
						value={startTime}
						onChange={date => setStartTime(date)}
					  />
					 <TimePicker
						margin="normal"
						label="Start Time"
						name="customTest.startTime"
						inputRef={register}
						value={startTime}
						onChange={date=> { setStartTime(date)}}
					/>
					</Grid>
				  </MuiPickersUtilsProvider>
				}

				{
					scheduled &&
					<MuiPickersUtilsProvider utils={DateFnsUtils}>
					<Grid container justify="space-around">
					  <DatePicker
					  	minDate={new Date()}
						margin="normal"
						inputRef={register}
						label="Terminate Date"
						name="customTest.endTime"
						value = {endTime}
						onChange={date => setEndTime(date)}
					  />
					 <TimePicker
						margin="normal"
						label="Terminate Time"
						inputRef = {register}
						name="customTest.endTime"
						value={endTime}
						onChange={date => setEndTime(date)}
					/>
					</Grid>
				  </MuiPickersUtilsProvider>
				}

				<Autocomplete
					options={modules}
					getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Module" />}
					
					inputRef={register}
					name="customTest.module"
					
				/>

				<Button type="submit" variant="contained" color="secondary" startIcon={<CloudUpload/>}>
					Update
				</Button>

			</form>

		</Container>
	)

}