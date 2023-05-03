import React, { useEffect } from 'react'
import 'reactflow/dist/style.css'
import ReactFlow, { Background, useEdgesState, useNodesState } from 'reactflow'
import { useSelector } from 'react-redux'
import { useGetEntitiesGraphQuery } from '/src/services/graph/getGraph'
import { ArrayParam, StringParam, useQueryParam, withDefault } from 'use-query-params'

// const initialNodes = [
//   { id: '1', position: { x: 300, y: 100 }, data: { label: '1' } },
//   { id: '2', position: { x: 100, y: 200 }, data: { label: '2' } },
//   { id: '3', position: { x: 300, y: 200 }, data: { label: '3' } },
// ]
// const initialEdges = [
//   { id: 'e1-2', source: '1', target: '2' },
//   { id: 'e1-3', source: '1', target: '3' },
// ]

const GraphPage = () => {
  const projectName = useSelector((state) => state.project.name)
  const { focused } = useSelector((state) => state.context) || {}
  // type query param state
  const [type] = useQueryParam('type', withDefault(StringParam, focused?.type))
  // id query param state
  const [ids] = useQueryParam(['id'], withDefault(ArrayParam, focused?.[focused?.type + 's']))

  const {
    data = {},
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

  // eslint-disable-next-line no-unused-vars
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  // eslint-disable-next-line no-unused-vars
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // set node based off focused context
  useEffect(() => {
    if (!isLoading && isSuccess) {
      const { nodes = [], edges = [] } = data
      setNodes(nodes)
      setEdges(edges)
    }
  }, [isLoading, isSuccess, data])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}

export default GraphPage
