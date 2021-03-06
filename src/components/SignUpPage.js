import React, { useRef, useState } from "react"; //import React Component
import { Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";

import 'firebase/auth';
import 'firebase/compat/auth';
import { database } from "..";
import { storage } from "..";

export default function SignUpPage() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const displayNameRef = useRef();
    const aboutRef = useRef();
    const imageRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const [file, setFile] = useState();
  
    async function handleSubmit(e) {
        e.preventDefault();
        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
          return setError("Passwords do not match");
        }
        setError("");
        setLoading(true);
        let email = emailRef.current.value;
        let password = passwordRef.current.value;
        let displayName = displayNameRef.current.value;
        let about = aboutRef.current.value;
        let photoName = imageRef.current.value.split('\\').pop().split('/').pop();
        await signup(email, password)
        .then((userCredentials) => {
        let user = userCredentials.user; //access the newly created user and set fields
        user.updateProfile({
            displayName: displayName,
        })
        console.log('User created: '+user.uid);
        }).then(() => { 
          let userId = email.substring(0, email.indexOf("@"));   // User key
          let photoUrl = 'users/'+userId+'/profilePicture/'+photoName;    // The purpose of this field is to store a reference in the realtime database to the image file (which exists in the cloud storage)
          writeUserData(email, userId, photoUrl, displayName, about);
          writeUserStorage(file, photoUrl);
          console.log('User data uploaded: ' + userId);
        })
        .catch((error) => { //report any errors
            console.log(error.message);
            setError(error.message);
        });
        history.push("/");
        setLoading(false);
    }
  
    return (
    <div className="wrapper">
            <h2 className="text-center position-relative mt-4 header-padding">Sign Up</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="m-3" id="display">
                <Form.Label htmlFor="display name">Display Name</Form.Label>
                <Form.Control type="text" placeholder="Your public name" ref={displayNameRef} required />
              </Form.Group>
              <Form.Group className="m-3" id="about">
                <Form.Label htmlFor="about">About You</Form.Label>
                <Form.Control type="text" placeholder="Brief description" ref={aboutRef} required />
              </Form.Group>
              <Form.Group className="m-3" id="email">
                <Form.Label htmlFor="email">Email</Form.Label>
                <Form.Control type="email" ref={emailRef} required />
              </Form.Group>
              <Form.Group className="m-3" id="password">
                <Form.Label htmlFor="password">Password</Form.Label>
                <Form.Control type="password" ref={passwordRef} required />
              </Form.Group>
              <Form.Group className="m-3" id="password-confirm">
                <Form.Label htmlFor="password confirmation">Password Confirmation</Form.Label>
                <Form.Control type="password" ref={passwordConfirmRef} required />
              </Form.Group>
              <Form.Group controlId="formFile" className="m-3">
                <Form.Label>Profile Picture</Form.Label>
                <Form.Control onChange={(e) => setFile(e.target.files[0])} type="file" ref={imageRef} />
              </Form.Group>
              <Button disabled={loading} className=" btn-secondary mt-3 w-100" type="submit" aria-label="submit button">
                Sign Up
              </Button>
            </Form>
        <div className="w-100 text-center mt-2">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
    </div>
    )
}

// Write user data for realtime database
function writeUserData(email, userId, photoUrl, name, about) {
    database.ref('users/'+userId).set({
        displayName: name,
        email: email,
        imagePath: photoUrl,
        about: about,
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