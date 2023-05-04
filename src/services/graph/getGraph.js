import { ayonApi } from '../ayon'
import { FOLDER_QUERY, SUBSET_QUERY, TASK_QUERY, VERSION_QUERY } from './queries'
import { transformFolder } from './transform'
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
        response.data ? transformToType(response.data.project[type + 's'].edges, type) : [],
      transformErrorResponse: (error) => error.data?.detail || `Error ${error.status}`,
    }),
  }),
})

export const { useGetEntitiesGraphQuery } = getGraph
