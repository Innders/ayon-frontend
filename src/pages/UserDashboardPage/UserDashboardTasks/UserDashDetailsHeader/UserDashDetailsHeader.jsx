import { AssigneeSelect, Button, Icon, OverflowField, Section } from '@ynput/ayon-react-components'
import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Styled from './UserDashDetailsHeader.styled'
import copyToClipboard from '/src/helpers/copyToClipboard'
import StackedThumbnails from '/src/pages/EditorPage/StackedThumbnails'
import {
  useGetProjectsInfoQuery,
  useGetTasksDetailsQuery,
} from '/src/services/userDashboard/getUserDashboard'
import { getIntersectionFields, getMergedFields } from '../../util'
import { union } from 'lodash'
import { useUpdateTasksMutation } from '/src/services/userDashboard/updateUserDashboard'
import { toast } from 'react-toastify'
import Actions from '/src/components/Actions/Actions'
import { onAttributesOpenChanged } from '/src/features/dashboard'
import TaskAttributes from '../TaskAttributes/TaskAttributes'

const UserDashDetailsHeader = ({ tasks = [], selectedProjects = [], users = [] }) => {
  const dispatch = useDispatch()
  const selectedTasksIds = useSelector((state) => state.dashboard.tasks.selected)
  const attributesOpen = useSelector((state) => state.dashboard.tasks.attributesOpen)
  const setAttributesOpen = (value) => dispatch(onAttributesOpenChanged(value))

  const { data: projectsInfo = {} } = useGetProjectsInfoQuery(
    { projects: selectedProjects },
    { skip: !selectedProjects?.length },
  )

  //   find selected tasks
  const selectedTasks = useMemo(() => {
    if (!selectedTasksIds?.length) return []
    return tasks.filter((task) => selectedTasksIds.includes(task.id))
  }, [selectedTasksIds, tasks])

  // now we get the full details data for selected tasks
  const { data: tasksDetailsData, isFetching: isLoadingTasksDetails } = useGetTasksDetailsQuery(
    { tasks: selectedTasks },
    { skip: !selectedTasksIds?.length },
  )

  const selectedTasksProjects = useMemo(
    () => selectedTasks.map((t) => t.projectName),
    [selectedTasks],
  )

  // for selected projects, make sure user is on all
  const [, disabledProjectUsers] = useMemo(() => {
    if (!selectedTasksProjects?.length) return [users, []]
    return users.reduce(
      (acc, user) => {
        if (selectedTasksProjects.every((p) => user.projects.includes(p))) {
          acc[0].push(user)
        } else {
          acc[1].push(user)
        }
        return acc
      },
      [[], []],
    )
  }, [selectedTasksProjects, users])

  // for selected tasks, get flat list of assignees
  const selectedTasksAssignees = useMemo(
    () => union(...selectedTasks.map((t) => t.assignees)),
    [selectedTasks],
  )

  const singleTask = selectedTasks[0]

  const thumbnails = useMemo(
    () =>
      selectedTasks
        .filter((t, i) => i <= 5)
        .map((t) => ({
          src: t.thumbnailUrl,
          icon: t.taskIcon,
        })),
    [selectedTasks],
  )

  // we need to get the intersection of all the statuses of the projects for the selected tasks
  // this means that if we have 2 tasks from 2 different projects, we need to get the intersection of the statuses of those 2 projects
  //  and it prevents us from showing statuses that are not available for the selected tasks
  const statusesValue = useMemo(() => selectedTasks.map((t) => t.status), [selectedTasks])
  const statusesOptions = useMemo(() => getMergedFields(projectsInfo, 'statuses'), [projectsInfo])
  const StatusesOptionsIntersect = useMemo(
    () =>
      selectedProjects.length > 1
        ? getIntersectionFields(projectsInfo, 'statuses', selectedTasksProjects)
        : statusesOptions,
    [projectsInfo, selectedTasksProjects],
  )

  // all statuses that are not in the intersection of the statuses of the selected tasks
  const disabledStatuses = useMemo(
    () =>
      statusesOptions
        .filter((s) => !StatusesOptionsIntersect.some((s2) => s2.name === s.name))
        .map((s) => s.name),
    [statusesOptions, StatusesOptionsIntersect],
  )

  const isMultiple = selectedTasks.length > 1

  const [updateTasks] = useUpdateTasksMutation()
  const handleUpdate = async (field, value) => {
    try {
      // build tasks operations array
      const tasksOperations = selectedTasks.map((task) => ({
        id: task.id,
        projectName: task.projectName,
        data: {
          [field]: value,
        },
      }))

      await updateTasks({ operations: tasksOperations })
    } catch (error) {
      toast.error('Error updating task(s)')
    }
  }

  if (!singleTask) return null
  const fullPath = singleTask.path + '/' + singleTask.name
  const pathArray = fullPath.split('/')
  const handleCopyPath = () => {
    copyToClipboard(fullPath)
  }

  // DUMMY ACTIONS DATA
  const actions = [
    { id: 'nuke', icon: 'nuke.png', pinned: 'actions2D' },
    { id: 'afterEffects', icon: 'after-effects.png', pinned: 'actions2D' },
    { id: 'maya', icon: 'maya.png', pinned: 'actions3D' },
    { id: 'houdini', icon: 'houdini.png', pinned: 'actions3D' },
    { id: 'photoshop', icon: 'photoshop.png' },
  ]

  const actionTaskTypes = {
    actions2D: ['compositing', 'roto', 'matchmove', 'edit', 'paint'],
    actions3D: [
      'modeling',
      'texture',
      'lookdev',
      'rigging',
      'layout',
      'setdress',
      'animation',
      'fx',
      'lighting',
    ],
  }

  const pinned = actions
    .filter((action) => {
      const actions = actionTaskTypes[action.pinned]
      if (!actions) return false
      return actions.some((action) => action.toLowerCase() === singleTask.taskType.toLowerCase())
    })
    .map((action) => action.id)

  return (
    <Section
      style={{
        padding: 8,
        alignItems: 'flex-start',
        gap: 8,
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        flex: 'none',
      }}
    >
      <OverflowField
        value={pathArray.join(' / ')}
        align="left"
        onClick={handleCopyPath}
        isCopy
        icon="content_copy"
        style={{ zIndex: 100 }}
      />
      <Styled.Header>
        <StackedThumbnails thumbnails={thumbnails} />
        <Styled.Content>
          <h2>{!isMultiple ? singleTask.folderName : `${selectedTasks.length} tasks selected`}</h2>
          <h3>{!isMultiple ? singleTask.name : selectedTasks.map((t) => t.name).join(', ')}</h3>
        </Styled.Content>
      </Styled.Header>
      <Styled.StatusAssignees>
        <Styled.TaskStatusSelect
          value={statusesValue}
          options={statusesOptions}
          disabledValues={disabledStatuses}
          invert
          style={{ maxWidth: 'unset' }}
          onChange={(value) => handleUpdate('status', value)}
        />
        <AssigneeSelect
          value={isMultiple ? selectedTasksAssignees : singleTask.assignees}
          options={users}
          disabledValues={disabledProjectUsers.map((u) => u.name)}
          isMultiple={isMultiple && selectedTasksAssignees.length > 1}
          editor
          align="right"
          onChange={(value) => handleUpdate('assignees', value)}
        />
      </Styled.StatusAssignees>
      <Styled.Footer>
        <Actions options={actions} pinned={pinned} />
        <Button
          label="Attributes"
          variant={attributesOpen ? 'tonal' : 'text'}
          style={{ padding: 6 }}
          onClick={() => setAttributesOpen(!attributesOpen)}
        >
          <Icon
            icon="expand_more"
            style={{
              transform: attributesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </Button>
      </Styled.Footer>
      {attributesOpen && (
        <TaskAttributes tasks={tasksDetailsData} isLoading={isLoadingTasksDetails} />
      )}
    </Section>
  )
}

export default UserDashDetailsHeader

// {
//   "id": "739af4b83da311eeac5d0242ac120004",
//   "name": "modeling",
//   "status": "In progress",
//   "taskType": "Modeling",
//   "assignees": [
//       "Innders"
//   ],
//   "updatedAt": "2023-08-30T15:14:45.427705+00:00",
//   "folderName": "00_kloecksiouys_mccrietsoiwn",
//   "folderId": "739a748e3da311eeac5d0242ac120004",
//   "path": "assets/characters/00_kloecksiouys_mccrietsoiwn",
//   "projectName": "demo_Commercial",
//   "latestVersionId": "73c080f23da311eeac5d0242ac120004",
//   "latestVersionThumbnailId": "08b9986c474811eea5d60242ac120004",
//   "thumbnailUrl": "/api/projects/demo_Commercial/thumbnails/08b9986c474811eea5d60242ac120004?updatedAt=2023-08-30T15:14:45.427705+00:00&token=0848587a83cd065914bf9e6c0792bdd246910cbd2ea520115f802d6adbc9e396",
//   "statusIcon": "play_arrow",
//   "statusColor": "#3498db",
//   "taskIcon": "language"
// }