import { Section } from '@ynput/ayon-react-components'
import ListGroup from '../ListGroup/ListGroup'
import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { onTaskSelected } from '/src/features/dashboard'
import { usePrefetchTask, useTaskClick } from '../../util'

const UserDashboardList = ({
  groupedTasks = {},
  groupedFields = [],
  groupByValue,
  isLoading,
  allUsers = [],
}) => {
  const containerRef = useRef(null)

  // create a ref for the list items
  const listItemsRef = useRef([])

  // store a reference to the list items in the ref
  useEffect(() => {
    listItemsRef.current = containerRef.current.querySelectorAll('li')
  }, [containerRef.current, isLoading, groupedTasks, groupedFields])

  const dispatch = useDispatch()
  // get all task ids in order
  const tasks = useMemo(() => {
    return groupedFields.flatMap(({ id }) => {
      const column = groupedTasks[id]
      if (!column) return []
      return column.tasks
    })
  }, [groupedTasks, groupedFields])

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks])

  // SELECTED TASKS
  const selectedTasks = useSelector((state) => state.dashboard.tasks.selected)
  const setSelectedTasks = (tasks) => dispatch(onTaskSelected(tasks))

  // PREFETCH TASK WHEN HOVERING
  // we keep track of the ids that have been pre-fetched to avoid fetching them again
  const handlePrefetch = usePrefetchTask(dispatch)

  // HANDLE TASK CLICK
  const taskClick = useTaskClick(dispatch)

  // KEYBOARD SUPPORT
  const handleKeyDown = (e) => {
    // if there are no tasks, do nothing
    if (!taskIds.length) return

    // if arrow down, select next task
    // if arrow down, select next task
    if (e.key === 'ArrowDown') {
      e.preventDefault()

      const currentIndex = taskIds.indexOf(selectedTasks[selectedTasks.length - 1])
      const nextIndex = Math.min(taskIds.length - 1, currentIndex + 1)
      const nextTaskId = taskIds[nextIndex]
      const newIds = [nextTaskId]
      if (e.shiftKey) {
        // holding shift key, add to the selected tasks
        newIds.unshift(...selectedTasks)
      }
      setSelectedTasks([nextTaskId])

      // get the next li element based on the nextIndex from the ref
      const nextLi = listItemsRef.current[nextIndex]
      if (nextLi) {
        // scroll the container to show the next li element
        const containerRect = containerRef.current.getBoundingClientRect()
        const nextLiRect = nextLi.getBoundingClientRect()
        const nextLiTop = nextLiRect.top - containerRect.top
        const nextLiHeight = nextLiRect.height
        const containerScrollTop = containerRef.current.scrollTop
        const containerHeight = containerRect.height
        if (nextLiTop + nextLiHeight > containerHeight) {
          containerRef.current.scrollTo({
            top: containerScrollTop + nextLiTop + nextLiHeight - containerHeight,
          })
        } else if (nextLiTop < 0) {
          containerRef.current.scrollTo({ top: containerScrollTop + nextLiTop })
        }

        // first focus item
        nextLi.focus()
        // prefect the task after the next task
        const nextNextTask = tasks[nextIndex + 1]
        console.log(nextNextTask)
        if (nextNextTask) {
          handlePrefetch(nextNextTask)
        }
      }
    }

    // if arrow up, select previous task
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const currentIndex = taskIds.indexOf(selectedTasks[0])
      const prevIndex = Math.max(0, currentIndex - 1)
      const prevTaskId = taskIds[prevIndex]
      const newIds = [prevTaskId]
      if (e.shiftKey) {
        // holding shift key, add to the selected tasks
        newIds.push(...selectedTasks)
      }
      setSelectedTasks(newIds)

      // get the previous li element based on the prevIndex from the ref
      const prevLi = listItemsRef.current[prevIndex]
      if (prevLi) {
        // scroll the container to show the previous li element
        const containerRect = containerRef.current.getBoundingClientRect()
        const prevLiRect = prevLi.getBoundingClientRect()
        const prevLiTop = prevLiRect.top - containerRect.top
        const prevLiHeight = prevLiRect.height
        const containerScrollTop = containerRef.current.scrollTop
        const containerHeight = containerRect.height
        const headerHeight = 42
        if (prevLiTop < 0) {
          containerRef.current.scrollTo({ top: containerScrollTop + prevLiTop - headerHeight })
        } else if (prevLiTop + prevLiHeight > containerHeight) {
          containerRef.current.scrollTo({
            top: containerScrollTop + prevLiTop + prevLiHeight - containerHeight,
          })
        }

        // focus item
        prevLi.focus()
        // prefect the task before the previous task
        const prevPrevTask = tasks[prevIndex - 1]

        if (prevPrevTask) {
          handlePrefetch(prevPrevTask)
        }
      }
    }
  }

  const handleTaskClick = (e, id) => {
    // update selected tasks
    taskClick(e, id)
  }

  return (
    <Section
      style={{
        height: '100%',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        overflowX: 'auto',
        padding: '0 8px',
        gap: 0,
      }}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      {groupedFields.flatMap(({ id }, i) => {
        const column = groupedTasks[id]
        if (!column) return []

        return (
          <ListGroup
            key={id}
            groups={groupedTasks}
            tasks={column.tasks}
            isLoading={isLoading}
            id={id}
            groupByValue={groupByValue}
            allUsers={allUsers}
            index={i}
            selectedTasks={selectedTasks}
            onTaskSelected={handleTaskClick}
            onTaskHover={(t) => handlePrefetch(t)}
          />
        )
      })}
    </Section>
  )
}

export default UserDashboardList