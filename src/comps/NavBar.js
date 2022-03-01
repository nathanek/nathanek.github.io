import React from 'react';
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
    
    const auth = getAuth();
    const navigate = useNavigate();
    const SignOutUser = () => {
        signOut(auth).then(() => {
        // Sign-out successful.
        console.log("signed out");
        navigate('login');
        }).catch((error) => {
        // An error happened.
        
        });
    }
    return (
        <div>
            <button className="button-1" onClick= {SignOutUser.bind(this)}>Sign out</button>
        </div>
    );
}