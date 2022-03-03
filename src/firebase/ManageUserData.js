
async function createNewAccount() {
    try {
        const userAuth = await firebase.auth().createUserWithEmailAndPassword(email, password);
        var user = {
            uid: userAuth.uid,
            email: userAuth.email
        }
        writeUserData(user)

    } catch (error) {
        console.log(error.message)
    }
}

