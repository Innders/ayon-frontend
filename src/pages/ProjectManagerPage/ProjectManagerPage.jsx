import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { StringParam, useQueryParam, withDefault } from 'use-query-params'

import AddonSettings from '/src/containers/AddonSettings'

import ProjectAnatomy from './ProjectAnatomy'
import ProjectRoots from './ProjectRoots'
import NewProjectDialog from './NewProjectDialog'
import ProjectDashboard from '/src/pages/ProjectDashboard'

import { selectProject } from '/src/features/context'
import { useDeleteProjectMutation } from '/src/services/project/updateProject'
import TeamsPage from '../TeamsPage'
import ProjectManagerPageContainer from './ProjectManagerPageContainer'
import ProjectManagerPageLayout from './ProjectManagerPageLayout'
import AppNavLinks from '/src/containers/header/AppNavLinks'
import confirmDelete from '/src/helpers/confirmDelete'

const ProjectSettings = ({ projectList, projectManager, projectName }) => {
  return (
    <ProjectManagerPageLayout projectList={projectList} passthrough={!projectManager}>
      <AddonSettings projectName={projectName} />
    </ProjectManagerPageLayout>
  )
}
const SiteSettings = ({ projectList, projectManager, projectName }) => {
  return (
    <ProjectManagerPageLayout projectList={projectList} passthrough={!projectManager}>
      <AddonSettings showSites projectName={projectName} />
    </ProjectManagerPageLayout>
  )
}

const ProjectManagerPage = () => {
  // get is user from context
  const isUser = useSelector((state) => state.user.data.isUser)
  const projectName = useSelector((state) => state.project.name)
  const dispatch = useDispatch()

  let { module } = useParams()

  const [showNewProject, setShowNewProject] = useState(false)

  // QUERY PARAMS STATE
  const [selectedProject, setSelectedProject] = useQueryParam(
    'project',
    withDefault(StringParam, projectName),
  )

  useEffect(() => {
    // Update project name in header
    dispatch(selectProject(selectedProject))
  }, [selectedProject])

  // Search params
  const [searchParams] = useSearchParams()
  const queryProject = searchParams.get('project')

  //   // set initial selected project
  useEffect(() => {
    if (queryProject) setSelectedProject(queryProject)
  }, [])

  const [deleteProject] = useDeleteProjectMutation()

  const handleDeleteProject = () => {
    confirmDelete({
      label: `Project: ${selectedProject}`,
      accept: async () => {
        await deleteProject({ projectName: selectedProject }).unwrap()
        setSelectedProject(null)
      },
    })
  }

  let links = [
    {
      name: 'Dashboard',
      path: '/manageProjects/dashboard',
      module: 'dashboard',
      accessLevels: [],
    },
    {
      name: 'Anatomy',
      path: '/manageProjects/anatomy',
      module: 'anatomy',
      accessLevels: ['manager'],
    },
    {
      name: 'Project settings',
      path: '/manageProjects/projectSettings',
      module: 'projectSettings',
      accessLevels: ['manager'],
    },
    {
      name: 'Site settings',
      path: '/manageProjects/siteSettings',
      module: 'siteSettings',
      accessLevels: [],
    },
    {
      name: 'Roots',
      path: '/manageProjects/roots',
      module: 'roots',
      accessLevels: ['manager'],
    },
    {
      name: 'Teams',
      path: '/manageProjects/teams',
      module: 'teams',
      accessLevels: ['manager'],
    },
  ]

  const linksWithProject = useMemo(
    () =>
      links.map((link) => ({
        ...link,
        path: link.path + (selectedProject ? `?project=${selectedProject}` : ''),
      })),
    [links, selectedProject],
  )

  return (
    <>
      <AppNavLinks links={linksWithProject} />
      {/* container wraps all modules and provides selectedProject, ProjectList comp and Toolbar comp as props */}
      <ProjectManagerPageContainer
        selection={selectedProject}
        onSelect={setSelectedProject}
        onNoProject={(s) => setSelectedProject(s)}
        isUser={isUser}
        onNewProject={() => setShowNewProject(true)}
        onDeleteProject={handleDeleteProject}
      >
        {module === 'dashboard' && <ProjectDashboard />}
        {module === 'anatomy' && <ProjectAnatomy />}
        {module === 'projectSettings' && <ProjectSettings />}
        {module === 'siteSettings' && <SiteSettings />}
        {module === 'roots' && <ProjectRoots />}
        {module === 'teams' && <TeamsPage />}
      </ProjectManagerPageContainer>

      {showNewProject && (
        <NewProjectDialog
          onHide={(name) => {
            setShowNewProject(false)
            setSelectedProject(name)
          }}
        />
      )}
    </>
  )
}

export default ProjectManagerPage
