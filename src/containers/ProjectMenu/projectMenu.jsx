import { useNavigate } from 'react-router-dom'
import * as Styled from './projectMenu.styled'
import { useDispatch, useSelector } from 'react-redux'
import { selectProject } from '/src/features/project'
import { selectProject as selectProjectContext, setUri } from '/src/features/context'
import { onProjectChange } from '/src/features/editor'
import { ayonApi } from '/src/services/ayon'
import MenuList from '/src/components/Menu/MenuComponents/MenuList'
import { useGetAllProjectsQuery } from '/src/services/project/getProject'
import { useMemo, useRef, useState } from 'react'
import { Button, InputText, Section } from '@ynput/ayon-react-components'
import useCreateContext from '/src/hooks/useCreateContext'

const ProjectMenu = ({ visible, onHide }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const searchRef = useRef(null)

  const projectSelected = useSelector((state) => state.project.name)
  const user = useSelector((state) => state.user)
  const isUser = user?.data?.isUser

  const [projectsFilter, setProjectsFilter] = useState('')

  const { data: projects = [] } = useGetAllProjectsQuery()

  const [showContext] = useCreateContext([])

  const buildContextMenu = (projectName) => {
    const userItems = [
      {
        label: 'Dashboard',
        icon: 'empty_dashboard',
        command: () => navigate(`/manageProjects/dashboard?project=${projectName}`),
      },
    ]

    if (!isUser) {
      userItems.push(
        ...[
          {
            label: 'Settings',
            icon: 'settings',
            command: () => navigate(`/manageProjects/projectSettings?project=${projectName}`),
          },
        ],
      )
    }

    return userItems
  }

  const menuItems = useMemo(() => {
    return projects
      .filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(projectsFilter.toLowerCase())
        const codeMatch = p.code?.toLowerCase().includes(projectsFilter.toLowerCase())
        return nameMatch || codeMatch
      })
      .map((project) => ({
        id: project.name,
        label: [project.name, project.code],
        selected: project.name === projectSelected,
        onClick: () => onProjectSelect(project.name),
        onContextMenu: (e) => showContext(e, buildContextMenu(project.name)),
      }))
  }, [projects, projectSelected, projectsFilter])

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

  return (
    <Styled.ProjectSidebar
      position="left"
      visible={visible}
      onHide={onHide}
      modal={false}
      showCloseIcon={false}
      onShow={() => searchRef.current?.focus()}
    >
      <Section>
        <Styled.Header>
          <InputText
            placeholder="Search projects..."
            value={projectsFilter}
            onChange={(e) => setProjectsFilter(e.target.value)}
            ref={searchRef}
          />
        </Styled.Header>
        <MenuList items={menuItems} handleClick={(e, onClick) => onClick()} level={0} />
      </Section>
      {!isUser && (
        <Button
          label="Create new project"
          onClick={handleNewProject}
          icon="create_new_folder"
          variant="filled"
          style={{ padding: '12px 0', borderRadius: 8 }}
        />
      )}
    </Styled.ProjectSidebar>
  )
}

export default ProjectMenu