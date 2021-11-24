import React from "react";
import ProjectCard from './ProjectCard';

function ProjectsPanel(props) {

    const projectsList = props.projects.map((project) => {
        return (
            <ProjectCard project={project} />
        );
    });

    return (
        <div className="project-panel">
            {projectsList}
        </div>
    );
}

export default ProjectsPanel;