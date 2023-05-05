import { Handle, Position } from 'reactflow'
import styled from 'styled-components'
import NodeTools from '/src/pages/GraphPage/NodeTools'
import { StyledNode as EntityStyledNode } from './EntityNode'
import { UserImage } from '@ynput/ayon-react-components'

const StyledNode = styled(EntityStyledNode)`
  border-radius: 23px;
  padding: 8px;
  padding-right: 12px;

  & > span {
    margin-top: 1px;
  }

  &::after {
    border-radius: 23px;
  }
`

const UserNode = ({ data, selected, dragging, onAction, id }) => {
  const { label = '', focused, isLeaf, attrib } = data || {}
  const { fullName, name, avatarUrl } = attrib || {}

  return (
    <>
      {selected && !dragging && (
        <NodeTools
          onAction={(a) => onAction(a, { id, ...data })}
          isLeaf={isLeaf}
          isFocus={focused}
        />
      )}
      <Handle type="target" position={Position.Left} />
      <StyledNode type={'user'} isFocus={focused}>
        <UserImage
          src={avatarUrl}
          fullName={fullName || name}
          style={{ border: 'none', width: 24 }}
        />
        <span>{label}</span>
      </StyledNode>
      {!isLeaf && <Handle type="source" position={Position.Right} />}
    </>
  )
}

export default UserNode
