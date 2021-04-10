import {
	Button,
	List,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	Typography,
	ListItemAvatar,
	Avatar,
} from '@material-ui/core';
import DocIcon from '@material-ui/icons/DescriptionOutlined';
import VideoIcon from '@material-ui/icons/VideoLibrary';
import LinkOutlinedIcon from '@material-ui/icons/LinkOutlined';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/fire';
import { Beenhere } from '@material-ui/icons';

function ListItemLink(props) {
	return <ListItem button component="a" {...props} />;
}

export const ApproveResources = () => {
	const { topic, subtopic } = useParams();
	const [resources] = useCollectionDataOnce(
		db
			.collection('resources')
			.where('topic', '==', topic)
			.where('subtopic', '==', subtopic)
			.where('approved', '==', false)
			.limit(10),
		{ idField: 'id' },
	);

	const approve = id => {
		db.collection('resources').doc(id).update({ approved: true });
	};

	return (
		<div>
			{resources?.length > 0 && <Typography variant="h4" component="h2" gutterBottom>
				<Beenhere style={{margin:'1rem 1rem 1rem 2rem'}}/>Approve Resources
			</Typography>}

			<List component="nav">
				{resources &&
					resources.map(res => (
						<ListItemLink key={res.id} href={res.link} target="_blank">
							<ListItemAvatar>
								<Avatar>
									{res.type === 'pdf' && <DocIcon />}
									{res.type === 'link' && <LinkOutlinedIcon />}
									{res.type === 'video' && <VideoIcon />}
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={res.name} />
							<ListItemSecondaryAction>
								<Button
									variant="outlined"
									color="secondary"
									onClick={() => approve(res.id)}
								>
									Approve
								</Button>
							</ListItemSecondaryAction>
						</ListItemLink>
					))}
			</List>
		</div>
	);
};
