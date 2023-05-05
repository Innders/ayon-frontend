// rawData = data from graphql
// icons = icons (folders, families, tasks) from redux
// type = 'folder' || 'subset' || 'task' || 'version'
// hierarchy = object of folder ids and folder data
export const transformFolder = (rawData = [], icons, type, hierarchy = {}) => {
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
    const x = columns * 200 + 300
    const y = 100

    // check if there is a parent
    // if there is a parent, add the parent to the nodes
    // and add an edge between the parent and the entity
    if (entity.parent) {
      const parentId = entity.parent.id
      const parentName = entity.parent.name
      const parentX = x - 200
      const parentY = y

      // parent node
      const parentNode = {
        id: parentId,
        data: {
          label: parentName,
          type: type,
          subType: entity.subType,
          icon: icons[type + 's'][entity.subType]?.icon || icons[type + 's']?.def?.icon || 'folder',
          iconDefault: icons[type + 's']?.def?.icon || 'folder',
        },
        position: { x: parentX, y: parentY },
        sourcePosition: 'right',
        targetPosition: 'left',
        type: 'entityNode',
      }
      nodes.push(parentNode)

      // create edges
      edges.push({
        id: `${parentName}-${entityName}`,
        source: parentId,
        target: entityId,
      })
    }

    // FOCUSED NODE
    const node = {
      id: entityId,
      data: {
        label: entityName,
        type: type,
        subType: entity.subType,
        icon: icons[type + 's'][entity.subType]?.icon || icons[type + 's']?.def || 'folder',
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

    let types = ['folder', 'subset', 'task', 'version']

    // add all type output nodes
    types.forEach((type) => {
      if (entity[type + 's']) {
        createOutputNodes(entity[type + 's'].edges.map((child) => ({ ...child.node, type })))
        outputRows += 1
      }
    })

    if (outputNodesCount) columns += 1
  })

  return { nodes, edges }
}
