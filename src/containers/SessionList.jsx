import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { TablePanel, Section, Button } from '@ynput/ayon-react-components'

import { TimestampField } from '/src/containers/fieldFormat'
import { useGetUserSessionsQuery } from '../services/user/getUsers'
import { useInvalidateUserSessionMutation } from '../services/user/updateUser'

const SessionList = ({ userName }) => {
  const {
    data: sessionList,
    isLoading,
    isUninitialized,
    refetch,
  } = useGetUserSessionsQuery({ name: userName }, { skip: !userName })

  const [invalidateToken] = useInvalidateUserSessionMutation()

  const invalidate = (token) => {
    invalidateToken({
      name: userName,
      token,
    })
      .unwrap()
      .then(() => {
        console.log('Session invalidated')
        if (token === localStorage.getItem('accessToken')) {
          localStorage.removeItem('accessToken')
          window.location.reload()
        } else {
          refetch()
        }
      })
      .catch((err) => console.log('Unable to invalidate the session', err))
  }

  return (
    <Section style={{ flexGrow: 2 }}>
      <TablePanel loading={isLoading || isUninitialized ? 'true' : undefined}>
        <DataTable
          value={sessionList}
          scrollable="true"
          scrollHeight="flex"
          responsive="true"
          selectionMode="single"
          rowClassName={(rowData) => {
            return {
              'p-highlight': rowData.token === localStorage.getItem('accessToken'),
            }
          }}
        >
          <Column field="clientInfo.ip" header="IP" />
          <Column field="clientInfo.agent.platform" header="Platform" style={{ maxWidth: 160 }} />
          <Column field="clientInfo.agent.client" header="Client" style={{ maxWidth: 160 }} />
          <Column field="clientInfo.agent.device" header="Device" style={{ maxWidth: 160 }} />
          <Column field="clientInfo.location.country" header="Country" style={{ maxWidth: 160 }} />
          <Column field="clientInfo.location.city" header="City" style={{ maxWidth: 160 }} />
          <Column
            field="lastUsed"
            header="Last active"
            body={(rowData) => rowData.lastUsed && <TimestampField value={rowData.lastUsed} />}
            style={{ maxWidth: 160 }}
          />
          <Column
            header="Invalidate"
            body={(rowData) => (
              <Button link label="Invalidate" onClick={() => invalidate(rowData.token)} />
            )}
            style={{ maxWidth: 160 }}
          />
        </DataTable>
      </TablePanel>
    </Section>
  )
}

export default SessionList
