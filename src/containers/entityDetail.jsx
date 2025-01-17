import { toast } from 'react-toastify'
import { useGetEntitiesDetailsQuery } from '../services/entity/getEntity'
import PropTypes from 'prop-types'
import { Dialog } from 'primereact/dialog'

const EntityDetail = ({ projectName, entityType, entityIds, visible, onHide }) => {
  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useGetEntitiesDetailsQuery(
    { projectName, type: entityType, ids: entityIds },
    { skip: !visible },
  )

  if (isLoading)
    if (isError) {
      toast.error(`Unable to load detail. ${error}`)
    }

  if (!visible || data.length < 1) return null

  return (
    <Dialog visible={true} onHide={onHide} style={{ width: '50vw' }}>
      <pre>
        {!isLoading &&
          !isError &&
          JSON.stringify(
            data.map(({ node }) => node),
            null,
            2,
          )}
        {isLoading && 'loading...'}
        {isError && 'error...'}
      </pre>
    </Dialog>
  )
}

EntityDetail.propTypes = {
  projectName: PropTypes.string,
  entityType: PropTypes.string.isRequired,
  entityIds: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
}

export default EntityDetail
