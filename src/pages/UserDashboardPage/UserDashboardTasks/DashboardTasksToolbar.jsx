import { InputText, SortingDropdown, Spacer, Toolbar } from '@ynput/ayon-react-components'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  onAssigneesChanged,
  onTasksFilterChanged,
  onTasksGroupByChanged,
  onTasksSortByChanged,
} from '/src/features/dashboard'
import MeOrUserSwitch from '/src/components/MeOrUserSwitch/MeOrUserSwitch'

const DashboardTasksToolbar = ({ allUsers = [], isLoadingAllUsers }) => {
  const dispatch = useDispatch()

  const user = useSelector((state) => state.user)
  const isAdmin = user?.data?.isAdmin

  // ASSIGNEES SELECT
  const assignees = useSelector((state) => state.dashboard.tasks.assignees)
  const assigneesIsMe = useSelector((state) => state.dashboard.tasks.assigneesIsMe)

  const setAssignees = (payload) => dispatch(onAssigneesChanged(payload))

  // SORT BY
  const sortByOptions = [
    { id: 'folderName', label: 'Folder', sortOrder: true },
    { id: 'name', label: 'Task', sortOrder: true },
    { id: 'status', label: 'Status', sortOrder: true },
  ]
  const sortByValue = useSelector((state) => state.dashboard.tasks.sortBy)
  const setSortByValue = (value) => dispatch(onTasksSortByChanged(value))

  // GROUP BY
  const groupByOptions = [
    { id: 'projectName', label: 'Project', sortOrder: true },
    // { id: 'status', label: 'Status', sortOrder: true },
    { id: 'taskType', label: 'Type', sortOrder: true },
  ]

  const assigneesGroupBy = { id: 'assignees', label: 'Assignee', sortOrder: true }
  if (!assigneesIsMe) {
    groupByOptions.push(assigneesGroupBy)
  }

  const groupByValue = useSelector((state) => state.dashboard.tasks.groupBy)
  const setGroupByValue = (value) => dispatch(onTasksGroupByChanged(value))

  // FILTER
  const filterValue = useSelector((state) => state.dashboard.tasks.filter)
  const setFilterValue = (value) => dispatch(onTasksFilterChanged(value))

  const addRemoveGroupByAssignees = (add) => {
    const groupBy = [...groupByValue]
    const assigneesIndex = groupBy.findIndex((item) => item.id === 'assignees')

    if (add && assigneesIndex === -1) {
      groupBy.push(assigneesGroupBy)
    } else if (!add && assigneesIndex !== -1) {
      groupBy.splice(assigneesIndex, 1)
    }

    setGroupByValue(groupBy)
  }

  const handleAssigneesChange = (isMe, newAssignees = []) => {
    if (isMe) {
      // setting back to me
      const payload = {
        assigneesIsMe: true,
        assignees: assignees,
      }

      // update assignees to me
      setAssignees(payload)

      // remove assignees from group by
      addRemoveGroupByAssignees(false)

      return
    } else if (!newAssignees.length) {
      // assignees cleared so set back to me
      const payload = {
        assigneesIsMe: true,
        assignees: [],
      }

      // update assignees to me
      setAssignees(payload)
      // remove assignees from group by
      addRemoveGroupByAssignees(false)

      return
    } else {
      // assignees changed, set to new assignees
      const payload = {
        assigneesIsMe: false,
        assignees: newAssignees,
      }

      // update assignees to new assignees and remove isMe
      setAssignees(payload)

      // add assignees to group by
      addRemoveGroupByAssignees(true)

      return
    }
  }

  return (
    <Toolbar style={{ zIndex: 100, padding: '1px 8px' }}>
      <SortingDropdown
        title="Sort by"
        options={sortByOptions}
        value={sortByValue}
        onChange={setSortByValue}
      />
      <SortingDropdown
        title="Group by"
        options={groupByOptions}
        value={groupByValue}
        onChange={setGroupByValue}
      />
      <InputText
        placeholder="Filter tasks..."
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
      />
      <Spacer />
      {isAdmin && !isLoadingAllUsers && (
        <MeOrUserSwitch
          value={assignees}
          onAssignee={(a) => handleAssigneesChange(false, a)}
          isMe={assigneesIsMe}
          onMe={() => handleAssigneesChange(true)}
          options={allUsers}
          align={'right'}
          placeholder="Assignees"
          editor
          buttonStyle={{ outline: '1px solid var(--md-sys-color-outline-variant)' }}
          style={{ zIndex: 20 }}
        />
      )}
    </Toolbar>
  )
}

export default DashboardTasksToolbar