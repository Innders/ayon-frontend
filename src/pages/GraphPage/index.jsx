import { ReactFlowProvider } from 'reactflow'
import GraphPageFlow from './GraphPageFlow'

const GraphPage = () => (
  <ReactFlowProvider>
    <GraphPageFlow />
  </ReactFlowProvider>
)

export default GraphPage
