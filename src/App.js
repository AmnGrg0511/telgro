import './App.scss';
import { auth } from './firebase/fire';
import Hero from './Hero';

import { useAuthState } from 'react-firebase-hooks/auth';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { Loader } from './components/Loader';
import { theme } from './theme';
import Home from './Home';
import { EmailVerification } from './components/EmailVerification';

function App() {
	const [user, loading, error] = useAuthState(auth);
	console.log(user?.emailVerified)
	return (
		<ThemeProvider theme={theme}>
			<div className="App">
				<CssBaseline />
				{(() => {
					if (loading) return <Loader />;

					if (error) return error;
					
					if(user && !user.emailVerified) {
						return (
							<EmailVerification />
						)
					}

					if (user) {
						return <Hero />;
					}

					return <Home />;
				})()}
			</div>
		</ThemeProvider>
	);
}

export default App;


// import React, { useEffect, useState } from "react";
// import Sawo from "sawo";
// import styles from "./styles";
// import Hero from './Hero';
// import { auth } from './firebase/fire';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import Login from './Login';
// import { Loader } from "./components/Loader";

// function App() {

//   // state values
//   // const [userPayload, setUserPayload] = useState({})
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [user] = useAuthState(auth);
//   const [newUser, setNewUser] = useState(false);
//   const [email, setEmail] = useState('');
//   useEffect(() => {

	
//     // Sawo Configuration, required to render form in the container
//     // onSuccess callback will get invoke, after successful login

//     const sawoConfig = {
//       // should be same as the id of the container
//       containerID: "a4983ee0-b090-4096-bb14-e909589ef74b",
//       // can be one of 'email' or 'phone_number_sms'
//       identifierType: "email",
//       // Add the API key
//       apiKey: "9581f38a-c975-4835-bafa-570700893ce9",
//       // Add a callback here to handle the payload sent by sdk
//       onSuccess: onSuccessLogin
//     };

//     // creating instance
//     let sawo = new Sawo(sawoConfig)
// 	console.log(sawo);
//     // calling method to show form
//     sawo.showForm();

//   }, [])



//   // Sawo: 
//   // OnSuccess Callback method

//   const onSuccessLogin = async(payload) => {
//     // setUserPayload(payload);
// 	setEmail(payload.identifier);
// 	console.log(payload);
//     setIsLoggedIn(true);
// 	let password = 'CIQIcaz67';

// 	if(payload.identifier === 'contact@meetai.in') {
// 		password = 'MeetAI.in'
// 	}

// 	auth.signInWithEmailAndPassword(payload.identifier, password)
// 	.catch(err => {
// 		setNewUser(true);
// 	});
//   }
//   if (user) {
// 	return <Hero />;
//   }
//   if (newUser) {
// 	return <Login newUser identifier={email} hardCoded='CIQIcaz67'/>;
//   }
//   return (
//     <React.Fragment>
      
//       <div style={styles.containerStyle}>
//         <section>
//           <h1>Welcome to Telgro</h1>
//           {/* Showing Successful login message */}
//           {isLoggedIn && 
// 		  	<Loader />
//           }

//           {/* Showing login form */}
//           {
//             !isLoggedIn && (
//               <div style={styles.formContainer} id="a4983ee0-b090-4096-bb14-e909589ef74b">
//                 {/* Sawo form will appear here */}
//               </div>
//           )}
//         </section>
//       </div>
//     </React.Fragment>
//   );
// }

// export default App;