import React from 'react'
import { Dropdown } from '@ynput/ayon-react-components'
import StatusField from './statusField'
import { useSelector } from 'react-redux'
import { uniq } from 'lodash'
import styled from 'styled-components'

const StyledDropdown = styled(Dropdown)`
  button {
    background-color: unset;
  }
`

const StatusSelect = ({
  value,
  size = 'full',
  maxWidth,
  height,
  align,
  onChange,
  onOpen,
  multipleSelected,
  style,
  placeholder,
  disableMessage,
  disabled,
  widthExpand,
}) => {
  const statusesObject = useSelector((state) => state.project.statuses)
  const statusesOrder = useSelector((state) => state.project.statusesOrder)
  // ordered array of statuses objects
  const statuses = statusesOrder.map((status) => statusesObject[status])

  if (!value && !placeholder) return null

  const handleChange = (status) => {
    if (!status?.length) return
    onChange(status[0])
  }

  // calculate max width based off longest status name
  const charWidth = 7
  const gap = 5
  const iconWidth = 20
  const longestStatus = [...statuses].sort((a, b) => b.name.length - a.name.length)[0].name.length
  const calcMaxWidth = longestStatus * charWidth + gap + iconWidth + 16

  maxWidth = maxWidth || calcMaxWidth

  const dropdownValue = Array.isArray(value) ? uniq(value) : [value]
  const isMixed = dropdownValue.length > 1

  return (
    <StyledDropdown
      message={!disableMessage && multipleSelected > 1 && `${multipleSelected} Selected`}
      widthExpand={widthExpand}
      onOpen={onOpen}
      align={align}
      value={dropdownValue}
      onChange={handleChange}
      disabled={disabled}
      listInline
      valueTemplate={() => (
        <StatusField
          value={isMixed ? `Mixed Statuses` : dropdownValue[0]}
          align={align}
          size={size}
          style={{ maxWidth, ...style }}
          height={height}
          placeholder={placeholder}
          statuses={statusesObject}
        />
      )}
      dataKey={'name'}
      options={statuses}
      itemTemplate={(status, isActive) => (
        <StatusField
          value={status.name}
          isSelecting
          isActive={!isMixed && isActive}
          align={align}
          height={height}
          statuses={statusesObject}
        />
      )}
    />
  )
}

export default StatusSelect
