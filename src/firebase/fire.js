import firebase from 'firebase';

const firebaseConfig = {
	apiKey: 'AIzaSyC4wpto5OUbOrwiBlya9ufMPEGMsNEZEWs',
	authDomain: 'newquiz-4d2a5.firebaseapp.com',
	projectId: 'newquiz-4d2a5',
	storageBucket: 'newquiz-4d2a5.appspot.com',
	messagingSenderId: '653337345763',
	appId: '1:653337345763:web:469c66b62373e6a3a18fd6',
	measurementId: 'G-2QE4SJ0XQT',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.analytics();
export default firebase; 
export const db = firebase.firestore();
export const auth = firebase.auth();
export const FieldValue = firebase.firestore.FieldValue;
export const storage = firebase.storage();