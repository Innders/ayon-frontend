import React, { useEffect, useMemo } from 'react'
import 'reactflow/dist/style.css'
import ReactFlow, { Background, useEdgesState, useNodesState } from 'reactflow'
import { useSelector } from 'react-redux'
import {
  useGetEntitiesGraphQuery,
  useLazyGetEntitiesGraphQuery,
  useLazyGetUsersGraphQuery,
} from '/src/services/graph/getGraph'
import { ArrayParam, StringParam, useQueryParam, withDefault } from 'use-query-params'
import { Button } from '@ynput/ayon-react-components'
import copyToClipboard from '/src/helpers/copyToClipboard'
import EntityNode from '/src/components/Graph/EntityNode'
import { transformEntity } from './transform'
import { useGetHierarchyQuery } from '/src/services/getHierarchy'
import { ThemeProvider } from 'styled-components'
import theme from './theme'
import UserNode from '/src/components/Graph/UserNode'

const GraphPage = () => {
  const { name: projectName, folders, tasks, families } = useSelector((state) => state.project)

  const { focused } = useSelector((state) => state.context) || {}
  // type query param state
  const [type = '', setType] = useQueryParam('type', withDefault(StringParam, focused?.type))
  // id query param state
  const [ids = [], setIds] = useQueryParam(
    ['id'],
    withDefault(ArrayParam, focused?.[focused?.type + 's']),
  )

  const shareLink = `${
    window.location.origin
  }/projects/${projectName}/graph?type=${type}&id=${ids.join('&id=')}`

  const { data: hierarchyData = [], isFetching: isHierarchyFetching } = useGetHierarchyQuery(
    { projectName },
    { skip: !projectName || type !== 'folder' },
  )

  // QUERIES
  const {
    data = [],
    isFetching,
    isSuccess,
  } = useGetEntitiesGraphQuery(
    {
      projectName,
      type: type,
      ids: ids,
    },
    {
      skip: !projectName || !type || !ids.length,
    },
  )

  // const { data: usersData = [] } = useGetUsersGraphQuery({ users: ids }, { skip: type !== 'user' })

  const createDataObject = (data = []) => {
    let hierarchyObject = {}

    data.forEach((item) => {
      hierarchyObject[item.id] = { ...item, isLeaf: !item.children?.length }

      if (item.children?.length > 0) {
        hierarchyObject = { ...hierarchyObject, ...createDataObject(item.children) }
      }
    })

    return hierarchyObject
  }

  const hierarchyObjectData = useMemo(() => {
    if (hierarchyData && type === 'folder') {
      return createDataObject(hierarchyData)
    }
  }, [hierarchyData])

  // eslint-disable-next-line no-unused-vars
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  // eslint-disable-next-line no-unused-vars
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [getGraphUser] = useLazyGetUsersGraphQuery()

  const getUsersData = async (names = []) => {
    // get users data, then update the graph
    try {
      if (!names.length) return
      const res = await getGraphUser({ names }, true).unwrap()
      return res
    } catch (error) {
      console.error(error)
    }
  }

  const [getGraphEntity] = useLazyGetEntitiesGraphQuery()
  // we get the inputs and outputs in the background before we click on a node
  const getEntityCache = async (type, id) => {
    try {
      if (!id || !type) return
      const res = await getGraphEntity({ projectName, type, ids: [id] }, true).unwrap()
      if (type === 'task') {
        // pre-fetch users
        const names = res.map(({ node: { assignees } }) => assignees).flat()
        getUsersData(names)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const updateGraphWithData = async () => {
    if (!isFetching && isSuccess) {
      let users = []
      // if type is task, get users
      if (type === 'task' && isSuccess) {
        // get assignees names from data
        const names = data.map(({ node: { assignees } }) => assignees).flat()
        users = await getUsersData(names)
      }

      // only transform data once we have all the data
      if (type !== 'folder' || !isHierarchyFetching) {
        // transform data to graph data
        const graphData = transformEntity(
          data,
          { folders, tasks, subsets: families, versions: { def: { icon: 'layers' } } },
          type,
          hierarchyObjectData,
          users,
        )
        const { nodes = [], edges = [] } = graphData || {}

        // Finally update graph
        setNodes(nodes)
        setEdges(edges)

        // get other nodes data in the background
        nodes.forEach(
          ({ data: { type, isLeaf }, id }) =>
            !isLeaf && type !== 'user' && getEntityCache(type, id),
        )
      }
    }
  }

  // set node based off focused context
  useEffect(() => {
    updateGraphWithData()
  }, [isFetching, isSuccess, data, isHierarchyFetching, hierarchyObjectData])

  const handleFocus = (node) => {
    if (!node) return
    // sets the focused context
    // updates the query params
    setType(node.type)
    setIds([node.id])
  }

  const handleAction = (a, node) => {
    switch (a) {
      case 'focus':
        handleFocus(node)
        break

      default:
        break
    }
  }

  // add custom node types to graph
  const nodeTypes = useMemo(
    () => ({
      entityNode: (data) => EntityNode({ ...data, onAction: handleAction }),
      userNode: (data) => UserNode({ ...data, onAction: handleAction }),
    }),
    [],
  )

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <Button
        label="Share Graph"
        icon="share"
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
        onClick={() => copyToClipboard(shareLink)}
      />
      <ThemeProvider theme={theme}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
        >
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </ThemeProvider>
    </div>
  )
}

export default GraphPage
