import {
	Box,
	Button,
	Container,
	MenuItem,
	TextField,
	Typography,
	Chip,
	Paper,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	Collapse,
	Select,
	InputAdornment,
	TextareaAutosize,
} from '@material-ui/core';
import { ADMIN_ID } from '../constants/adminConstants';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Loader } from '../components/Loader';
import { MathDisplay } from '../components/MathDisplay';
import { TagInput } from '../components/TagInput';
import { getQuestionAnswer, saveQuestion } from '../firebase/api';
import { auth, db } from '../firebase/fire';
import { UnAuthorized } from '../pages/Unauthorized';
import './AddQuestion.css';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import {MyUploadAdapter} from '../components/MyUploadAdaptor';
import { Add, Adjust, BarChart, CalendarViewDay, Done, DoneAll, EmojiObjects, Extension, ListAlt, PostAdd, QueryBuilder, Translate } from '@material-ui/icons';

const FormField = styled(TextField)`
	margin-bottom: 1rem;
`;


const levelOptions = Array(5)
	.fill(0)
	.map((_val, idx) => (idx + 1).toString());

const languages = ['हिन्दी', 'English']
const getSecondsFromHHMMSS = (value) => {
    const [str1, str2, str3] = value.split(":");

    const val1 = Number(str1);
    const val2 = Number(str2);
    const val3 = Number(str3);

    if (!isNaN(val1) && isNaN(val2) && isNaN(val3)) {
      return val1;
    }

    if (!isNaN(val1) && !isNaN(val2) && isNaN(val3)) {
      return val1 * 60 + val2;
    }

    if (!isNaN(val1) && !isNaN(val2) && !isNaN(val3)) {
      return val1 * 60 * 60 + val2 * 60 + val3;
    }

    return 0;
  };

  const toHHMMSS = (secs) => {
    const secNum = parseInt(secs.toString(), 10);
    const hours = Math.floor(secNum / 3600);
    const minutes = Math.floor(secNum / 60) % 60;
    const seconds = secNum % 60;

    return [hours, minutes, seconds]
      .map((val) => (val < 10 ? `0${val}` : val))
      .filter((val, index) => val !== "00" || index > 0)
      .join(":")
      .replace(/^0/, "");
  };
const AddQuestion = (
	{customTest = false,
	tagsPassed}
) => {
	let { moduleName, id, topic, subtopic } = useParams();
	let { testId } = useParams();

	const [user] = useAuthState(auth);
	const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));
	const location = useHistory();
	

	if(topic === undefined) {
		topic = "custom_question";
		subtopic = "custom_question";
	}

	const [options, setOptions] = useState([])
	const [text, setText] = useState('');
	const [time, setTime] = useState('1:30');
    const [questionText, setQuestionText] = useState('');
	const [type, setType] = useState('mcq');
	const [typeOfMcq, setTypeOfMcq] = useState('Single Correct');
	const [level, setLevel] = useState('1');
	const [language, setLanguage] = useState(userData?.language ?? 'हिन्दी');
	const [answer, setAnswer] = useState('1');
	const [tags, setTags] = useState(tagsPassed ?? []);
	const [tab, setTab] = useState(0);
	const [hintText, setHintText] = useState('');
	const [hintText2, setHintText2] = useState('');
	const [solutionText, setSolutionText] = useState('');
	const [answers, setAnswers] = useState([]);
	const [sampleInput, setSampleInput] = useState("");
	const [sampleOutput, setSampleOutput] = useState("");
	const [hiddenInput, setHiddenInput] = useState("");
	const [hiddenOutput, setHiddenOutput] = useState("");

	const handleChange = (event, editor) => {

		const data = editor.getData();
		setText(data);
		if(tab===0){
			setQuestionText(data);
		}else if(tab>0){
			setOptions(prev=>{
				return (prev ?? []).map((option,idx)=>	(idx===tab-1) ? data : option)
			})
		}else if(tab===-1){
			setHintText(data);
		}else if(tab===-3){
			setHintText2(data);
		}else{
			setSolutionText(data);
		}
	}

	const handleClick = async(tab, text) => {
		await setTab(tab);
		await setText(text);

	}	


	useEffect(() => {
		const loadData = async () => {
			const data = await getQuestionAnswer(id);
			let time=''+(Math.floor(data.question.time/60))?.toString()+':'+(data.question.time%60)?.toString();
            setQuestionText(data.question.text ?? '');
			setHintText(data.question.hint ?? '');
			setSolutionText(data.question.solution ?? '');
			setOptions(data.question.options.map(option=>option.text));
			setText(data.question.text ?? '');
			setTime(time ?? '1:30');
			setType(data.question.type ?? 'mcq');
			setLevel(data.question.level ?? '1');
			setLanguage(data.question.language ?? 'हिन्दी');
			setAnswer((data.answer+1)?.toString());
			setTags(data.question.tags);
			setAnswers(data.question.answers ?? []);
			setTypeOfMcq(data.question.multiple ? 'Multiple Correct' : 'Single Correct');
			const seconds = Math.max(0, getSecondsFromHHMMSS(time));
				setTime(toHHMMSS(seconds));
		};

		if (id) {
			loadData();
		}
	}, [id]);

	const onSubmit = async (e) => {
		
		let [minutes, seconds] = time
			.split(':')
			.map(val => parseInt(val));
		
		if(seconds === undefined) {
			seconds = 30;
		}

		if(minutes === undefined) {
			minutes = 0;
		}

		if(minutes === 0 && seconds === 0)
			minutes = 1;
		
		if(tags.length===0 && !customTest.customTest){
			e.preventDefault();
			alert('Input some tags, if tag not present go to Moderator->ManageTags and then add tags');
			return;
		}
		if(questionText===''){
			e.preventDefault();
			handleClick(0,questionText);
			alert('Enter some question');
			return;
		}
		const emptyOptions = options.filter(option=>option==='');
		if(emptyOptions.length>0 && type==='mcq'){
			e.preventDefault();
			alert('Enter valid options');
			return;
		}
		if(tagsPassed && !hintText){
			e.preventDefault();
			alert('Enter some hint');
			return;
		}

			
		const question = {
            text: questionText,
			level: parseInt(level),
			time: minutes * 60 + seconds,
			topic,
			subtopic,
            type: type,
			language: language,
			tags: tags,
        };
		if(hintText){
			question.hint = hintText;
		}
		if(hintText2){
			question.hint2 = hintText2;
		}
		if(solutionText){
			question.solution = solutionText;
		}
		if(sampleInput){
			question.sampleInput= sampleInput;
		}
		if(sampleOutput){
			question.sampleOutput= sampleOutput;
		}
		if(hiddenInput){
			question.hiddenInput= hiddenInput;
		}
		if(hiddenOutput){
			question.hiddenOutput= hiddenOutput;
		}
		if(type==='mcq'){
			question.options = options;
			if(typeOfMcq==='Multiple Correct'){
				question.answers = answers;
				question.multiple = true;
			}
		}
		const finalAnswer = parseInt(answer) - 1;
		question.user = auth.currentUser.uid;
		if(customTest.customTest === true) {
			
			
			question.locked = true;
			question.topic = 'custom_question';
			question[testId] = true
			id = await saveQuestion(question, finalAnswer);
			e.preventDefault();
			alert('Custom Answer inserted', id, topic, subtopic, testId);
			
			location.push(`/my-custom-test/${testId}`)		
			
			return;
		}
		
		question.valid = false;
        await saveQuestion(question, finalAnswer, id);
        
		
        if(id){
			
			location.push(`/module/${moduleName}/validate-questions/${topic}/${subtopic}`);
		}
		
		alert('Your question added successfully!');
		e.preventDefault();

		setOptions([]);
		setText('');
    	setQuestionText('');
		setType('mcq');
		setTypeOfMcq('Single Correct');
		setLevel('1');
		setLanguage('हिन्दी');
		setTab(0);
		setAnswer('1');
		setHintText('');
		setHintText2('');
		setSolutionText('');
		setAnswers([]);
		setTags(tagsPassed ?? []);
		setSampleInput('');
		setSampleOutput('');
		setHiddenInput('');
		setHiddenOutput('');
	};

	if(userData === undefined) {
		return <Loader />
	}

	if( !customTest.customTest 
		&& ((userData?.modulePermissions === undefined) || userData.modulePermissions[moduleName] === undefined) 
		&& user?.uid !== ADMIN_ID) {
		return(
			<UnAuthorized />
		)
	}

	return (
		<Container maxWidth="sm" style={{ marginTop: '2rem' }}>
			<form onSubmit={(e)=>onSubmit(e)}>
				<Typography variant="h4" component="h2" gutterBottom>
					<PostAdd style={{margin:'1rem', fontSize:'2rem'}}/>{id ? 'Edit' : 'Add'} Question
				</Typography>

				<Box display="flex" justifyContent="space-around">
					<FormField
						InputProps={{
							startAdornment: (
							<InputAdornment position="start">
								<CalendarViewDay />
							</InputAdornment>
							),
						}}
						select
						label="Type"
						value={type}
						required
						style={{ flex: '.3', margin: '.5rem' }}
						onClick={(e)=>{
								e.target.value && setType(e.target.value);}}
					>
						{['mcq', 'sub', 'code'].map(option => (
							<MenuItem key={option} value={option} >
								{option}
							</MenuItem>
						))}
					</FormField>

					{type==='mcq' && <FormField
						InputProps={{
							startAdornment: (
							<InputAdornment position="start">
								{typeOfMcq === 'Single Correct' ? <Done/> : <DoneAll/>}
							</InputAdornment>
							),
						}}
						select
						label="Type of mcq"
						value={typeOfMcq}
						required
						style={{ flex: '.4', margin: '.5rem' }}
						onClick={(e)=>{
							e.target.value && setTypeOfMcq(e.target.value);}}
					>
						{['Single Correct', 'Multiple Correct'].map(option => (
							<MenuItem key={option} value={option} >
								{option}
							</MenuItem>
						))}
					</FormField>}

					<FormField
						InputProps={{
							startAdornment: (
							<InputAdornment position="start">
								<Translate />
							</InputAdornment>
							),
						}}
						select
						label="Language"
						value={language}
						required
						style={{ flex: '.4', margin: '.5rem' }}
						onClick={(e)=>{
							e.target.value && setLanguage(e.target.value);}}
					>
						{languages.map(option => (
							<MenuItem key={option} value={option}>
								{option}
							</MenuItem>
						))}
					</FormField>

					

					
				</Box>

				{!tagsPassed && <Box
					display="flex"
					alignItems="baseline"
					justifyContent="center"
				>
					{!customTest.customTest && 
						<TagInput topic={topic} subtopic={subtopic} tags={tags} onChange={(tags)=>{setTags(tags)}}/>
					}
				</Box>}
				<Box
					display="flex"
					alignItems="baseline"
					style={{margin:'1rem 0 .5rem'}}
				>
					<Chip 
						icon={<ListAlt/>}
						onClick={()=>handleClick(0,questionText)} 
						label='Question' 
						color='primary' 
						variant={tab===0?'default':'outlined'} 
						size='small' 
						style={{margin:'1rem .2rem .5rem'}}
					/>
						
					{type==='mcq' && options?.map((option,idx) => <Chip 
						icon={<Adjust/>}
						onClick={()=>handleClick(idx+1,option)} 
						onDelete={()=>{
							handleClick(0,questionText);
							setOptions(prev=>prev.filter((_,i)=>idx!==i));
						}} 
						label={'Option '+(idx+1)}
						color='primary' 
						variant={tab===idx+1?'default':'outlined'}  
						size='small' 
						style={{margin:'1rem .2rem .5rem'}}
					/>)}

					{type==='mcq' && <Chip 
						icon={<Add/>}
						onClick={()=>{setOptions(prev=>[...prev,'']);handleClick(options.length+1,'')}} 
						label='Add option' 
						color='secondary' 
						variant='outlined' 
						size='small' 
						style={{margin:'.5rem .2rem'}}
					/>}
				</Box>

				{/* <Button onClick={()=>setIsShowToolbar(!isShowToolbar)} color='primary' variant='outlined' size='small' style={{margin:'0 0 .5rem', borderRadius:0, fontSize:10}}>
					{isShowToolbar ? 'Collapse' : 'Expand'} toolbar 
				</Button> */}
					
					<CKEditor
						editor={ClassicEditor}
						style= {{ display: 'flex', flex: '1', margin: '1rem' }}
						data={text}
						onReady={editor => {
						editor.plugins.get("FileRepository").createUploadAdapter = loader => {
							const temp = new MyUploadAdapter(loader);
							return temp;
						};
						}}
						
						

						onChange={ ( event, editor ) => {
							return handleChange(event, editor)
						} }
						
						
					/>

					<CKEditor 
						data={text}
						onChange={event => handleChange(event)}
					>	
					</CKEditor>
				<Box
					display="flex"
					alignItems="baseline"
					style={{margin:'.5rem 0'}}
				>
					<Chip 
						icon={<EmojiObjects/>}
						onClick={()=>handleClick(-1,hintText)} 
						label={(hintText?'Edit':'Add')+' hint 1'} 
						variant={tab===-1?'default':'outlined'} 
						size='small' 
						color='secondary'
						style={{margin:'.5rem .2rem'}}
					/>
					<Chip 
						icon={<EmojiObjects/>}
						onClick={()=>handleClick(-3,hintText2)} 
						label={(hintText2?'Edit':'Add')+' hint 2'} 
						variant={tab===-3?'default':'outlined'} 
						size='small' 
						color='secondary'
						style={{margin:'.5rem .2rem'}}
					/>
					<Chip 
						icon={<Extension/>}
						onClick={()=>handleClick(-2,solutionText)} 
						label={(solutionText?'Edit':'Add')+' solution'} 
						variant={tab===-2?'default':'outlined'} 
						size='small' 
						color='secondary'
						style={{margin:'.5rem .2rem'}}
					/>
				</Box>
				{type === 'code' && 
				<Box
					display="flex"
					alignItems="baseline"
					justifyContent="space-around"
					style={{marginTop:'1rem'}}
				>
					<TextareaAutosize aria-label="minimum height" onChange={(e)=>setSampleInput(e.target.value)} rowsMin={5} style={{flex: .4, border: '2px solid #dddddd', padding:'10px'}} placeholder="Sample Input" />
					<TextareaAutosize aria-label="minimum height" onChange={(e)=>setSampleOutput(e.target.value)} rowsMin={5} style={{flex: .4, border: '2px solid #dddddd', padding:'10px'}} placeholder="Sample Output" />
				</Box>}

				<Paper style={{ padding: '1rem' }}>
					{(tags ?? []).map((tag,idx) => (
						<Chip key={idx} label={tag} style={{margin:'.2rem'}}/>
					))}

					<MathDisplay math={questionText} />

					{type==='mcq' && options.length > 0 && (typeOfMcq==='Single Correct' ? <FormControl component="fieldset">
					<RadioGroup value={(parseInt(answer)-1).toString()}>	
						<Collapse in={true}>
						{(options ?? []).map((option, index) => (
							<FormControlLabel
								value={index.toString()}
								onClick={()=>setAnswer((index+1).toString())}
								key={index}
								control={<Radio />}
								label={<MathDisplay math={option} />}
							/>
						))}
						</Collapse>
					</RadioGroup></FormControl> : 
					<Collapse in={true}>
						{(options ?? []).map((option, index) => (
							<FormControlLabel
								value={undefined}
								onClick={()=>setAnswers(prev=>{
									if(prev.filter(answer=>answer===index).length===0){
										return [...prev, index];
									}else{
										return prev.filter(answer=>answer!==index);
									}
								})}
								key={index}
								checked={answers.filter(answer=>answer===index).length>0}
								control={<Radio />}
								label={<MathDisplay math={option} />}
							/>
						))}
					</Collapse>)}
					{sampleInput && <div><Typography style={{color: '#3c415c'}}>Sample Input</Typography><MathDisplay math={sampleInput.split('\n').map ((item, i) => `<p key={i}>${item}</p>`).join('')} style={{color:'#536162'}} /></div>}
					{sampleOutput && <div><Typography style={{color: '#3c415c'}}>Sample Output</Typography><MathDisplay math={sampleOutput.split('\n').map ((item, i) => `<p key={i}>${item}</p>`).join('')} style={{color:'#536162'}} /></div>}
					{hintText && <MathDisplay math={hintText} style={{color:'#db6400'}} />}
					{hintText2 && <MathDisplay math={hintText2} style={{color:'#ac0d0d'}} />}
					{solutionText && <MathDisplay math={solutionText} style={{color:'green'}} />}
				</Paper>
				
				

				{type === 'code' && 
				<Box
					display="flex"
					alignItems="baseline"
					justifyContent="space-around"
					style={{marginTop:'1rem'}}
				>
					<TextareaAutosize onChange={(e)=>setHiddenInput(e.target.value)} aria-label="minimum height" rowsMin={5} style={{flex: .4, border: '2px solid #dddddd', padding:'10px'}} placeholder="Hidden Input" />
					<TextareaAutosize onChange={(e)=>setHiddenOutput(e.target.value)} aria-label="minimum height" rowsMin={5} style={{flex: .4, border: '2px solid #dddddd', padding:'10px'}} placeholder="Hidden Output" />
				</Box>}
				
				<Box
					display="flex"
					alignItems="baseline"
					justifyContent="space-around"
					style={{marginTop:'1rem'}}
				>
					<FormField
						InputProps={{
							startAdornment: (
							<InputAdornment position="start">
								<BarChart />
							</InputAdornment>
							),
						}}
						select
						label="Level"
						type="number"
						value={level}
						required
						style={{ flex: '.4', margin: '1rem .5rem .5rem' }}
						onClick={(e)=>{
							e.target.value && setLevel(e.target.value);}}
					>
						{levelOptions.map(option => (
							<MenuItem key={option} value={option}>
								Level {option}
							</MenuItem>
						))}
					</FormField>

					{type==='mcq' && ( typeOfMcq==='Single Correct' ? <FormField
						InputProps={{
							startAdornment: (
							<InputAdornment position="start">
								<Adjust />
							</InputAdornment>
							),
						}}
						label="Correct Option"
						name="answer"
						type="number"
						value={answer}
						required
						style={{ flex: '.4', margin: '1rem .5rem .5rem' }}
						inputMode="decimal"
						inputProps={{ min: 1, max: options?.length }}
						onChange={(e)=>{
							setAnswer(e.target.value);}}
					/>:<Select
						InputProps={{
							startAdornment: (
							<InputAdornment position="start">
								<Adjust />
							</InputAdornment>
							),
						}}
						multiple
						label="Correct Option"
						value={answers}
						style={{ flex: '.4', margin: '1rem .5rem .5rem' }}
						onChange={(e)=>{
							setAnswers(e.target.value);}}
					>{options.map((_,idx)=>(
						<MenuItem key={idx} value={idx}>
            	  			{idx+1}
            			</MenuItem>)
					)}</Select>)}

					<FormField
						InputProps={{
							startAdornment: (
							<InputAdornment position="start">
								<QueryBuilder />
							</InputAdornment>
							),
						}}
						label="Estimated Time"
						name="time"
						value={time}
						placeholder='mm:ss'
						style={{ flex: '.4', margin: '1rem .5rem .5rem' }}
						required
						onChange={(e)=>{
							setTime(e.target.value);}}
						onBlur = {(event) => {
							const value = event.target.value;
							const seconds = Math.max(0, getSecondsFromHHMMSS(value));
						
							const time = toHHMMSS(seconds);
							setTime(time);
						}}
					/>
				</Box>


				

				
				
				<Box display="flex" justifyContent="center" paddingBottom="3rem">
					<Button variant="contained" color="primary" type="submit" >
						Submit
					</Button>
				</Box>
			</form>
        </Container>
        
        
	);
};

export { AddQuestion };
