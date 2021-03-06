import React from 'react';
import { Redirect } from 'react-router';
import { database } from "../..";
import { storage } from "../..";
import { Form, Button, Alert } from "react-bootstrap";
import { useState, useRef } from 'react';
import { useHistory } from 'react-router';
import { useAuth } from "../../contexts/AuthContext";
import FilterDropdown from '../FilterDropdown';


function UploadProjectPage(props) {
    let userId = props.userId;
    const { currentUser } = useAuth();
    const imageRef = useRef();
    const audioRef = useRef();
    const projectRef = useRef();
    const descriptionRef = useRef();
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedGenre, setGenre] = useState('All');
    const history = useHistory();

    // If user is not logged in, redirect them to login/signup page (DO NOT MODIFY)
    if (!currentUser) {
        return <Redirect to='/login'/>
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Set project data variables
        let name = projectRef.current.value;
        let description = descriptionRef.current.value;
        let photoName = imageRef.current.value.split('\\').pop().split('/').pop();
        let audioName = audioRef.current.value.split('\\').pop().split('/').pop();
        let genre = selectedGenre;
        let projectId = name.replace(/\s/g, '').toLowerCase();
        let audioFilePath = 'projects/' + userId + '/' + projectId + '/audio/' + audioName;
        let photoFilePath = 'projects/' + userId + '/' + projectId + '/image/' + photoName;

        writeProjectData(userId, projectId, name, genre, description, audioFilePath, photoFilePath);
        writeProjectStorage(imageFile, audioFile, photoFilePath, audioFilePath);
        setLoading(false);
        history.push("/dashboard" + userId);
    }
    
    return (
        <div className="wrapper">
                <h1 className="text-center mb-4 header-padding">Upload Project</h1>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="m-3 " id="name">
                    <Form.Label>Project Name</Form.Label>
                    <Form.Control type="text" placeholder="Public name of the project" ref={projectRef} required />
                  </Form.Group>
                  <Form.Group className="m-3" id="about">
                    <Form.Label>Project Description</Form.Label>
                    <Form.Control type="text" placeholder="Brief description" ref={descriptionRef} required />
                  </Form.Group>
                  <div className="m-3"><FilterDropdown callback={setGenre}/></div>
                  <Form.Group controlId="formFile" className="m-3">
                    <Form.Label>Project Cover Image</Form.Label>
                    <Form.Control onChange={(e) => setImageFile(e.target.files[0])} type="file" ref={imageRef} />
                  </Form.Group>
                  <Form.Group controlId="formFile" className="m-3">
                    <Form.Label>Project Audio File</Form.Label>
                    <Form.Control onChange={(e) => setAudioFile(e.target.files[0])} type="file" ref={audioRef} />
                  </Form.Group>
                  <Button disabled={loading} className=" btn-secondary m-3 w-100" type="submit">
                    Upload Project
                  </Button>
                </Form>
        </div>
        );
}

// Write project metadata to realtime database
function writeProjectData(userId, projectId, name, genre, description, audioFilePath, photoFilePath) {
    database.ref('projects/'+ userId + '/' + projectId).set({
        name: name,
        genre: genre,
        description: description,
        audioFilePath: audioFilePath,
        imagePath: photoFilePath,
        author: userId
    });
}

// Write project audio file and image to cloud storage
function writeProjectStorage(photoFile, audioFile, photoFilePath, audioFilePath) {
    storage.ref().child(photoFilePath).put(photoFile);
    storage.ref().child(audioFilePath).put(audioFile);
}

export default UploadProjectPage;
