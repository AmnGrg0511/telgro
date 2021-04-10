import React, { useState } from 'react';
import {
    Container, Typography, Button, DialogTitle, Dialog
} from '@material-ui/core';
import { 
	ListItem, 
    Table,
    TableCell,
    TableBody,
    TableRow,
	Card,
	ThemeProvider,
	TableHead
	} from '@material-ui/core';
import { db } from '../firebase/fire';
import { useDocumentDataOnce, useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { Link, useParams } from 'react-router-dom';
import { Question } from './Question';
import './QuizResult.css';
import { getResources } from '../firebase/api';
import { createMuiTheme } from '@material-ui/core/styles';



export const PastTest = () => {
	const theme = createMuiTheme({
		overrides: {
			MuiTableCell: {
				root: {  //This can be referred from Material UI API documentation. 
					padding: '14px 24px',
					backgroundColor: "#ffdbc5",
					fontSize: '17px'
				},
			},
		},
	});
    const { id } = useParams();
	const [submission] = useDocumentDataOnce(
		db
        .collection("submissions")
        .doc(id)
    );
    const alphabetic = ['a','b','c','d','e','f'];
    const [allResources] = useCollectionDataOnce(
		getResources(submission?.topic, submission?.subtopic, submission?.result?.incorrectTags),
		{ idField: 'id' },
	);
	// const strengths = Object.entries(submission?.result?.tagScores ?? {}).filter(([, score]) => score > 3);
	const weaknesses = Object.entries(submission?.result?.tagScores ?? {})
	const [qAnalysis, setQAnalysis] = useState(false);
	let subtopics = {' ' : [0,0,0]};
	submission?.questions?.forEach(que => {
		subtopics[' '] = [subtopics[' '][0]+1, que.response || que.response === 0 ? subtopics[' '][1]+1 : subtopics[' '][1] ,(que.response || que.response === 0) && que.answer === que.response ? subtopics[' '][2]+1 : subtopics[' '][2]]
		if(subtopics[que.subtopic])
		subtopics[que.subtopic] = [subtopics[que.subtopic][0]+1, que.response || que.response === 0 ? subtopics[que.subtopic][1]+1 : subtopics[que.subtopic][1] ,(que.response || que.response === 0) && que.answer === que.response ? subtopics[que.subtopic][2]+1 : subtopics[que.subtopic][2]];
		else
		subtopics[que.subtopic] = [1, que.response || que.response === 0 ? 1 : 0 , (que.response || que.response === 0) && que.answer === que.response ? 1 : 0 ];
	});
	const resources = {};

	const [open, setOpen] = useState(false);

	const SimpleDialog = props => {
		const { onClose, open } = props;
	  
		const handleClose = () => {
		  onClose();
		};
	  
		return (
			
		  <Dialog onClose={handleClose} open={open} maxWidth={qAnalysis ?'lg':'sm'}>
			<DialogTitle id="Confirmation Box">{qAnalysis?'Question wise analysis of test:':'Tag wise analysis of test:'}</DialogTitle>
				{ qAnalysis ? submission?.questions?.map( (que,idx) => (<div key={idx}>
						<Question style={{ marginTop: '2rem' }} question={que} verifyButton={false} questionId={que.id} seeOptions={true}/>
						<div style={{backgroundColor:'#ddffff', margin:'.5rem', padding:'.4rem', borderLeft: '6px solid #2196F3'}}><Typography variant="h6" component="h5">
							Correct Answer: {alphabetic[que.answer]}
						</Typography></div>
						<div style={{backgroundColor:que.answer===que.response?'#ddffff':'#fccbcb', margin:'.5rem', padding:'.4rem', borderRight: que.answer===que.response?'6px solid #2196F3':'6px solid #f05454'}}><Typography style={{ textAlign: 'right' }} variant="h6" component="h5">
							{que.response || que.response===0 ? 'Your Response: ' + alphabetic[que.response] : 'Not attempted'} 
						</Typography>
						</div>
					</div>
            	))
				: <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Card>
					<ThemeProvider theme={theme}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell align='center' style={{fontWeight:'bold'}}>Tag</TableCell>
									<TableCell align='center' style={{fontWeight:'bold'}}>Score</TableCell>
									<TableCell align='center' style={{fontWeight:'bold'}}>Recommended resources</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{weaknesses?.map(([tag, tagScore]) => (<TableRow>
									<TableCell align='center' >{tag}</TableCell>
									<TableCell align='center' >{tagScore} / 5</TableCell>
									<TableCell align='center' >{resources[tag]?.map(res => (
										<ListItem key={res.id}>
											<Link
												href={res.link}
												target="_blank"
												rel="noreferrer"
											>
												{res.name}
											</Link>
										</ListItem>))}
									</TableCell>
								</TableRow>))}
							</TableBody>
						</Table>
					</ThemeProvider>
				</Card></div>}
		  </Dialog>
		);
	  }

	for (let res of allResources ?? []) {
		for (let tag of res.tags) {
			if (!resources[tag]) {
				resources[tag] = [];
			}
			resources[tag].push(res);
		}
	}
    return (
		<div>
		{open && <SimpleDialog open={open} onClose={()=>setOpen(false)} />}
        <Container maxWidth='md' style={{padding:'0 5px'}}>
            <Typography style={{alignItems:'center', display:'flex', margin:'1rem', fontSize:'1.4rem'}}>Topic(s) - {submission?.topic?.split('$').join(', ')}</Typography>
            <Typography style={{alignItems:'center', display:'flex', justifyContent:'center', fontSize:'1.5rem'}}>Correct responses {submission?.result?.correctCount}</Typography>
            <Typography style={{alignItems:'center', display:'flex', justifyContent:'center', fontSize:'2rem'}}>You scored {submission?.result?.score?.score}/{submission?.result?.score?.outOf}</Typography>
            
			<Card style = {{margin:'1rem 0'}}>
					<ThemeProvider theme={theme}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell align='center' style={{fontWeight:'bold'}}></TableCell>
									<TableCell align='center' style={{fontWeight:'bold'}}>Total Questions</TableCell>
									<TableCell align='center' style={{fontWeight:'bold'}}>Attempted</TableCell>
									<TableCell align='center' style={{fontWeight:'bold'}}>Correct</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{Object.entries(subtopics ?? {})?.map(([subtopic,[total,attempted,correct]]) => (<TableRow>
									<TableCell align='center' style={{fontWeight:'bold'}}>{subtopic}</TableCell>
									<TableCell align='center' >{total}</TableCell>
									<TableCell align='center' >{attempted}</TableCell>
									<TableCell align='center' >{correct}</TableCell>
								</TableRow>))}
							</TableBody>
						</Table>
					</ThemeProvider>
				</Card>

			<p className="noPrint" onClick={async()=>{await setQAnalysis(false); await setOpen(true);}} style={{color:'blue', cursor:'pointer'}}>See Tag wise analysis</p>
			
			<p className="noPrint" onClick={async()=>{await setQAnalysis(true); await setOpen(true);}} style={{color:'blue', cursor:'pointer'}}>See Question wise analysis</p>				
            
                <div className="noPrint">
					<Button
						variant="contained"
						color="primary"
						style={{ margin: '1rem', textTransform: 'none' }}
						onClick={(e)=>{
							window.print();
						}}
					>
						Download
					</Button>
				</div>

        </Container>
		</div>
    );
}
    
