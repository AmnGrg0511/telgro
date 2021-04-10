import { Container } from '@material-ui/core';
import { TagList } from '../components/admin/TagList';

export const AddTag = () => {
	return (
		
		<Container maxWidth="sm" style={{ marginTop: '2rem' }}>
			<TagList />
		</Container>

	);
};