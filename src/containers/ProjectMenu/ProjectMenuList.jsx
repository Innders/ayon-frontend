import { InputText } from '@ynput/ayon-react-components'
import React, { useMemo, useState } from 'react'
import * as Styled from './projectMenu.styled'
import MenuList from '/src/components/Menu/MenuComponents/MenuList'

const ProjectMenuList = ({ projectItems, pinned, searchRef }) => {
  const [projectsFilter, setProjectsFilter] = useState('')

  const filteredProjectItems = useMemo(() => {
    return projectItems.filter((item) => {
      const [name, code] = item.label
      return (
        name.toLowerCase().includes(projectsFilter.toLowerCase()) ||
        code.toLowerCase().includes(projectsFilter.toLowerCase())
      )
    })
  }, [projectItems, projectsFilter])

  const pinnedProjectItems = useMemo(() => {
    return filteredProjectItems
      .filter((item) => pinned.includes(item.id))
      .map((item) => ({ ...item, selected: false, highlighted: true }))
  }, [filteredProjectItems, pinned])

  const showingPinned = !!pinnedProjectItems.length && !projectsFilter

  return (
    <Styled.ProjectMenu>
      <InputText
        placeholder="Search projects..."
        value={projectsFilter}
        onChange={(e) => setProjectsFilter(e.target.value)}
        ref={searchRef}
      />

      {showingPinned && (
        <div>
          <h3>Pinned</h3>
          <MenuList items={pinnedProjectItems} handleClick={(e, onClick) => onClick()} level={0} />
        </div>
      )}
      <Styled.All>
        {showingPinned && <h3>All</h3>}
        <MenuList items={filteredProjectItems} handleClick={(e, onClick) => onClick()} level={0} />
      </Styled.All>
    </Styled.ProjectMenu>
  )
}

export default ProjectMenuList
