import {
	Chip,
	Avatar,
	ListItemAvatar,
	ListItemSecondaryAction,
	ListItemText,
	Button,
	Collapse,
	Tooltip,
	ListItem,
} from '@material-ui/core';
import { useState } from 'react';
import { auth, db } from '../firebase/fire';
import StarIcon from '@material-ui/icons/Star';
import DocIcon from '@material-ui/icons/DescriptionOutlined';
import LinkIcon from '@material-ui/icons/Link';
import VideoIcon from '@material-ui/icons/VideoLibrary';
import { Rating } from '@material-ui/lab';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
	withStyles
  } from "@material-ui/core/styles";
import { ReportProblem } from '@material-ui/icons';
  const TextOnlyTooltip = withStyles({
      tooltip: {
        color: "black",
        backgroundColor: "transparent"
      }
    })(Tooltip);

    function ListItemLink(props) {
        return <ListItem button component="a" {...props} />;
    }  

export const Resource = ({res}) => {
    
	const [user] = useAuthState(auth);
	const [show, setShow] = useState(false);
    const [reported, setReported] = useState(false);
	const report = (id) => {
        setReported(true);
		db.collection('resources').doc(id).update({
			[`Reported.${user.uid}`]: true,
            'approved': false
		});
	}
	let userId = null;
	if (auth.currentUser)
		userId = auth.currentUser.uid;
	const getRating = (res) => {
		let s = 0
		if(res == null || res.rating == null)
			return 0;
		for(var key in res.rating) {
			s += res.rating[key]
		}
		return s/Object.keys(res.rating).length;
	}

	const getIndivisualUserRating = (res, userId) => {
		if(res == null || res.rating == null)
			return 0;
		return res.rating[userId] || 0;
	} 
    
    return (
        <div className='row' onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}><ListItemLink href={res.link} key={res.id} target="_blank">
            <div className='row'>
            <ListItemAvatar style={{padding:'0 1rem'}}>
                <Avatar>
                    {res.type === 'link' && <LinkIcon />}
                    {res.type === 'pdf' && <DocIcon />}
                    {res.type === 'video' && <VideoIcon />}
                </Avatar>
            </ListItemAvatar>
            <div className='col col-md-auto col-6'>
            <TextOnlyTooltip title= {res.tags.map(tag => <Chip label={tag} style={{margin:'.2rem'}} />)}>
                    <ListItemText>{res.name}</ListItemText>
            </TextOnlyTooltip>
            {/* <embed src={res.link} type="application/pdf" width="600px" height="600px" /> */}
            </div>
            <ListItemSecondaryAction>
                    
            <span style={{position:'relative', bottom:'.5rem'}} >{Math.round(getRating(res) * 10) / 10}</span> <StarIcon style={{color:'#ffcc29', position:'relative', bottom:'.5rem'}} />
                &nbsp;&nbsp;&nbsp;&nbsp;
            {userId && <Rating 
                value={getIndivisualUserRating(res, userId)}
                precision={0.5}
                style={{color:'#ffcc29'}} 
                onChange={(event, newValue) => {
                    let update = res.rating || {};
                    update[userId] = newValue;									
                    db.collection('resources').doc(res.id).update({
                        rating: update
                    })
                }}
            
            />}
            
            </ListItemSecondaryAction>
            </div>
            
        </ListItemLink>
        <Collapse in={show} style={{marginLeft:'auto'}}>
        <Button 
        onClick={()=>report(res.id)}
        disabled={(res.Reported && res.Reported[user.uid])||reported}
        startIcon={<ReportProblem/>}
        color='secondary' variant='outlined' style={{margin:'0 1.4rem 1rem'}}>
            {(res.Reported && res.Reported[user.uid])||reported ? 'Reported' : 'Report'}
        </Button></Collapse></div>
    )
}