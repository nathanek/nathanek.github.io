import { setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {app} from '../firebase/Database';
import { useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { useAuthState } from "react-firebase-hooks/auth";
import '../styles.css';


function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const auth = getAuth(app);
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();

    const loginAttempt = (email, password) => {
        console.log(password);
        setPersistence(auth, browserLocalPersistence)
        .then(() => {
          // Existing and future Auth states are now persisted in the current
          // session only. Closing the window would clear any existing state even
          // if a user forgets to sign out.
          // ...
          // New sign-in will be persisted with session persistence.
          return signInWithEmailAndPassword(auth, email, password);
        })
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            if (user) {
                navigate('../dashboard');
            }
            // ...
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
        });
    }

    const handleSignUpPage = () => {
      navigate('../signup')
    }

    return(
      <div className="full-container">
        <label>
          <h2>Email</h2>
          <input className="input-1" type="text" onChange={event => setEmail(event.target.value)} />
        </label>
        <label>
          <h2>Password</h2>
          <input className="input-1" type="password" onChange={event => setPassword(event.target.value)} />
        </label>
        <div>
          <button className="button-1" onClick={() => loginAttempt(email,password)}> Submit</button>
        </div>
        <div>
          <button className="button-1" onClick={() => handleSignUpPage()}>Sign Up</button>
        </div>
      </div>
    )
  }

export default Login;

