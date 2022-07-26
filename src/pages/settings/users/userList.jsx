import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { TableWrapper } from '/src/components'
import axios from 'axios'

import './users.sass'

const USERS_QUERY = `
  query UserList {
    users {
      edges {
        node {
          name
          isAdmin
          isManager
          active
          roles
          defaultRoles
          hasPassword
          attrib {
            fullName
            email
          }
        }
      }
    }
  }
`

const buildRoleAssignData = (projectNames, roleNames, users) => {
  let roles = []
  let userLevel = "user"
  let allDisabled = true

  for (const roleName of roleNames){
    let shouldSelect = false

    for (const user of users){
      const roleSet = JSON.parse(user.roles) || {}
      if (user.active)
        allDisabled = false

      if (user.isManager && userLevel === "user")
        userLevel = "manager"
      if (user.isAdmin && ["user", "manager"].includes(userLevel))
        userLevel = "admin"

      for (const projectName of projectNames || []){
        if ((roleSet[projectName] || []).includes(roleName)){
          shouldSelect = true
          break
        }
      }
    }

    roles.push({
      name: roleName,
      shouldSelect
    })

  } // for each role name
  return {
    roles,
    userLevel,
    active: !allDisabled
  }
}



const formatRoles = (rowData, selectedProjects) => {
  let res = {}
  if (rowData.isAdmin) 
    res.admin = {cls: 'role admin'}
  else if (rowData.isManager)
    res.manager = {cls: 'role manager'}
  else if (!selectedProjects){
    for (const name of rowData.defaultRoles || [])
      res[name] = {cls: 'role default'}
  }
  else {
    const roleSet = JSON.parse(rowData.roles)
    for (const projectName of selectedProjects){
      for(const roleName of roleSet[projectName] || []){
        if (roleName in res)
          res[roleName].count += 1
        else
          res[roleName] = {count: 1}
        res[roleName].cls = res[roleName].count === selectedProjects.length ? "role all" : "role partial"
      }
    }
  }

  return (
    <>
      {
        Object.keys(res).map((roleName) => (
          <span key={roleName} className={res[roleName].cls}>{roleName}</span>
        ))
      }
    </>
  ) 
}

const UserList = ({ selectedProjects, selectedUsers, onSelectUsers, reloadTrigger, onRoleAssignData }) => {
  const [userList, setUserList] = useState([])
  const [rolesList, setRolesList] = useState([])
  const [loading, setLoading] = useState(false)

  // Load user list

  useEffect(() => {
    setLoading(true)
    let result = []
    axios
      .post('/graphql', {
        query: USERS_QUERY,
        variables: {},
      })
      .then((response) => {
        const edges = response?.data?.data?.users.edges
        if (!edges) return
        for (const edge of edges) result.push(edge.node)
      })
      .catch(() => {
        toast.error('Unable to load users')
      })
      .finally(() => {
        setUserList(result)
        setLoading(false)
      })
  }, [reloadTrigger])


  useEffect(() => {
    setLoading(true)
    let result = []
    axios
      .get("/api/roles/_")
      .then((response) => {
        for (const role of response.data)
          result.push(role.name)
      })
      .catch(() => {
        toast.error('Unable to load roles')
      })
      .finally(() => {
        setRolesList(result)
        setLoading(false)
      })
  }, [])



  // Selection

  const selection = useMemo(() => {
    let result = []
    for (const user of userList) {
      if (selectedUsers.includes(user.name)) 
        result.push(user)
    }
    if(onRoleAssignData){
      onRoleAssignData(
        buildRoleAssignData(selectedProjects, rolesList, result)
      )
    }
    return result
  }, [selectedUsers, userList, selectedProjects])

  const onSelectionChange = (e) => {
    if (!onSelectUsers) return
    let result = []
    for (const user of e.value) result.push(user.name)
    onSelectUsers(result)
  }

  // Render

  return (
    <TableWrapper>
      <DataTable
        value={userList}
        scrollable="true"
        scrollHeight="flex"
        dataKey="name"
        loading={loading}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
        selection={selection}
      > 
        <Column field="name" header="Name" />
        <Column field="attrib.fullName" header="Full name" />
        <Column
          header="Roles"
          body={(rowData) => formatRoles(rowData, selectedProjects)}
        />
        <Column
          header="Has password"
          body={(rowData) => (rowData.hasPassword ? 'yes' : '')}
        />
        <Column
          header="Active"
          body={(rowData) => (rowData.active ? 'yes' : '')}
        />
      </DataTable>
    </TableWrapper>
  )
}

export default UserList
