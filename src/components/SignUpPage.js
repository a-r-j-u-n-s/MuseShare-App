import React, { useState } from "react"; //import React Component
import 'firebase/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { database } from "..";
import { storage } from "..";

export function SignUpPage(props) {

    // This page will double as a sign up and a login page
    // Something like ("Sign up [sign up logic and forms]! Already have an account? Login instead... [login logic and forms]")
    // TODO: All the UI, Add sign up page itself, add login page and login firebase logic. All database handling is complete :)
        // Add loading spinners to UI

    // React UI stuff to retrieve the below fields...
    // Make sure to use form validation (homework 6 problem b for reference)




    // All of these  fields should be set according to the user input into the UI (DON'T CHANGE THESE FIELD NAMES)
    let email = null; 
    let password = null;
    let displayName = null; // Username
    let about = null;    // About user
    let photoFile = null; // Profile picture file

    // Non-user-inputted fields
    let userId = email.substring(0, email.indexOf("@"));   // User key
    let photoURL = 'users/'+userId+'/profilePicture/'+photoFile;    // The purpose of this field is to store a reference in the realtime database to the image file (which exists in the cloud storage)

    // For sign up
    // THIS IS FOR WHEN THE SIGN UP FORM IS SUBMITTED
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredentials) => {
        let user = userCredentials.user; //access the newly created user and set fields
        user.updateProfile({
            displayName: displayName,
            photoURL: photoURL
        })
        console.log('User created: '+user.uid);
    }).then(() => { 
        writeUserData(email, userId, photoURL, displayName, about);
        writeUserStorage(photoFile, photoURL);
        console.log('User data uploaded: ' + userId);
    })
    .catch((error) => { //report any errors
        console.log(error.message);
    });

    // For login
    //sign in a user
    firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(err => console.log(err)); //log any errors for debugging

    // For logout
    //sign out a user
    firebase.auth().signOut()
    .catch(err => console.log(err)); //log any errors for debugging

    // MODIFY BELOW FOR REACT STRUCTURE/UI
    return (
        <body>
            <header className="signup-page"> 
            {/* TODO: Entire UI for both sign up and login options*/}
            Sign up page
            </header>
        </body>
    );
}

// Write user data for realtime database
function writeUserData(email, userId, photoUrl, name, about) {
    database.ref('users/'+userId).set({
        displayName: name,
        email: email,
        imagePath: photoUrl,
        introduction: about,
    });
}

// Write user data for cloud storage
function writeUserStorage(photoFile, photoURL) {
    let photoUploadTask = storage.ref().child(photoURL).put(photoFile);
    photoUploadTask.on(storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    (snapshot) => {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
        case storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
        case storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
        default:
            
    }
    }, 
    (error) => {
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
        case 'storage/unauthorized':
        // User doesn't have permission to access the object
        break;
        case 'storage/canceled':
        // User canceled the upload
        break;

        case 'storage/unknown':
        // Unknown error occurred, inspect error.serverResponse
        break;
        default:
            console.log('Some other error has occurred');
    }
    }, 
    () => {
    // Upload completed successfully, now we can get the download URL
    photoUploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log('File available at', downloadURL);
    });
    }
    );
}