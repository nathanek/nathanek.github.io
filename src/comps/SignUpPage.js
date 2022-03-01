import CreateUser from '../firebase/UserSignUp';
import '../styles.css';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {useNavigate} from 'react-router-dom';
import {db, app} from '../firebase/Database';
import {ref, set} from 'firebase/database';
export default function LoginPage(){
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    
    const auth = getAuth(app);
    const navigate = useNavigate();
    const handleClick = () => {
        setErrorMessage('');
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            user.displayName = username;
            //console.log(JSON.stringify(user));
            writeUserData(user)
            .then(() => {
                navigate('../dashboard');
            })
            .catch(error => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });

            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            setErrorMessage("Email and password already in use");
            // ..
        });   
    }
    


    return(
        <div className="general-container">
                <h2>Display Name</h2>
            <input className="input-1" type="text" onChange={event => setUsername(event.target.value)} />
                <h2>Email</h2>
                <input className="input-1" type="text" onChange={event => setEmail(event.target.value)} />
                <h2>Password</h2>
                <input className="input-1" type="password" onChange={event => setPassword(event.target.value)} />
            <div>
                {errorMessage}
            </div>
            <div>
                <button className="button-1" onClick={() => handleClick()}>Submit</button>
            </div>
        </div>
    )
}

function writeUserData(user) {
        return new Promise ((resolve,reject) => {
            set(ref(db,'users/' + user.uid),
            {
                displayName: user.displayName,
                email: user.email,
            })
            .then(() => resolve())
            //console.log(JSON.stringify(user));
            //console.log(user.uid);
        
            .catch(error => {
                console.log(error.message)
                console.log("ERROR");
                reject(error);
            });
        })
}

    