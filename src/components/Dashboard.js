import { React, useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router';
import ProjectList from './projects/ProjectList';
import { Alert } from "react-bootstrap";
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from "react-router-dom";
import { getImage } from '../firebaseUtils';

export default function Dashboard(props) {
    const urlParams = useParams();
    const { logout } = useAuth();
    const[imageUrl, setImageUrl] = useState(null);
    const [error, setError] = useState("");
    const history = useHistory();
    const { currentUser } = useAuth();

    let selectedProjects = props.projectsData;
    let userData = props.userData;
    let urlUser = urlParams.userId;

    let user = userData[String(urlUser)];

    async function handleLogout() {
        setError('');
        try {
            await logout();
            history.push("/login");
        } catch {
            setError("Failed to log out");
        }
    }

    useEffect(() => {
        // Read image from cloud storage
        if (user) {
            getImage(setImageUrl, user['imagePath']);
        }
    }, [user]);

    if(!user) {
        return <h2>User not found</h2> //if user does not exist
    }
    if (!currentUser || props.userId !== urlUser)  {
        return <Redirect to="/login"/>
    }

    return (
        <div>
            <header className="profile-page headers bottom-padding">
                <div className="profile">
                    <div className="profile-image">
                        <img src={imageUrl} alt={urlUser + " profile image"}/>
                    </div>
                    <div className="profile-info">
                        <h1>{user['displayName']} (Me)</h1>
                        <h2>{user['about']}</h2>
                        <p><a className='text-dark' href={"mailto:"+user['email']}><span className="material-icons text-dark">email</span>{user['email']}</a></p>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <button variant="link" onClick={handleLogout} className="btn btn-danger">Log Out</button>
                    </div>
                </div>
            </header>
            <main>
                <div className="wrapper">
                    <h1 className="projects-title">Projects</h1>
                    <ProjectList projects={selectedProjects} userId={urlUser}/>
                </div>
            </main>
        </div>
    );
}
