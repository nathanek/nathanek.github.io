import React from 'react';
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {auth} from '../firebase/Database';

export default function NavBar() {
    
    const navigate = useNavigate();
    const SignOutUser = () => {
        // Sign-out successful.
        console.log("signed out");
        navigate('/login');
        signOut(auth).then(() => {    
        }).catch((error) => {
        // An error happened.
        
        });
    }

    const backButton = () => {
        console.log(window.location.href.indexOf('signup'));
        if (window.location.href.indexOf('signup')>0) {
            return (
                <li>
                        <button className="button-1" onClick= {()=> {navigate('/login');}}>Back</button>
                </li>
            );
        } else {
            return ;
        }
    
    }

    const logoutButton = () => {
        if (auth.currentUser) {
            return (
                <li>
                        <button className="button-1" onClick= {()=> {SignOutUser()}}>Sign out</button>
                </li>
            );
        } else {
            return ;
        }
    }

    return (
        <div>
            <nav>
            <ul>
                {logoutButton()}
                {backButton()}
            </ul>
          </nav>
        </div>
    );
}