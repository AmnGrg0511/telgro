import { useState } from 'react';
import {
	Chip,
	ListItem,
	ListItemText,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/fire';
import { ADMIN_ID } from '../constants/adminConstants';
import ExpandMoreOutlinedIcon from '@material-ui/icons/ExpandMoreOutlined';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';


const SortableItem = SortableElement(({tag}) =>
  <li style={{display:'flex', listStyle:'none', margin:'.2rem'}}>
	<Chip label={tag}/>
  </li>
)
const SortableList = SortableContainer(({tags}) => {
	return (
		<ul className="row" style={{marginLeft:'2.5rem'}}>
			{tags.map((tag, index) => (
				<SortableItem key={index} index={index} tag={tag} />
			))}
		</ul>
	)
})

const SortableComponent = ({tags, onSortEnd}) => {
	return <SortableList tags={tags} onSortEnd={onSortEnd} axis="xy"/>
}

export const Subtopic = ({
	tags,
	subtopic,
	topic,
	syllabus,
	value,
	profiles,
	module,
	}) => {
    const [user] = useAuthState(auth);
    const [viewTags, setViewTags] = useState(false);
	let tagProfile;
	const location=useHistory();
	if(profiles){
		tagProfile = tags.map(tag => profiles.map(value => (((value?.scores?.[topic]?.[subtopic]?.[tag]?.['score'] ?? 0)
				/
			 (value?.scores?.[topic]?.[subtopic]?.[tag]?.['total'] ?? 1))*5).toFixed(0))
		).map(users => {
			let tagScore = [0,1,2,3,4,5];
			return tagScore.map(level => users.filter(userScore => userScore === level.toString()).length);
		});
	}

	const setTags = async (items) => {
		await db.collection('data').doc('topics').update({
			[`topics.${topic}.${subtopic}`] : items
		});
	}

	const [items, setItems] = useState(tags);

	const onSortEnd = ({ oldIndex, newIndex }) => {
		user?.uid === ADMIN_ID && oldIndex !== newIndex && setTags(arrayMove(items, oldIndex, newIndex));
		user?.uid === ADMIN_ID && oldIndex !== newIndex && setItems(arrayMove(items, oldIndex, newIndex));
		
	};

    return (
			<div>
				
				<ListItem button onClick = {() => setViewTags(!viewTags) } style = {{margin: '0 1.5rem'}}>
					<ListItemText>{viewTags?<ExpandMoreOutlinedIcon color='primary'/>:<ChevronRightOutlinedIcon />} {subtopic}</ListItemText>
				</ListItem>
				{syllabus 
				? viewTags && tags.length > 0 && 
				<div className="grid-list-container">
					{user.uid===ADMIN_ID?<SortableComponent tags={items} onSortEnd={onSortEnd}/>:
					<div style={{marginLeft:'2.5rem'}}>{items.map(tag=><Chip label={tag} style={{margin:'.2rem'}} onClick={()=>location.push(`/module/${module}/${topic}/${subtopic}/with-tag/${tag}`)}/>)}</div>}
				</div>
				: viewTags && tags.length > 0 && <TableContainer
					component={Paper}
					style={{ margin: '0 1.5rem 1rem' }}
				>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell style={{fontWeight:'bold'}}>Tag</TableCell>
								<TableCell style={{fontWeight:'bold'}} align='center' colSpan={profiles ? 6 : 1}>{profiles ? "Students" : "Level"}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{profiles && <TableRow>
									<TableCell style={{fontWeight:'bold'}} component="th" scope="row">
										{"Level"}
									</TableCell> 
										{tagProfile[0]?.map((users,level) => <TableCell align='center'>{level}</TableCell>)}
								</TableRow>}
							{tags.map((tag,idx) => (
								profiles ? <TableRow key={tag}>
									<TableCell component="th" scope="row">
										{tag}
									</TableCell> 
										{tagProfile[idx].map((users,level) => <TableCell align='center'>{users}</TableCell>)}
								</TableRow> : 
								<TableRow key={tag}>
									<TableCell component="th" scope="row">
										{tag}
									</TableCell> 
									
									<TableCell align='center'>
										{(((value?.scores?.[topic]?.[subtopic]?.[tag]?.['score'] ?? 0)
											/
										 (value?.scores?.[topic]?.[subtopic]?.[tag]?.['total'] ?? 1))*5).toFixed(0)}/5
									</TableCell>

								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>}
			</div>)
}