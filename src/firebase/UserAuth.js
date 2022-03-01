import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithRedirect } from "firebase/auth";
import {app} from '../firebase/Database';
import {useEffect, useState} from 'react';
import {initializeApp} from 'firebase/app';
import {useNavigate} from 'react-router-dom';
import { useAuthState } from "react-firebase-hooks/auth";
import '../styles.css';


function Login() {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const auth = getAuth(app);
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();

    const loginAttempt = (username, password) => {
        console.log(password);
        signInWithEmailAndPassword(auth, username, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            if (user) {
                navigate('../dashboard');
            }
            // ...
        })
        .catch((error) => {
            console.log("didn't work")
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });
    }

    const handleSignUpPage = () => {
      navigate('../signup')
    }

    return(
      <div className="full-container">
        <label>
          <h2>Username</h2>
          <input className="input-1" type="text" onChange={event => setUsername(event.target.value)} />
        </label>
        <label>
          <h2>Password</h2>
          <input className="input-1" type="password" onChange={event => setPassword(event.target.value)} />
        </label>
        <div>
          <button className="button-1" onClick={() => loginAttempt(username,password)}> Submit</button>
        </div>
        <div>
          <button className="button-1" onClick={() => handleSignUpPage()}>Sign Up</button>
        </div>
      </div>
    )
  }

export default Login;