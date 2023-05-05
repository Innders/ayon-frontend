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

  /* if isFocused, white border */
  ${({ isFocus, theme, type }) => {
    if (isFocus) {
      // 'hsla(335, 86%, 80%, 1)'
      const color = theme?.[type]?.primary
      // set s 100% and l 50%
      const borderColor = color.replace(/(\d+),\s*(\d+)%\s*,\s*(\d+)%/, '$1, 100%, 50%')

      return css`
        border: 2px solid ${borderColor};
        padding: 6px;
        padding-right: 22px;
      `
    }
  }}

  background-color: ${({ theme, type }) => theme?.[type]?.primary};
`

const StyledDefaultIcon = styled(Icon)`
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 120%;
`

const EntityNode = ({ data, selected, dragging, onAction, id }) => {
  const {
    label = '',
    icon = 'help_center',
    iconDefault = 'help_center',
    type,
    focused,
    isLeaf,
  } = data || {}

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
      <StyledNode type={type} isFocus={focused}>
        <StyledDefaultIcon icon={iconDefault} />
        <Icon icon={icon} />

        <span>{label}</span>
      </StyledNode>
      <Handle type="source" position={Position.Right} />
    </>
  )
}

export default EntityNode
