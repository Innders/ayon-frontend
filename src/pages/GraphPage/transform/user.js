import { createEntityNode } from './entity'

export const createUserNode = (user = {}, data = {}) => ({
  id: user.name,
  type: 'userNode',
  data: {
    label: `${user.attrib?.fullName} (${user.name})`,
    type: 'user',
    ...user,
    ...data,
  },
})

// rawData = data from graphql
// icons = icons (folders, families, tasks) from redux
// type = 'folder' || 'subset' || 'task' || 'version'
// hierarchy = object of folder ids and folder data
export const transformUser = (rawData = [], icons, users = []) => {
  const data = [...rawData]
  // transform data into two arrays
  // one for nodes and one for edges
  // nodes = [{id, data: {label}, position: {x, y}}]
  // edges = [{id, source, target}]

  // nodes
  const nodes = []
  const edges = []

  // keep track if which rows are taken
  let columns = 0
  let outputRows = 0

  // add nodes
  data.forEach((user) => {
    const entityId = user.name
    // const parentId = user.parentId
    const x = columns * 500 + 400
    const y = 100

    // FOCUSED NODE
    const node = {
      id: entityId,
      ...createUserNode(user, { focused: true }),
      position: { x, y },
    }

    nodes.push(node)

    columns += 1

    let outputNodesCount = 0

    const folderIds = []
    const createOutputNodes = (e) => {
      // add to nodes
      e.forEach((child) => {
        // add to count
        const childType = child.type
        const childId = child.id
        const childName = child.name
        let gap = 50

        // use the count to determine the y position
        let subY = outputNodesCount * gap + 100
        // offset y by outputRows
        subY += outputRows * gap

        outputNodesCount += 1

        const childX = x + 400
        // child node
        const node = {
          ...createEntityNode(child, childType, icons),
          position: { x: childX, y: subY },
        }

        nodes.push(node)

        // create edges
        edges.push({
          id: `${entityId}-${childId}`,
          source: entityId,
          target: childId || childName,
        })

        // create folder for each task

        if (!folderIds.includes(child.folder.id)) {
          // create new folder node
          // place same y but x + 100
          const folderNode = {
            ...createEntityNode(child.folder, 'folder', icons),
            position: { x: childX + 200, y: subY },
          }

          // create an edge from the task to the folder
          edges.push({
            id: `${childId}-${child.folder.id}`,
            source: childId,
            target: child.folder.id,
          })

          nodes.push(folderNode)
        }
      })
    }

    const types = ['task']

    // let folders = []
    // // extra folders from each task
    // if (user.tasks) {
    //   user.tasks.edges.forEach(({ node }) => node?.folder && folders.push({...node.folder}))
    // }

    // add all type output nodes
    types.forEach((type) => {
      if (user[type + 's']) {
        createOutputNodes(
          user[type + 's'].edges.map((child) => ({
            ...child.node,
            type,
          })),
        )
        outputRows += 1
      }
    })

    if (outputNodesCount) columns += 1
  })

  // add users that are on the same tasks
  users.forEach((user, i) => {
    const userY = 200 + i * 50
    // create a node for user
    const node = {
      ...createUserNode(user),
      position: { x: 400, y: userY },
    }

    nodes.push(node)

    console.log(user)

    // attach user to it's tasks
    user.tasks?.edges.forEach(({ node: { id } }) => {
      edges.push({
        id: `${user.name}-${id}`,
        source: user.name,
        target: id,
        style: {
          opacity: 0.2,
        },
      })
    })
  })

  return { nodes, edges }
}
