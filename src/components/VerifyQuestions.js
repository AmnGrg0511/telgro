import styled from 'styled-components';
import { QuestionList } from '../components/QuestionList';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/fire';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { Loader } from './Loader';
import { UnAuthorized } from '../pages/Unauthorized';
import { Container } from '@material-ui/core';

const Layout = styled.div`
	/* display: grid;
	grid-template-columns: 1fr 1fr; */
	align-items: stretch;
`;

export const ShowUnverifiedQuestions = () => {
	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));

	if(userData === undefined) {
		return <Loader />
	}

	if(userData.type !== 'moderator') {
		return <UnAuthorized />
	}

	return (
		<div>
			<Container maxWidth="md" style={{ marginTop: '2rem' }}>
				{userData?.type === 'moderator' && <QuestionList verifyQuestions={true} report={true}/>}
			</Container>
			{/* <FabLink variant="extended" to={`/quiz/${topic}/${subtopic}`}>
				<QuizIcon style={{ marginRight: '1rem' }} /> Quiz
			</FabLink> */}
		</div>
	);
};
