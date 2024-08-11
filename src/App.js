import React, { useRef, useState } from 'react';
import './App.css';
import oyelogo from './oyelogo.png';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAg_Oq-qDszE_hhJYrBmZ96FUo9se0v5bw",
  authDomain: "messenger-c1ecb.firebaseapp.com",
  projectId: "messenger-c1ecb",
  storageBucket: "messenger-c1ecb.appspot.com",
  messagingSenderId: "717179346915",
  appId: "1:717179346915:web:cfc8bf065b532ef4b68ad6"
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Oye!</h1>
        <img src={oyelogo} className="logo" alt="Oye Logo" />
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch((error) => {
      if (error.code === 'auth/popup-blocked') {
        alert('Popup blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.warn('Popup request was cancelled due to another conflicting popup.');
      } else {
        console.error("Sign-in error", error);
      }
    });
  };

  return (
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Say something nice"
        />
        <button type="submit" disabled={!formValue}>Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  // Use default image if photoURL is not available
  const avatarURL = photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png';

  // Determine if the message is sent by the current user
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={avatarURL} alt="User Avatar" className="avatar" />
      <p className="message-text">{text}</p>
    </div>
  );
}

export default App;
