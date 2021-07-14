import firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyAdHvrCNX5JEumSb96XVAjbcLsdwtfTGl0",
    authDomain: "wily-2f7aa.firebaseapp.com",
    databaseURL: "https://wily-2f7aa-default-rtdb.firebaseio.com",
    projectId: "wily-2f7aa",
    storageBucket: "wily-2f7aa.appspot.com",
    messagingSenderId: "835363843059",
    appId: "1:835363843059:web:618a6f66c22de23ee50086"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();