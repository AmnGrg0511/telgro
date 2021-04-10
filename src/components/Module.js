import { db, FieldValue } from '../firebase/fire';
import { List, ListItem,	ListItemText, ListItemSecondaryAction, Button } from '@material-ui/core';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useState } from 'react';
import { Topic } from './Topic';
import ExpandMoreOutlinedIcon from '@material-ui/icons/ExpandMoreOutlined';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import { Add, Remove } from '@material-ui/icons';

const moduleRef = db.doc('data/modules');
const topicRef = db.doc('data/topics');


export const Module = ({
	module,
	syllabus,
	profiles,
	value,
	permission,
	userId,
	user
	}) => {
    let [moduleData] = useDocumentDataOnce(moduleRef);
	const topics = moduleData?.modules[module]?.topics ?? [];
    const [showTopics, setShowTopics] = useState(false);
    const [topicData] = useDocumentDataOnce(topicRef);
	return (
		
			<List style={{minWidth:'100%'}}>
                <ListItem button key={module} onClick={() => setShowTopics(!showTopics)} >
					<ListItemText>{showTopics?<ExpandMoreOutlinedIcon color='primary'/>:<ChevronRightOutlinedIcon />} {module}</ListItemText>
					{permission &&<Button onClick={() => {db.collection('users').doc(userId).update({
                                        [`modulePermissions.${module}`] : FieldValue.delete()
                                    })}}
                                    
                                    color='secondary'
                                    variant='contained'>
                                        Remove
                                </Button>}
				</ListItem>
				{showTopics && topics?.map( topic => (
                    permission ? 
					<ListItem>
						<ListItemText primary={topic} />
						<ListItemSecondaryAction>
                            <Button onClick={() => {
									if(user.topicPermissions && user.topicPermissions[topic]){
										db.collection('users').doc(userId).update({
											[`topicPermissions.${topic}`] : false
										})
									} else {
										db.collection('users').doc(userId).update({
											[`topicPermissions.${topic}`] : true
										})
									}
								}
							}
                            size='small'
                            color='secondary'
							endIcon={user.topicPermissions && user.topicPermissions[topic] ? <Remove/> : <Add/>}
                            variant={user.topicPermissions && user.topicPermissions[topic] ? 'contained' :'outlined'}>
                                {user.topicPermissions && user.topicPermissions[topic] ? 'Remove' :'Add'}
                            </Button>
                        </ListItemSecondaryAction>
					</ListItem>
					: <Topic key={topic} topic={topic} data={topicData?.topics[topic] ?? {}} syllabus={syllabus} profiles={profiles} value={value} module={module}/>
                ))}
            </List>

	);
};    
                                
                                
                                