import { db } from '../firebase/fire';
import { useParams } from 'react-router-dom';
import { useCollectionDataOnce} from 'react-firebase-hooks/firestore';
import {
	Container,
	Typography,
} from '@material-ui/core';
import { Question } from '../components/Question';

const stringSimilarity = require("string-similarity");


export function SimilarQuestions() {

    const {quesId} = useParams()

    let [questions] = useCollectionDataOnce(
		db
            .collection('questions')
            .limit(10),
		{ idField: 'id' },
    );
    
    questions = questions?.filter(que => que.id === quesId || que.valid === true)


    let questionsList = []

    let quesTexts = [];
    let queryQuestion = undefined;
    questions?.forEach(que => {
        if(que.id === quesId) { 
            queryQuestion = que;
        } else {
            questionsList.push(que)
            quesTexts.push(que.text);
        }
        
    })


    var similarityCompared = undefined;
   
    if(queryQuestion !== undefined) {
        similarityCompared = stringSimilarity.findBestMatch(queryQuestion?.text, quesTexts);
    }

    let similarQuestions = []
    for(const q in similarityCompared?.ratings) {
        const rating = similarityCompared.ratings[q].rating;
        if(rating >= 0.6) {
            questionsList[q].rating = rating;
            similarQuestions.push(questionsList[q]);
        }
    }
    // let [value, loading, error] = useDocumentDataOnce(moduleRef);
    // console.log(value?.modules[moduleName] ?? [])
	// const topics = value?.modules[moduleName]?.topics ?? [];

	// const [user] = useAuthState(auth);
	// const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
	
	// if(userData === undefined) {
	// 	return <Loader />
	// }
	// console.log(userData)
	// if((userData.modulePermissions === undefined) || userData.modulePermissions[moduleName] === undefined) {
	// 	return(
	// 		<UnAuthorized />
	// 	)
	// }


	return (
		<Container maxWidth="md" style={{ marginTop: '2rem' }}>

        
			<Typography variant="h4" component="h2">
				Similar Questions
			</Typography>

            {/* {
                queryQuestion &&
                <Question key={queryQuestion.id} style={{ marginTop: '1rem' }} question={queryQuestion} questionId={queryQuestion.id}/>
            } */}
			
				{similarQuestions &&
					similarQuestions.map(que => (
            
                           <Question key={que.id} style={{ marginTop: '1rem' }} question={que} questionId={que.id}/>
            
						
					))}
			
			
		</Container>
	);
}
