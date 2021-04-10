import {
	Button,
    CardActions,
    CardContent,
	Paper,
	Typography,
} from '@material-ui/core';
// import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { auth, db } from '../firebase/fire';

import { Center } from './Center';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import App from '../App';

const Card = styled(Paper)`
	padding: 2rem;
`;

export const EmailVerification = () => {

    const [user] = useAuthState(auth);
    const [userData] = useDocumentDataOnce(db.collection('users').doc(user?.uid));


    if(user?.emailVerified) {
        return <App />
    }

    const SendVerificationLink = () => {
        
        user.sendEmailVerification().then(() => {alert(`A verification email is sent to registered email`)}).catch(error => {alert('Some error occured, please try again'); console.log(error)});

    }

    return (
        <Center>
            <Card>
                <CardContent>
                    <Typography>
                        Hello {userData?.name}, Your email not verified. It will take just few minutes.    
                    </Typography>
                </CardContent>

                <CardActions>
                    <Button color='secondary' variant='contained' onClick={SendVerificationLink}>
                        Click here
                    </Button>
                    <Button color='secondary' variant='contained' onClick={() => auth.signOut()}>
                        Log out
                    </Button>

                </CardActions>
            </Card>
        </Center>
    )
    
}