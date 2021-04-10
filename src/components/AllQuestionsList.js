import { Typography } from '@material-ui/core';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { db } from '../firebase/fire';

import { Question } from './Question';

export const AllQuestionsList = ({
	testId,
	tags,
	type,
	typeOfMcq,
	language,
	addQuestionId = ()=>{}
}) => {
	let [questions] = useCollectionDataOnce(
		db
		.collection("questions")
		.where("tags", "array-contains-any", (tags.length ? tags : [""])).limit(10),
		{ idField: 'id' },
	);
	if(tags !== undefined){
		questions = questions?.filter(question => question.tags?.some(item => tags.includes(item)));
	}
	if(type){
		questions = questions?.filter(question => question.type===type);
	}

	if(typeOfMcq==='Multiple Correct'){
		questions = questions?.filter(question => question.multiple);
	}

	if(language){
		questions = questions?.filter(question => question.language === language || (!question.language && language === 'हिन्दी'));
	}
	return (<div>

		<Typography variant="h4" component="h2" gutterBottom>
			Questions
		</Typography>
		<div
			style={{
				height: '100%',
				overflow: 'scroll',
				maxHeight: '50vh',
				flex: 1,
			}}
		>
			{questions &&
				questions.map(que => (
					<Question key={que.id} style={{ marginTop: '1rem' }} question={que} addButton = {true} questionId={que.id} testId={testId} addQuestionId={addQuestionId}/>
				))}
		</div></div>
	);
};
