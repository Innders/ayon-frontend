import { useState } from 'react'
import RolesList from './rolesList'
import RoleDetail from './roleDetail'
import ProjectList from '/src/containers/projectList'
import { Dialog } from 'primereact/dialog'
import FolderPicker from '/src/components/FolderPicker/FolderPicker'

const Roles = () => {
  const [projectName, setProjectName] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [folderPickerOpen, setFolderPickerOpen] = useState(false)

  const triggerReload = () => setReloadTrigger(reloadTrigger + 1)

  return (
    <main>
      <ProjectList showNull="( default )" selection={projectName} onSelect={setProjectName} />

      <RolesList
        projectName={projectName}
        reloadTrigger={reloadTrigger}
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
      />

      <RoleDetail
        projectName={projectName}
        role={selectedRole}
        onChange={triggerReload}
        onPickFolder={() => setFolderPickerOpen(true)}
      />
      <Dialog visible={folderPickerOpen} onHide={() => setFolderPickerOpen(false)}>
        <FolderPicker {...{ projectName, setProjectName }} />
      </Dialog>
    </main>
  )
}

export default Roles
