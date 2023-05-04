export const transformFolder = (data) => {
  // transform data into two arrays
  // one for nodes and one for edges
  // nodes = [{id, data: {label}, position: {x, y}}]
  // edges = [{id, source, target}]

  // nodes
  const nodes = []
  const edges = []

  // sort data by the number of parents
  // less parents first
  data.sort((a, b) => a.node.parents.length - b.node.parents.length)

  // keep track if which rows are taken
  let rows = 0

  // keep track of which parents have been connected
  const connectedParents = {}

  // add nodes
  data.forEach(({ node: entity }) => {
    const entityId = entity.id
    const entityName = entity.name
    const entityParents = entity.parents
    const depth = entityParents.length
    const x = rows * 200 + 50
    const y = 50 * depth + 100
    const node = {
      id: entityId,
      data: {
        label: entityName,
        type: entity.folderType,
      },
      position: { x, y },
      sourcePosition: 'right',
      targetPosition: 'left',
    }
    nodes.push(node)

    rows += 1

    // check to see if any other nodes are this node's parent
    // if so, add an edge
    data.forEach(({ node: p }) => {
      if (p.id === entityId) return

      if (entityParents.includes(p.name)) {
        const parents = connectedParents[p.name]

        // if the parent includes any of the other entity's parents, don't add
        const isAddEdge = parents ? !parents.some((parent) => entityParents.includes(parent)) : true

        if (!isAddEdge) return

        edges.push({
          id: `${p.name}-${entityName}`,
          source: p.id,
          target: entityId,
        })

        if (parents) {
          // add to existing array
          connectedParents[p.name].push(entityName)
        } else {
          // create new array
          connectedParents[p.name] = [entityName]
        }
      }
    })

    const createNodesAndEdges = (e) => {
      // add to nodes
      e.forEach((edge, i) => {
        const type = edge.node.taskType ? 'task' : 'subset'
        const edgeId = edge.node.id
        const edgeName = edge.node.name
        let subY = i * 50 + 100 + y
        if (type === 'task') {
          subY += 100
        }
        const node = {
          id: edgeId,
          data: {
            label: edgeName,
          },
          position: { x: x + 200, y: subY },
          targetPosition: 'left',
          sourcePosition: 'right',
        }
        nodes.push(node)

        // create edges
        edges.push({
          id: `${entityName}-${edgeName}`,
          source: entityId,
          target: edgeId,
        })

        // const workfilesNodes = (files) => {
        //   files.forEach((file, i) => {
        //     const fileId = file.node.id
        //     const fileName = file.node.name
        //     const fileY = i * 50 + 100 + subY
        //     const node = {
        //       id: fileId,
        //       data: {
        //         label: fileName,
        //       },
        //       position: { x: x + 400, y: fileY },
        //       targetPosition: 'left',
        //       sourcePosition: 'right',
        //     }
        //     nodes.push(node)

        //     // create edges
        //     edges.push({
        //       id: `${edgeName}-${fileName}`,
        //       source: edgeId,
        //       target: fileId,
        //     })
        //   })
        // }

        // if (edge.node.workfiles?.edges.length) {
        //   workfilesNodes(edge.node.workfiles.edges)
        // }

        // if (edge.node.versions?.edges.length) {
        //   workfilesNodes(edge.node.versions.edges)
        // }
      })
    }

    const e = [...entity.subsets.edges, ...entity.tasks.edges]

    if (e.length) {
      // add subsets and tasks
      createNodesAndEdges(e)

      rows += 1
    }
  })

  return { nodes, edges }
}
