import { capitalize } from 'lodash'

export const TASK_QUERY = `
  query Tasks($projectName: String!, $ids: [String!]!) {
      project(name: $projectName) {
          tasks(ids: $ids) {
              edges {
                  node {
                      id
                      name
                      label
                      taskType
                  }
              }
          }
      }
  }
`

const getSubType = (type) => {
  switch (type) {
    case 'task':
      return 'taskType'
    case 'subset':
      return 'family'
    case 'folder':
      return 'folderType'
    case 'version':
      return ''
    default:
      return ''
  }
}

const createTypeFragment = (type) => `
    fragment ${capitalize(type)}sFragment on ${capitalize(type)}sConnection {
        edges {
            node {
                id
                name
                ${getSubType(type) ? 'subType: ' + getSubType(type) : ''}
            }
        }
    }`

export const FOLDER_QUERY = `
    query Folders($projectName: String!, $ids: [String!]!) {
        project(name: $projectName) {
            folders(ids: $ids) {
                edges {
                    node {
                        id
                        name
                        hasChildren
                        subType: folderType
                        parent{
                            id
                            name
                        }
                        subsets {
                            ...SubsetsFragment
                        }
                        tasks {
                            ...TasksFragment
                        }
                    }
                }
            }
        }
    }
    ${createTypeFragment('task')}
    ${createTypeFragment('subset')}
`

export const VERSION_QUERY = `
    query Versions($projectName: String!, $ids: [String!]!) {
        project(name: $projectName) {
            versions(ids: $ids) {
                edges {
                    node {
                        id
                        version
                        name
                        tags
                        subset {
                            name
                            family
                            folder {
                                name
                                parents
                            }
                        }
                        representations{
                            edges {
                                node {
                                    id
                                    name
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`

export const SUBSET_QUERY = `
query Subset($projectName: String!, $ids: [String!]!) {
    project(name: $projectName){
        subsets(ids: $ids){
            edges {
                node {
                    id
                    name
                    folderId
                    versions {
                        ...VersionsFragment
                    }
                }
            }
        }
    }
}
${createTypeFragment('version')}
`
