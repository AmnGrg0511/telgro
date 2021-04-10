import { Container, Typography, TextField, Button, List, ListItem, ListItemText } from '@material-ui/core';
import {db} from '../firebase/fire'
import { Link} from 'react-router-dom';
import { useState } from 'react';
import { useDocumentData, useDocumentDataOnce, useCollectionData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';
import { Autocomplete } from '@material-ui/lab';
import { Delete, GroupAdd, PostAdd, MenuBook, PeopleAltOutlined, PersonAdd } from '@material-ui/icons';
const topicRef = db.doc('data/topics');
const moduleRef = db.doc('data/modules');

const batchRef = db.doc('data/batches');
function ListItemLink(props) {
	return <ListItem button component={Link} {...props} />;
}
export const AddTopicToModule = () => {

    const [value, loading, error] = useDocumentData(topicRef);
	const {module} = useParams();
    const [batchesValue] = useDocumentData(batchRef);
    let batches = Object.keys(batchesValue?.batches ?? {});
    batches = batches?.filter(batch=>batchesValue?.batches[batch]?.module === module);
    const [newBatch, setNewBatch] = useState();
	const [moduleValue] = useDocumentDataOnce(moduleRef);
    let [users] = useCollectionData(
        db
			.collection("users")
			.where("modulePermissions."+module, "==", false),
        { idField: 'id' },
    );
	let moduleTopics = moduleValue?.modules[module]?.topics ?? [];

    const [formData, setFormData] = useState({
        topic : '',
    });

    const allTopics = Object.keys(value?.topics ?? {});

    const setData = current => {
        setFormData(prev => ({ ...prev, ...current }));
    };

    const Submit = (event) => {
		event.preventDefault();
        if(batches && batches.includes(newBatch.trim()))
		{
			alert('This batch is already present');
			
        	setNewBatch('');
			return;
		}

		batchRef.update({
			[`batches.${newBatch.trim()}`]: {module:module}
		});
        
        setNewBatch('');
    }

    const onSubmit = async event => {
		event.preventDefault();
		if(moduleTopics && moduleTopics.includes(formData.topic.trim()))
		{
			alert('This topic is already present');
			
        	setData({
            	topic: ''
			})	
			return;
        }
        
        if(formData.topic.trim().length === 0)
        {
            return;
        }

        moduleTopics.push(formData.topic.trim());
		await moduleRef.update({
			[`modules.${module}.topics`]: moduleTopics
		});
        
        
        

        setData({
            topic: ''
        })
        window.location.reload();
       
        
	};

	

	return (
		<Container maxWidth="sm" style={{ marginTop: '2rem' }}>
			

            <Typography variant="h4" component="h2">
				Manage topics of {module}
			</Typography>

            {error && <strong>Error: {JSON.stringify(error)}</strong>}
			{loading && <span>Document: Loading...</span>}
            

            
            <List component="nav">
				{moduleTopics &&
					moduleTopics.map(topic => (
						<ListItem>
							<ListItemText ><MenuBook style={{margin:'.8rem'}}/> {topic}</ListItemText>
                            <Button onClick={async () => {
                                const i = moduleTopics.indexOf(topic);
                                if(i > -1) 
                                    moduleTopics.splice(i, 1);

                                await moduleRef.update({
                                    [`modules.${module}.topics`]: moduleTopics
                                });
                                
                                window.location.reload();
								
                                
                            }} startIcon={<Delete/>} color='secondary'>
                                Remove
                            </Button> 
						</ListItem>
					))}
			</List>

			<form
				onSubmit={onSubmit}
				style={{
					display: 'grid',
					gap: '1rem',
				}}
			>

				<Autocomplete
                    options={allTopics}
                    getOptionLabel={option => option}
					renderInput={params => <TextField {...params} label="Topic" />}
                    value={formData.topic}
                    onChange={(_, val) => setData({ topic: val })}
				/>

				<Button type="submit" variant="contained" color="secondary" startIcon={<PostAdd/>}>
					Add topic
				</Button>
			</form>


            <Typography variant="h4" component="h2" style={{marginTop:'1rem'}}>
				Batches
			</Typography>

			<List component="nav">
				{batches &&
					batches.map(batch => (
						<ListItemLink key={batch} to={`/manage-batch/${batch}`} >
							<ListItemText ><PeopleAltOutlined style={{margin:'.8rem'}}/>{batch}</ListItemText>
                            
						</ListItemLink>

					))}

			</List>	
            
            <form
				onSubmit={Submit}
				style={{
					display: 'grid',
					gap: '1rem',
				}}
			>

				<TextField
					label="New Batch"
					name="Batch"
					value={newBatch}
					onChange={event => setNewBatch(event.target.value)}
				/>

				<Button type="submit" variant="contained" color="secondary" startIcon={<GroupAdd/>}>
					Add Batch
				</Button>
			</form>

			<Typography variant="h4" component="h2" style={{marginTop:'2rem'}}>
				Users requested for {module}
			</Typography>

            <List component="nav">
				{users &&
					users.map(user => (
						<ListItem key={user.id}>
                            <ListItemText primary={`${user.name} (${user.email})`} />
                            <Button onClick={ async () => {await db.collection('users').doc(user.id).update({
                                [`modulePermissions.${module}`] : true
                            })
                        
                            alert(`${user.name} (${user.email}) is added to ${module}`);}
                        }
                            
                            color='secondary'
                            variant='contained'
							startIcon={<PersonAdd/>}>
                                Add
                            </Button>
                        </ListItem>
					))}
			</List>


		</Container>
	);
};
