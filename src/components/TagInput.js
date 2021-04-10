import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { db } from '../firebase/fire';

const topicRef = db.doc('data/topics');

const useStyles = makeStyles(theme => ({
	root: {
		width: 500,
		'& > * + *': {
			marginTop: theme.spacing(3),
		},
	},
}));

export function TagInput({ topic, subtopic, onChange, tags, style}) {
	const [value] = useDocumentDataOnce(topicRef);
	let tagOptions = []

	if(value) {
		tagOptions = value?.topics[topic]?.[subtopic] ?? [];
	}

	if(!Array.isArray(tagOptions)) {
		tagOptions = []
	}
	
	//console.log('tagOptings; ', tagOptions, value?.topics[topic]?.[subtopic])
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Autocomplete
				style={{...style}}
				multiple
				id="tags-outlined"
				value={tags}
				options={tagOptions}
				filterSelectedOptions
				onChange={(e, data) => onChange(data.map(str => str.trim()))}
				renderInput={params => <TextField {...params} label="Tags" />}
			/>
		</div>
	);
}
