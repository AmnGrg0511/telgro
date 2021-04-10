import { auth, db, FieldValue, storage } from '../firebase/fire';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { TagInput } from '../components/TagInput';
import {
	Box,
	Button,
	Container,
	InputAdornment,
	MenuItem,
	TextField,
	Typography,
} from '@material-ui/core';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { ApproveResources } from '../components/ApproveResources';
import { UnAuthorized } from './Unauthorized';
import { Loader } from '../components/Loader';
import {AddToPhotos, BookmarkBorder, Description, Duo, Link, Translate } from '@material-ui/icons';

const FormField = styled(TextField)`
	margin-bottom: 1rem;
`;

const languages = ['हिन्दी', 'English']

export const AddResources = () => {
	const location = useHistory();
	const [name, setName] = useState('');
	const [type, setType] = useState('link');
	let [link, setLink] = useState('');
	const [pdf, setPdf] = useState(undefined);
	const [tags, setTags] = useState([]);
	const [language, setLanguage] = useState('हिन्दी');
	const { moduleName, topic, subtopic, id } = useParams();
	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));

	useEffect(() => {
		const loadData = async () => {
			const resource = (await db.collection('resources').doc(id).get()).data();
			setName(resource?.name);
			setType(resource?.type);
			setLink(resource?.link);
			setLanguage(resource?.language);
			setTags(resource?.tags);
		};

		if (id) {
			loadData();
		}
	}, [id]);

	const onSubmit = event => {
		event.preventDefault();
		if(id){
			if(type==='pdf'){
				const storageRef = storage.ref('resources/pdfs/'+pdf.name);
				storageRef.put(pdf).then(()=>{
					storageRef.getDownloadURL().then((Url)=>{
						link=Url;
						db.collection('resources').doc(id)
							.update({
								name,
								type,
								link,
								tags,
								topic,
								subtopic,
								language,
								user : auth.currentUser.uid,
								approved: userData?.type === 'moderator',
								Reported : FieldValue.delete(),
							})
							.then(()=>{
								location.push(`/module/${moduleName}/validate-resources/${topic}/${subtopic}`);
							});
					})
				})
			}else{
				db.collection('resources').doc(id)
					.update({
						name,
						type,
						link,
						tags,
						topic,
						subtopic,
						language,
						user : auth.currentUser.uid,
						approved: userData?.type === 'moderator',
						Reported : FieldValue.delete(),
					})
					.then(()=>{
						location.push(`/module/${moduleName}/validate-resources/${topic}/${subtopic}`);
					});
				}
			
		}
		else{	
			if(type==='pdf'){
				const storageRef = storage.ref('resources/pdfs/'+pdf.name);
				storageRef.put(pdf).then(()=>{
					storageRef.getDownloadURL().then((Url)=>{
						link=Url;
						const data = {
							name,
							type,
							link,
							tags,
							topic,
							subtopic,
							language,
							user : auth.currentUser.uid,
							approved: userData?.type === 'moderator',
						};
						db.collection('resources')
							.add(data)
							.then(function () {
								alert('Resource added successfully!');
								setName('');
								setType('link');
								setLink('');
								setLanguage('हिन्दी');
								setTags([]);
							});
					})
				})
			}else{
				const data = {
					name,
					type,
					link,
					tags,
					topic,
					subtopic,
					language,
					user : auth.currentUser.uid,
					approved: userData?.type === 'moderator',
				};
				db.collection('resources')
					.add(data)
					.then(function () {
						alert('Resource added successfully!');
						setName('');
						setType('link');
						setLink('');
						setLanguage('हिन्दी')
						setTags([]);
					});
				}}
	};

	const typeOptions = ['link', 'pdf', 'video'];

	if(userData === undefined) {
		return <Loader />
	}
	if(!id){
		if((userData.modulePermissions === undefined) || userData.modulePermissions[moduleName] === undefined) {
		return(
			<UnAuthorized />
		)
	}}

	return (
		<Container maxWidth="sm">
			<form onSubmit={onSubmit}>
				<Typography variant="h4" component="h2" gutterBottom style={{ marginTop: '2rem' }}>
					<AddToPhotos style={{margin:'1rem'}}/>Add Resources
				</Typography>

				<Box display="flex" justifyContent="center">
					<FormField
						InputProps={{
							startAdornment: (
							<InputAdornment position="start">
								<BookmarkBorder />
							</InputAdornment>
							),
						}}
						label="Name"
						value={name}
						required
						onChange={e => setName(e.target.value)}
						style={{ flex: '1' }}
					/>
					<Box
						display="flex"
						alignItems="baseline"
						justifyContent="center"
						paddingBottom="1rem"
						paddingLeft="2rem"
					>
						<FormField
							select
							InputProps={{
								startAdornment: (
								  <InputAdornment position="start">
									{type === 'link' ? <Link/> : (type === 'pdf' ? <Description/> : <Duo/>)}
								  </InputAdornment>
								),
							  }}
							label="Type"
							required
							style={{ flex: '1', minWidth: 250 }}
							value={type}
							onChange={e => setType(e.target.value)}
						>
							{typeOptions.map(type => (
								<MenuItem key={type} value={type}>
									{type}
								</MenuItem>
							))}
						</FormField>
					</Box>
				</Box>
				{type==='link'?<Box display="flex" justifyContent="center" style={{marginBottom:'1rem'}}>
					<FormField
						InputProps={{
							startAdornment: (
							<InputAdornment position="start">
								{type === 'link' ? <Link/> : (type === 'pdf' ? <Description/> : <Duo/>)}
							</InputAdornment>
							),
						}}
						label="Link"
						value={link}
						type="url"
						fullWidth
						required
						inputMode="url"
						placeholder="paste url"
						onChange={e => setLink(e.target.value)}
					/>
				</Box>
				:<Box display="flex" justifyContent="center" style={{margin:'1rem 0'}}>
					<FormField
						InputProps={{
							startAdornment: (
							<InputAdornment position="start">
								{type === 'link' ? <Link/> : (type === 'pdf' ? <Description/> : <Duo/>)}
							</InputAdornment>
							),
						}}
						type="file"
						fullWidth
						required
						inputMode="file"
						placeholder="upload pdf"
						onChange={e => setPdf(e.target.files[0])}
					/>
				</Box>}

				<Box
					display="flex"
					alignItems="baseline"
					style={{marginBottom:'1rem'}}
				>
					<TagInput
						tags={tags}
						topic={topic}
						subtopic={subtopic}
						value={tags}
						onChange={setTags}
					/>
				</Box>
				<Box
					display="flex"
					alignItems="baseline"
					style={{margin:'1rem'}}
				>
					<FormField
					InputProps={{
						startAdornment: (
						  <InputAdornment position="start">
							<Translate />
						  </InputAdornment>
						),
					  }}
						select
						required
						style={{ flex: '1', maxWidth: 250, margin:'1rem' }}
						value={language}
						onChange={e => setLanguage(e.target.value)}
					>
						{languages.map(language => (
							<MenuItem key={language} value={language}>
								{language}
							</MenuItem>
						))}
					</FormField>
				</Box>
				<Box display="flex" justifyContent="center" paddingBottom="3rem">
					<Button variant="contained" color="primary" type="submit">
						Submit
					</Button>
				</Box>
			</form>

			{userData?.type === 'moderator' && !id && <ApproveResources />}
		</Container>
	);
};
