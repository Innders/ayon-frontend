import { capitalize } from 'lodash'

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
                        folder: parent{
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

export const TASK_QUERY = `
  query Tasks($projectName: String!, $ids: [String!]!) {
      project(name: $projectName) {
          tasks(ids: $ids) {
              edges {
                  node {
                      id
                      name
                      subType: taskType
                      folder {
                        id
                        name
                        subType: folderType
                      }
                        versions {
                            ...VersionsFragment
                        }
                        workfiles {
                            ...WorkfilesFragment
                        }
                        assignees
                  }
              }
          }
      }
  }
    ${createTypeFragment('version')}
    ${createTypeFragment('workfile')}
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
                    subType: family
                    folder {
                        id
                        name
                        subType: folderType
                    }
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

export const VERSION_QUERY = `
    query Versions($projectName: String!, $ids: [String!]!) {
        project(name: $projectName) {
            versions(ids: $ids) {
                edges {
                    node {
                    id
                    name
                        subset {
                            id
                            name
                            subType: family
                        }
                        task {
                            id
                            name
                            subType: taskType
                        }
                        representations{
                            ...RepresentationsFragment
                        }
                    }
                }
            }
        }
    }
    ${createTypeFragment('representation')}
`

export const USERS_QUERY = `
    query Users($names: [String!]) {
        users(names: $names) {
            edges {
                node {
                    name
                    attrib {
                        fullName
                        avatarUrl
                    }
                }
            }
        }
    }
`
