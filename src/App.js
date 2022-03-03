
import './App.css';
import { Link, HashRouter } from 'react-router-dom';
import PageController from './routes/PushupController';
import NavBar from './comps/NavBar';
import { getAuth } from "firebase/auth";
import {app} from './firebase/Database';

function App() {
  const auth = getAuth(app);
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      //var displayName = user.displayName;
      //var email = user.email;
      //var emailVerified = user.emailVerified;
      //var photoURL = user.photoURL;
      //var isAnonymous = user.isAnonymous;
      //var uid = user.uid;
      //var providerData = user.providerData;
      // ...

    } else {
      // User is signed out.
      // ...
      
    }
  });

  return (
      <HashRouter>
        <div>
          <h1>Julian Pushup Challenge!</h1>
          <NavBar/>
          <PageController/>
        </div>
      </HashRouter>
  );
}

export default App;
          