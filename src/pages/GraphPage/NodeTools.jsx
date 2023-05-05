import { Button } from '@ynput/ayon-react-components'
import React from 'react'
import styled from 'styled-components'

const StyledMenu = styled.div`
  position: absolute;

  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 10;
  top: -8px;
  translate: -50% -100%;
  left: 50%;

  button {
    flex: 1;
  }

  span {
    color: white;
  }
`

const NodeTools = ({ onMouseOut, onAction, isLeaf, isFocus }) => {
  const tools = [
    {
      label: 'Delete',
      onClick: () => onAction('delete'),
      icon: 'delete',
    },
    {
      label: 'Edit',
      onClick: () => onAction('edit'),
      icon: 'edit',
    },
  ]

  if (!isLeaf && !isFocus)
    tools.push({
      label: 'Focus',
      onClick: () => onAction('focus'),
      icon: 'center_focus_weak',
    })

  return (
    <StyledMenu onMouseOut={onMouseOut}>
      {tools.map(({ label, onClick, icon }) => (
        <Button key={label} label={label} onClick={onClick} icon={icon} className="nodrag" />
      ))}
    </StyledMenu>
  )
}

export default NodeTools
