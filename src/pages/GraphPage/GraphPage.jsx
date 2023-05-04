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

const GraphPage = () => {
  const { name: projectName, folders, tasks, families } = useSelector((state) => state.project)

  const { focused } = useSelector((state) => state.context) || {}
  // add custom node types to graph
  const nodeTypes = useMemo(() => ({ entityNode: EntityNode }), [])
  // type query param state
  const [type = ''] = useQueryParam('type', withDefault(StringParam, focused?.type))
  // id query param state
  const [ids = []] = useQueryParam(['id'], withDefault(ArrayParam, focused?.[focused?.type + 's']))

  const shareLink = `${
    window.location.origin
  }/projects/${projectName}/graph?type=${type}&id=${ids.join('&id=')}`

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

  // transform data into nodes and edges
  const graphData = useMemo(() => {
    switch (type) {
      case 'folder':
        return transformFolder(data, folders, families, tasks)
      default:
        break
    }
  }, [data])

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
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
      >
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}

export default GraphPage
