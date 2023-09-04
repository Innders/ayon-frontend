import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectProject } from '/src/features/project'
import { selectProject as selectProjectContext, setUri } from '/src/features/context'
import { onProjectChange } from '/src/features/editor'
import { ayonApi } from '/src/services/ayon'
import { useGetAllProjectsQuery } from '/src/services/project/getProject'
import { useMemo, useRef } from 'react'
import { Button } from '@ynput/ayon-react-components'
import useCreateContext from '/src/hooks/useCreateContext'
import useLocalStorage from '/src/hooks/useLocalStorage'
import Menu from '/src/components/Menu/MenuComponents/Menu'
import ProjectMenuList from './ProjectMenuList'

const ProjectMenu = ({ visible, onHide }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const searchRef = useRef(null)
  const [pinned, setPinned] = useLocalStorage('projectMenu-pinned', [])

  const projectSelected = useSelector((state) => state.project.name)
  const user = useSelector((state) => state.user)
  const isUser = user?.data?.isUser

  const { data: projects = [] } = useGetAllProjectsQuery()

  const [showContext] = useCreateContext([])

  const handlePinChange = (projectName, e) => {
    e.originalEvent.stopPropagation()
    // e.originalEvent.preventDefault()
    if (pinned.includes(projectName)) {
      setPinned(pinned.filter((p) => p !== projectName))
    } else if (pinned.length < 5) {
      setPinned([...pinned, projectName])
    }
  }

  const buildContextMenu = (projectName) => {
    const isPinned = pinned.includes(projectName)
    const pinnedDisabled = pinned.length >= 5 && !isPinned

    const userItems = [
      {
        label: 'Project Dashboard',
        icon: 'empty_dashboard',
        command: () => navigate(`/manageProjects/dashboard?project=${projectName}`),
      },
      {
        label: pinnedDisabled ? 'Max 5 pinned' : `${isPinned ? 'Unpin' : 'Pin'} Project`,
        icon: 'push_pin',
        command: (e) => handlePinChange(projectName, e),
        disabled: pinnedDisabled,
      },
    ]

    if (!isUser) {
      userItems.push(
        ...[
          {
            label: 'Project Settings',
            icon: 'settings',
            command: () => navigate(`/manageProjects/projectSettings?project=${projectName}`),
          },
        ],
      )
    }

    return userItems
  }

  const projectItems = useMemo(() => {
    return projects.map((project) => ({
      id: project.name,
      label: [project.name, project.code],
      selected: project.name === projectSelected,
      onClick: () => onProjectSelect(project.name),
      onContextMenu: (e) => showContext(e, buildContextMenu(project.name)),
    }))
  }, [projects, projectSelected, pinned])

  const onProjectSelect = (projectName) => {
    onHide()

    // if already on project page, do not navigate
    if (window.location.pathname.includes(projectName)) return

    // reset selected folders
    dispatch(selectProject(projectName))
    // reset context for projects
    dispatch(selectProjectContext(projectName))
    // reset editor
    dispatch(onProjectChange(projectName))
    // remove editor query caches
    dispatch(ayonApi.util.invalidateTags(['branch', 'workfile', 'hierarchy', 'project', 'product']))
    // reset uri
    dispatch(setUri(`ayon+entity://${projectName}`))

    // if projects/[project] is null, projects/[projectName]/browser, else projects/[projectName]/[module]
    const link = window.location.pathname.includes('projects')
      ? `/projects/${projectName}/${window.location.pathname.split('/')[3] || 'browser'}`
      : `/projects/${projectName}/browser`

    navigate(link)
  }

  const handleNewProject = () => {
    navigate('/manageProjects/new')
    onHide()
  }

  if (!visible) return null

  const menuItems = [
    { node: <ProjectMenuList projectItems={projectItems} pinned={pinned} searchRef={searchRef} /> },
  ]

  return (
    <>
      <Menu menu={menuItems}></Menu>
      {!isUser && (
        <Button
          label="Create new project"
          onClick={handleNewProject}
          icon="create_new_folder"
          variant="filled"
          style={{ padding: '12px 0', borderRadius: 8 }}
        />
      )}
    </>
  )
}

export default ProjectMenu
