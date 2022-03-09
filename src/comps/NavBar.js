import React from 'react';
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {auth} from '../firebase/Database';

export default function NavBar() {
    
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
            <nav>
            <ul>
                <li>
                    <button className="button-1" onClick= {SignOutUser.bind(this)}>Sign out</button>
                </li>
                <li className="button-1">
                    <Link to="/login">Login</Link>
                </li>
                <li className="button-1">
                    <Link to="/dashboard">Dashboard</Link>
                </li>  
            </ul>
          </nav>
        </div>
    );
}