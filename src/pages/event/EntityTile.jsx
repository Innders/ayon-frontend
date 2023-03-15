import React from 'react'
import PropTypes from 'prop-types'
import { Panel } from '@ynput/ayon-react-components'
import styled, { css } from 'styled-components'
import StatusField from '/src/components/status/StatusField'
import { useGetEventTileQuery } from '/src/services/entity/getEntity'
import { useGetProjectQuery } from '../../services/project/getProject'
import { formatDistance } from 'date-fns'
import { useSelector } from 'react-redux'

// styled panel
const PanelStyled = styled(Panel)`
  flex-direction: row;
  align-items: center;
  background-color: var(--color-grey-01);
  overflow: hidden;

  span {
    white-space: nowrap;
  }

  header {
    overflow: hidden;
    display: inline-block;

    & > * {
      white-space: nowrap;
      /* TODO: get text ellipsis working */
    }
  }

  /* if not disable hover */
  ${({ disableHover }) =>
    !disableHover &&
    css`
      &:hover {
        background-color: var(--color-grey-02);
        cursor: pointer;
      }
    `}
`

const EntityTile = ({ id, children, onClick, disableHover, projectName, type }) => {
  const skip = !id || !type || !projectName
  const statusesObject = useSelector((state) => state.project.statuses)

  // get project for status anatomy
  // it will only be used if the projectName has changed or if the project is not loaded
  useGetProjectQuery({ projectName }, { skip: !projectName })

  const { data = {}, isError } = useGetEventTileQuery({
    projectName,
    id,
    type,
  })

  if (skip || isError) return <span>Event Not Found</span>

  const { name = '', status = '', updatedAt } = data

  return (
    <PanelStyled onClick={onClick} disableHover={disableHover}>
      <StatusField
        value={status}
        size="icon"
        style={{ order: 0, width: 'unset' }}
        statuses={statusesObject}
      />
      <header style={{ flex: 1 }}>
        <strong>
          {type} - {name}
        </strong>
        <br />
        <span style={{ opacity: 0.5 }}>
          Last Updated{' '}
          {new Date(updatedAt).getDate() &&
            formatDistance(new Date(updatedAt), new Date(), { addSuffix: true })}
        </span>
      </header>
      {children}
    </PanelStyled>
  )
}

EntityTile.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node,
  onClick: PropTypes.func,
  disableHover: PropTypes.bool,
  projectName: PropTypes.string,
  type: PropTypes.string,
}

export default EntityTile
