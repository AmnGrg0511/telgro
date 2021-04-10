import { Redirect } from 'react-router-dom';

export function Topics() {

	// if(user && !user.emailVerified) {
	// 	return <EmailVerification />
	// }

	return (
		<Redirect to='/module' />
		// <Container maxWidth="md" style={{ marginTop: '2rem' }}>
		// 	<Typography variant="h4" component="h2">
		// 		Topics
		// 	</Typography>

		// 	<List component="nav">
		// 		{topics &&
		// 			topics.map(topic => (
		// 				<ListItemLink key={topic} to={`/${topic}`}>
		// 					<ListItemText primary={topic} />
		// 				</ListItemLink>
		// 			))}
		// 	</List>
			
		// </Container>
	);
}
