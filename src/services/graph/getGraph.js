import { ayonApi } from '../ayon'
import { FOLDER_QUERY, SUBSET_QUERY, TASK_QUERY, VERSION_QUERY } from './queries'
import ayonClient from '/src/ayon'

const buildEntitiesQuery = (type, attribs) => {
  let f_attribs = attribs || ''
  if (!attribs) {
    for (const attrib of ayonClient.settings.attributes) {
      if (attrib.scope.includes(type)) f_attribs += `${attrib.name}\n`
    }
  }

  let QUERY
  switch (type) {
    case 'task':
      QUERY = TASK_QUERY
      break
    case 'folder':
      QUERY = FOLDER_QUERY
      break
    case 'version':
      QUERY = VERSION_QUERY
      break
    case 'subset':
      QUERY = SUBSET_QUERY
      break
    default:
      break
  }

  if (!QUERY) return null

  return QUERY.replace('#ATTRS#', f_attribs)
}

const transformFolder = (data) => {
  // transform data into two arrays
  // one for nodes and one for edges
  // nodes = [{id, data: {label}, position: {x, y}}]
  // edges = [{id, source, target}]

  // nodes
  const nodes = []
  const edges = []

  // add nodes
  for (const parent of data) {
    const parentId = parent.node.id
    const parentName = parent.node.name
    const node = {
      id: parentId,
      data: {
        label: parentName,
        type: parent.node.folderType,
      },
      position: { x: 100, y: 100 },
      sourcePosition: 'right',
    }
    nodes.push(node)

    const createNodesAndEdges = (e, type) => {
      // add to nodes
      for (const edge of e) {
        const edgeId = edge.node.id
        const edgeName = edge.node.name
        let y = (nodes.length - 1) * 50 + 100
        if (type === 'task') {
          y += 100
        }
        const node = {
          id: edgeId,
          data: {
            label: edgeName,
          },
          position: { x: 600, y },
          targetPosition: 'left',
        }
        nodes.push(node)

        // create edges
        edges.push({
          id: `${parentName}-${edgeName}`,
          source: parentId,
          target: edgeId,
        })
      }
    }

    // add subsets
    createNodesAndEdges(parent.node.subsets.edges, 'subset')
    // add tasks
    createNodesAndEdges(parent.node.tasks.edges, 'task')
  }

  return { nodes, edges }
}

const transformToType = (data, type) => {
  switch (type) {
    case 'folder':
      return transformFolder(data)
    default:
      break
  }
}

const getGraph = ayonApi.injectEndpoints({
  endpoints: (build) => ({
    getEntitiesGraph: build.query({
      query: ({
        projectName,
        ids,
        type,
        versionOverrides = ['00000000000000000000000000000000'],
        attribs,
      }) => ({
        url: '/graphql',
        method: 'POST',
        body: {
          query: buildEntitiesQuery(type, attribs),
          variables: { projectName, ids, versionOverrides },
        },
      }),
      transformResponse: (response, meta, { type }) =>
        transformToType(response.data.project[type + 's'].edges, type),
      transformErrorResponse: (error) => error.data?.detail || `Error ${error.status}`,
    }),
  }),
})

export const { useGetEntitiesGraphQuery } = getGraph
