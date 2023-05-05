import { createUserNode } from './user'

const createEntityNode = (entity, type, icons, data) => ({
  id: entity.id,
  type: 'entityNode',
  data: {
    label: entity.name,
    type: type,
    icon: icons[type + 's']?.[entity.subType]?.icon || icons[type + 's']?.def?.icon,
    iconDefault: icons[type + 's']?.def?.icon,
    ...entity,
    ...data,
  },
})

// rawData = data from graphql
// icons = icons (folders, families, tasks) from redux
// type = 'folder' || 'subset' || 'task' || 'version'
// hierarchy = object of folder ids and folder data
export const transformEntity = (rawData = [], projectIcons, type, hierarchy = {}, users = []) => {
  const extraIcons = {
    versions: { def: { icon: 'layers' } },
    workfiles: { def: { icon: 'home_repair_service' } },
    representations: { def: { icon: 'view_in_ar' } },
  }

  // merge icons and extraIcons
  const icons = { ...projectIcons, ...extraIcons }

  const data = [...rawData]
  // transform data into two arrays
  // one for nodes and one for edges
  // nodes = [{id, data: {label}, position: {x, y}}]
  // edges = [{id, source, target}]

  // nodes
  const nodes = []
  const edges = []

  // sort data by the number of parents
  // less parents first
  data.sort((a, b) => a?.node?.parents?.length - b?.node?.parents?.length)

  // keep track if which rows are taken
  let columns = 0
  let outputRows = 0

  // add nodes
  data.forEach(({ node: entity }) => {
    const entityId = entity.id
    // const parentId = entity.parentId
    const x = columns * 200 + 400
    const y = 100

    let inputTypes

    switch (type) {
      case 'folder':
        inputTypes = ['folder']
        break
      case 'subset':
        inputTypes = ['folder']
        break
      case 'task':
        inputTypes = ['folder']
        break
      case 'version':
        inputTypes = ['subset', 'task']
        break
      default:
        inputTypes = ['folder']
        break
    }

    // check if there is a parent for each input type
    // if there is a parent, add the parent to the nodes
    // and add an edge between the parent and the entity

    inputTypes.forEach((inputType, i) => {
      if (entity[inputType]) {
        const input = entity[inputType]
        const inputId = input.id

        const inputName = input.name
        const inputX = x - 300
        const inputY = y + i * 100

        // parent node
        const parentNode = {
          id: inputId,
          ...createEntityNode(input, inputType, icons),
          position: { x: inputX, y: inputY },
        }
        nodes.push(parentNode)

        // create edges
        edges.push({
          id: `${inputName}-${entityId}`,
          source: inputId,
          target: entityId,
        })
      }
    })

    // FOCUSED NODE
    const node = {
      id: entityId,
      ...createEntityNode(entity, type, icons, { focused: true }),
      position: { x, y },
    }
    nodes.push(node)

    columns += 1

    let outputNodesCount = 0

    const createOutputNodes = (e) => {
      // add to nodes
      e.forEach((child, i) => {
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

        if (childType === 'user') {
          // over ride and put users above
          subY = i * gap - 50
        }

        // child node
        const node = {
          ...(childType === 'user'
            ? createUserNode(child)
            : createEntityNode(child, childType, icons)),
          position: { x: x + 300, y: subY },
        }

        nodes.push(node)

        // create edges
        edges.push({
          id: `${entityId}-${childId || childName}`,
          source: entityId,
          target: childId || childName,
        })
      })
    }

    // folders can have child folders, but we need to extract them from hierarchy
    if (type === 'folder' && entity.hasChildren) {
      const folderNode = hierarchy[entityId]
      if (folderNode?.children?.length) {
        createOutputNodes(
          folderNode?.children?.map((child) => ({
            ...child,
            type: 'folder',
            subType: child.folderType,
          })),
        )
        outputRows += 1
      }
    }

    const types = ['folder', 'subset', 'task', 'version', 'representation', 'workfile']
    const leafs = ['representation', 'workfile']

    // add all type output nodes
    types.forEach((type) => {
      if (entity[type + 's']) {
        createOutputNodes(
          entity[type + 's'].edges.map((child) => ({
            ...child.node,
            type,
            isLeaf: leafs.includes(type),
          })),
        )
        outputRows += 1
      }
    })

    // add all user output nodes
    if (users.length) {
      const usersData = users.map((user) => ({
        ...user,
        type: 'user',
      }))
      createOutputNodes(usersData)
      outputRows += 1
    }

    if (outputNodesCount) columns += 1
  })

  return { nodes, edges }
}
