import { useParams } from 'react-router-dom';
import { Container, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/fire';
import { useHistory } from 'react-router-dom';
import {useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { Button } from '@material-ui/core';
import { Assignment, PlayArrow } from '@material-ui/icons';


const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }));

export const CustomTest = () => {
    
    const classes = useStyles();
    const location = useHistory();
	const { testId } = useParams();
	
	const [user] = useAuthState(auth);
	
	const [customTests] = useCollectionDataOnce(db.collection('customTests').limit(10), {idField: 'id'});
	

	let customTest = undefined;
    let allowed = true;

	if(customTests !== undefined) {
        customTest = customTests.filter(ct => ct.id === testId)[0]  
        // allowed = Object.keys(customTest.users || {}).includes(user?.uid)
	}

    
    
    
    

	return (

        <Container maxWidth="md" style={{ marginTop: '2rem' }}>
		
            <Typography variant='h5' align='center' >
                <Assignment style={{fontSize:'1.5rem', margin:'1rem'}}/>{customTest?.name}
            </Typography>

            <Typography>
                {customTest?.description}
            </Typography>
            
            <Grid container spacing={3} style={{ marginTop: '2rem' }}>
                <Grid item xs={6}>

                    {
                        customTest?.isScheduled &&
                        <Paper className={classes.paper}>
                            Starting Time:
                            <Typography>
                                {customTest?.startTime.toDate().toDateString()}
                            </Typography>
                            <Typography>
                                {customTest?.startTime.toDate().toTimeString()}
                            </Typography>
                        </Paper>
                    }
                </Grid>
                <Grid item xs={6}>
                    {
                        customTest?.isScheduled &&
                        <Paper className={classes.paper}>
                            Ending Time:
                            <Typography>
                                {customTest?.endTime.toDate().toDateString()}
                            </Typography>
                            <Typography>
                                {customTest?.endTime.toDate().toTimeString()}
                            </Typography>
                        </Paper>
                    }
                </Grid>
            </Grid>

            {
                !allowed &&

                <div>
                    You are not allowed to access this test.
                    <Button onClick={() => {
                        allowed = true;
                        // setLoading(true);
                        db.collection('customTests').doc(testId).update({
                            [`users.${user.uid}`] : true
                        })
                        
                        // setLoading(false)
                    }}>
                        Buy
                    </Button>
                </div>
            }

            {
                allowed &&
                <div style={{ display: "flex", alignItems: 'center', justifyContent: 'center', marginTop: '2rem'}}>
                <Button color='secondary' variant='contained' onClick={() => 
                    {
                        if(customTest.isScheduled && new Date() < customTest.startTime.toDate()) {
                            alert("This test not started.");
                            return;
                        }
                        if(customTest.isScheduled && new Date() > customTest.endTime.toDate()) {
                            alert("This test has ended.");
                            return;
                        }
                        location.push(`/start-custom-test/${testId}`)}
                    }>
                    <PlayArrow/>Start Test
                </Button>
                </div>
            }
        </Container>
    );
};
