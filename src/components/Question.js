import {
	Button,
	Chip,
	Collapse,
	FormControl,
	FormControlLabel,
	Paper,
	Radio,
	RadioGroup,
	Typography,
} from '@material-ui/core';
import React from 'react';
import { MathDisplay } from './MathDisplay';
import { useState } from 'react';
import {db} from '../firebase/fire'
import { Add, Beenhere, Compare, ReportProblem } from '@material-ui/icons';
import { NUM_VERIFICATION_MODERATOR } from '../constants/generalConstants';
import { Loader } from './Loader';
import { useHistory } from 'react-router-dom';


export const Question = ({
	disabled = false,
	addQuestionId = ()=>{},
	question,
	seeOptions = false,
	seeHint1 = false,
	seeHint2= false,
	onChange = () => {},
	value = '',
	ansValue = '',
	style,
	addButton = false,
	testId,
	questionId,
	reportButton = false,
	verifyButton = false,
	userId,
	seeSolution=false
}) => {
	const [showMore, setShowMore] = useState(seeOptions);
	const [isLoading, setIsLoading] = useState(false);
	const location = useHistory();
	const [isReported, setIsReported] = useState(false);
	const [isVerified, setIsVerified] = useState(false);

	if(isLoading) {return <Loader />}

	
	
	const report = () => {
		db.collection('questions').doc(questionId).update({
			[`Reported.${userId}`]: true,
			'valid': false
		});
		setIsReported(true);
	}

	return (
		<Paper style={{ padding: '1rem', ...style }}>
			{!seeOptions && (question?.tags ?? []).map((tag,idx) => (
				<Chip key={idx} label={tag} style={{margin:'.2rem'}}/>
			))}
			<MathDisplay math={question?.text} style={{fontSize:'1rem'}} />

			<FormControl component="fieldset">
				<RadioGroup
					value={ansValue ? ansValue : value}
					onChange={event => onChange(event.target.value)}
				>	
					{!seeOptions && <p style={{textDecoration:'none', marginBottom:'.5rem', color:'blue', cursor:'pointer'}} onClick={() => {setShowMore(!showMore)}}>See {showMore ? "less" : "more"}</p>}
					<Collapse in={showMore} className='row'>
					{(question?.options ?? []).map((option, index) => (
						<FormControlLabel className='col-12'
							value={index.toString()}
							key={index}
							control={<Radio />}
							label={<MathDisplay math={question?.options[index]} />}
							disabled={disabled}
						/>
					))}
					{question?.sampleInput && <div style={{padding:'0 1rem'}}><Typography style={{color: '#3c415c'}}>Sample Input</Typography><MathDisplay math={question?.sampleInput?.split('\n')?.map ((item, i) => `<p key={i}>${item}</p>`)?.join('')} style={{color:'#536162'}} /></div>}
					{question?.sampleOutput && <div style={{padding:'0 1rem'}}><Typography style={{color: '#3c415c'}}>Sample Output</Typography><MathDisplay math={question?.sampleOutput?.split('\n')?.map ((item, i) => `<p key={i}>${item}</p>`)?.join('')} style={{color:'#536162'}} /></div>}
					{question?.hint && seeHint1 && <MathDisplay math={question?.hint} style={{color:'#c24914', margin:'0 1rem', fontSize:'1rem'}} />}
					{question?.hint2 && seeHint2 && <MathDisplay math={question?.hint2} style={{color:'#682c0e', margin:'0 1rem', fontSize:'1rem'}} />}
					{question?.solution && seeSolution && <MathDisplay math={question?.solution} style={{color:'green', margin:'0 1rem', fontSize:'1.1rem'}} />}
					</Collapse>
				</RadioGroup>

				{ansValue !== '' && (
					<Button
						variant="outlined"
						color="secondary"
						onClick={() => onChange('')}
					>
						Unmark
					</Button>
				)}

				{
					addButton &&
					<div><Button onClick = {async () => 
						
						{
							setIsLoading(true);
							if(testId){ await db.collection('questions').doc(questionId).update({
									[testId] : true
								})
						 	}else {
								if(!question.hint){
									alert("Question should have hint");
									setIsLoading(false);
									return;
								}
								addQuestionId(questionId);
							}
							setIsLoading(false);
					
					}} 
					
					color='secondary' variant='contained' style={{margin:'.4rem', width:'4rem'}} endIcon={<Add/>}>
						Add
					</Button></div>
				}
				{reportButton && <div>
				{verifyButton && <Button onClick = {async () => 
						{
							question.validations = question.validations || {}
							if(question.validations[userId] !== undefined) {
								alert('You have already verified this question');
								return;
							}
							const numValidations = Object.keys(question.validations) + 1;
							
							
							await db.collection('questions').doc(questionId).update({
								[`validations.${userId}`] : true
							})
							if(numValidations >= NUM_VERIFICATION_MODERATOR)
								await db.collection('questions').doc(questionId).update({
									valid: true
								});
							setIsVerified(true);
						}
					}
					color='secondary' variant='contained' style={{margin:'.4rem'}} startIcon={<Beenhere/>} disabled={isVerified}>
						Verify
					</Button>}
					
					{verifyButton && <Button onClick = {() => 
						location.push(`/similar-question/${questionId}`)
					}
					color='secondary' variant='outlined' disabled={true} style={{margin:'.4rem'}} startIcon={<Compare/>}>
						Similar Questions
					</Button>}
						
					<Button 
						onClick={report}
						disabled={isReported}
						color='secondary' variant='outlined' style={{margin:'.4rem', marginLeft:'auto'}} startIcon={<ReportProblem/>}>
							Report
					</Button>
					
				</div>}
					
				
			</FormControl>
		</Paper>
	);
};
