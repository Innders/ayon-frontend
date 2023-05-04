import { Icon } from '@ynput/ayon-react-components'
import { Handle, Position } from 'reactflow'
import styled, { css } from 'styled-components'
import NodeTools from '/src/pages/GraphPage/NodeTools'

const StyledNode = styled.div`
  background-color: #fff;
  padding: 8px 8px;
  padding-right: 24px;
  border-radius: var(--border-radius);
  display: flex;
  gap: 4px;
  align-items: center;

  span {
    color: black;
  }

  &::after {
    background-color: white;
    opacity: 0;
    transition: opacity 0.1s;
    position: absolute;
    inset: 0;
    content: '';
  }

  /* when hovering lighten using ::after */
  &:hover {
    &::after {
      opacity: 0.2;
    }
  }

  /* set styles for type */
  ${({ type }) => {
    switch (type) {
      case 'folder':
        return css`
          background-color: hsla(209, 100%, 80%, 1);
        `
      case 'subset':
        return css`
          background-color: hsla(32, 100%, 80%, 1);
        `
      case 'task':
        return css`
          background-color: hsla(122, 72%, 85%, 1);
        `
      case 'version':
        return css`
          background-color: hsla(335, 86%, 80%, 1);
        `
      default:
        return ''
    }
  }}
`

const StyledDefaultIcon = styled(Icon)`
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 120%;
`

const EntityNode = ({ data, selected, dragging }) => {
  const { label = '', icon = 'help_center', iconDefault = 'help_center', type } = data || {}

  if (selected) console.log('selected')

  return (
    <>
      {selected && !dragging && <NodeTools />}
      <Handle type="target" position={Position.Left} />
      <StyledNode type={type}>
        <StyledDefaultIcon icon={iconDefault} />
        <Icon icon={icon} />

        <span>{label}</span>
      </StyledNode>
      <Handle type="source" position={Position.Right} />
    </>
  )
}

export default EntityNode
