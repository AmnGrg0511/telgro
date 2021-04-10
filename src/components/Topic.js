import { useState } from 'react';
import {
	ListItem,
	ListItemText,
} from '@material-ui/core';
import {Subtopic} from './Subtopic';
import ExpandMoreOutlinedIcon from '@material-ui/icons/ExpandMoreOutlined';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';

export const Topic = ({
	data,
	topic,
	syllabus,
	value,
	profiles,
	module
	}) => {
	const [viewSubtopic, setViewSubtopic] = useState(false);
	//console.log(data);

    return (<div>
		
		<ListItem button onClick = {() => setViewSubtopic(!viewSubtopic) } style = {{margin: '0 .5rem'}}>
			<ListItemText>{viewSubtopic?<ExpandMoreOutlinedIcon color='primary' />:<ChevronRightOutlinedIcon />} {topic}</ListItemText>
		</ListItem>
		
		{viewSubtopic && Object.entries(data ?? {}).map(([subtopic, tags]) => (
			<Subtopic key={subtopic} subtopic={subtopic} tags={tags} topic={topic} syllabus={syllabus} value={value} profiles={profiles} module={module}/>
		))}
    </div>)
}