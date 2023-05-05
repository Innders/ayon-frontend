import React, { useEffect, useMemo } from 'react'
import 'reactflow/dist/style.css'
import ReactFlow, { Background, useEdgesState, useNodesState } from 'reactflow'
import { useSelector } from 'react-redux'
import { useGetEntitiesGraphQuery } from '/src/services/graph/getGraph'
import { ArrayParam, StringParam, useQueryParam, withDefault } from 'use-query-params'
import { Button } from '@ynput/ayon-react-components'
import copyToClipboard from '/src/helpers/copyToClipboard'
import EntityNode from '/src/components/Graph/EntityNode'
import { transformFolder } from './transform'
import { useGetHierarchyQuery } from '/src/services/getHierarchy'
import { ThemeProvider } from 'styled-components'
import theme from './theme'

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
    isLoading,
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

  // transform data into nodes and edges
  const graphData = useMemo(
    () =>
      !isLoading && (type !== 'folder' || !isHierarchyFetching)
        ? transformFolder(data, { folders, tasks, subsets: families }, type, hierarchyObjectData)
        : [],
    [data, isHierarchyFetching, isLoading, hierarchyObjectData],
  )

  // eslint-disable-next-line no-unused-vars
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  // eslint-disable-next-line no-unused-vars
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // set node based off focused context
  useEffect(() => {
    if (!isLoading && isSuccess) {
      const { nodes = [], edges = [] } = graphData || {}
      setNodes(nodes)
      setEdges(edges)
    }
  }, [isLoading, isSuccess, graphData])

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
