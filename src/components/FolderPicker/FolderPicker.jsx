import React, { useState } from 'react'
import ProjectList from '/src/containers/projectList'
import { Button, Section } from '@ynput/ayon-react-components'
import Hierarchy from '/src/containers/hierarchy'
import { useSelector } from 'react-redux'
import { useGetEntityQuery } from '/src/services/entity/getEntity'

const FolderPicker = ({ projectName }) => {
  const [selectedProject, setSelectedProject] = useState(projectName)
  const focusedFolders = useSelector((state) => state.context.focused.folders)

  const { data } = useGetEntityQuery(
    { projectName: selectedProject, entityType: 'folder', entityId: focusedFolders[0] },
    {
      skip: !focusedFolders.length || !selectedProject,
    },
  )

  console.log(data)

  return (
    <Section style={{ flexDirection: 'row' }}>
      <Button></Button>
      <ProjectList
        selection={selectedProject}
        onSelect={setSelectedProject}
        hideCode
        styleSection={{ minWidth: 200, minHeight: 600 }}
      />
      <Hierarchy
        projectName={selectedProject}
        style={{ minHeight: 600, minWidth: 300 }}
        disableURI
      />
    </Section>
  )
}

export default FolderPicker
