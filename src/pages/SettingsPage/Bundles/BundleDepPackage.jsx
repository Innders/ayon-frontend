import { Button, FormRow } from '@ynput/ayon-react-components'
import React from 'react'
import styled from 'styled-components'

const StyledFormRow = styled(FormRow)`
  .field {
    flex-direction: row;
    display: flex;
    align-items: center;
    gap: 8px;

    & > span {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin-right: 16px;
    }
  }
`

const BundleDepPackage = ({ children, label, onEdit }) => {
  return (
    <StyledFormRow label={label}>
      <span>
        {children || '(NONE)'}
        {/* <span> (author)</span> */}
      </span>
      <Button icon={children ? 'edit' : 'add'} onClick={onEdit} />
    </StyledFormRow>
  )
}

export default BundleDepPackage
