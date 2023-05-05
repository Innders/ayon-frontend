import { ayonApi } from '../ayon'
import { FOLDER_QUERY, SUBSET_QUERY, TASK_QUERY, VERSION_QUERY } from './queries'

const buildEntitiesQuery = (type) => {
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

  return QUERY
}

const getGraph = ayonApi.injectEndpoints({
  endpoints: (build) => ({
    getEntitiesGraph: build.query({
      query: ({ projectName, ids, type }) => ({
        url: '/graphql',
        method: 'POST',
        body: {
          query: buildEntitiesQuery(type),
          variables: { projectName, ids },
        },
      }),
      transformResponse: (response, meta, { type }) =>
        response.data ? response.data.project[type + 's'].edges : [],
      transformErrorResponse: (error) => error.data?.detail || `Error ${error.status}`,
    }),
  }),
})

export const { useGetEntitiesGraphQuery, useLazyGetEntitiesGraphQuery } = getGraph
