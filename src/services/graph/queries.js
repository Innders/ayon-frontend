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

export const FOLDER_QUERY = `
    query Folders($projectName: String!, $ids: [String!]!) {
        project(name: $projectName) {
            folders(ids: $ids) {
                edges {
                    node {
                        id
                        name
                        folderType
                        subsets {
                          edges {
                            node {
                              name
                              id
                            }
                          }
                        }
                        tasks {
                          edges {
                            node {
                              name
                              id
                            }
                          }
                        }
                    }
                }
            }
        }
    }

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
query Subset($projectName: String!, $ids: [String!]!, $versionOverrides: [String!]!) {
    project(name: $projectName){
        subsets(ids: $ids){
            edges {
                node {
                    id
                    name
                    versionList{
                      id
                      version
                      name
                    }
                    versions(){
                      edges{
                        node{
                          id
                          version
                          name
                          taskId
                        }
                      }
                    }
                }
            }
        }
    }
}
`
