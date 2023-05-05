// rawData = data from graphql
// icons = icons (folders, families, tasks) from redux
// type = 'folder' || 'subset' || 'task' || 'version'
// hierarchy = object of folder ids and folder data
export const transformFolder = (rawData = [], projectIcons, type, hierarchy = {}) => {
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
    const entityName = entity.name
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

        const inputSubType = input.subType
        const inputName = input.name
        const inputX = x - 300
        const inputY = y + i * 100

        // parent node
        const parentNode = {
          id: inputId,
          data: {
            label: inputName,
            type: inputType,
            subType: inputSubType,
            icon:
              icons[inputType + 's'][inputSubType]?.icon ||
              icons[inputType + 's']?.def?.icon ||
              'folder',
            iconDefault: icons[inputType + 's']?.def?.icon || 'folder',
          },
          position: { x: inputX, y: inputY },
          sourcePosition: 'right',
          targetPosition: 'left',
          type: 'entityNode',
        }
        nodes.push(parentNode)

        // create edges
        edges.push({
          id: `${inputName}-${entityName}`,
          source: inputId,
          target: entityId,
        })
      }
    })

    // FOCUSED NODE
    const node = {
      id: entityId,
      data: {
        label: entityName,
        type: type,
        subType: entity.subType,
        icon: icons[type + 's'][entity.subType]?.icon || icons[type + 's']?.def?.icon || 'folder',
        iconDefault: icons[type + 's']?.def?.icon || 'folder',
        focused: true,
      },
      position: { x, y },
      sourcePosition: 'right',
      targetPosition: 'left',
      type: 'entityNode',
    }
    nodes.push(node)

    columns += 1

    let outputNodesCount = 0

    const createOutputNodes = (e) => {
      // add to nodes
      e.forEach((child) => {
        // add to count
        const childType = child.type
        const childId = child.id
        const childName = child.name

        // use the count to determine the y position
        let subY = outputNodesCount * 50 + 100
        // offset y by outputRows
        subY += outputRows * 50

        outputNodesCount += 1

        // child node
        const node = {
          id: childId,
          data: {
            label: childName,
            type: childType,
            icon:
              icons[childType + 's']?.[child.subType]?.icon || icons[childType + 's']?.def?.icon,
            iconDefault: icons[childType + 's']?.def?.icon,
            ...child,
          },
          position: { x: x + 300, y: subY },
          targetPosition: 'left',
          sourcePosition: 'right',
          type: 'entityNode',
        }
        nodes.push(node)

        // create edges
        edges.push({
          id: `${entityName}-${childName}`,
          source: entityId,
          target: childId,
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

    if (outputNodesCount) columns += 1
  })

  return { nodes, edges }
}
