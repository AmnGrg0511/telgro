import { db } from '../firebase/fire';
import { Container, Typography, List,} from '@material-ui/core';
import {  useParams } from 'react-router-dom';
import { useCollectionDataOnce,useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { Module } from '../components/Module';

const batchRef = db.doc('data/batches');


export const AnalyseBatch = () => {
	const {batch} = useParams();
    const [batchesValue] = useDocumentDataOnce(batchRef);
	const modules = [batchesValue?.batches[batch]?.module];
	let [users] = useCollectionDataOnce(
		db
			.collection('users')
			.where('valid', '==', true)
			.limit(10),
		{ idField: 'id' },
	);
	users = users?.filter(user=>user.batches)?.filter(user=>user.batches[batch])?.map(user=>user.id);
    let [profiles] = useCollectionDataOnce(
		db.collection("knowledgeProfiles")
            .orderBy("scores", "asc")
			.limit(10),
			{ idField: 'id' },
	);
	profiles = profiles?.filter(profile=>users?.includes(profile.id));
	return (
		
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>
			<Typography variant="h4" component="h2">
				Analyse Batch
			</Typography>
		
		
			
				
			{modules.map(module=>
				<List component="nav">
					<Module key={module} module={module} profiles={profiles}/>
				</List>)}	
			
		</Container>

	);
};