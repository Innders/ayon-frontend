import { format } from 'date-fns'
import styled from 'styled-components'
import { TableRow } from '@ynput/ayon-react-components'
import { useGetAttributesQuery } from '/src/services/attributes/getAttributes'
import copyToClipboard from '../helpers/copyToClipboard'
import getShimmerStyles from '../styles/getShimmerStyles'

const AttributeTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 3px;

  flex: 1;
`

const StyledLoading = styled.div`
  width: 100%;
  height: 40px;
  margin: 4px 0;
  position: relative;

  border-radius: var(--border-radius-m);
  overflow: hidden;

  ${getShimmerStyles()}
`

const AttributeTable = ({
  entityType,
  data,
  additionalData,
  style,
  projectAttrib,
  extraFields = [],
  isLoading: isLoadingData,
}) => {
  // get attrib fields
  let { data: attribsData = [], isLoadingAttribs } = useGetAttributesQuery()
  //   filter out scopes
  const attribFields = attribsData.filter(
    (a) => a.scope.some((s) => s === entityType) && a.name in data,
  )

  const isLoading = isLoadingData || isLoadingAttribs

  if (isLoading)
    // add 18 dummy rows
    return (
      <AttributeTableContainer style={style}>
        {[...Array(10)].map((_, index) => (
          <StyledLoading key={index} />
        ))}
      </AttributeTableContainer>
    )

  return (
    <AttributeTableContainer style={style}>
      {additionalData &&
        additionalData.map((data, index) => (
          <TableRow key={index} name={data.title} value={data.value} onCopy={copyToClipboard} />
        ))}

      {data &&
        [...extraFields, ...attribFields].map(({ name, data: attribData = {} }) => {
          let value = data[name]

          if (value && name.includes('Date') && !value.includes('Multiple')) {
            value = format(new Date(value), 'dd/MM/yyyy')
          }

          // if value is an array
          if (Array.isArray(value)) {
            value = value.join(', ')
          }

          // if value is an object
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value)
          }

          if (!attribData) return null

          return (
            <TableRow
              key={name}
              value={value}
              name={attribData.title}
              tooltip={attribData.description}
              onCopy={copyToClipboard}
            />
          )
        })}

      {projectAttrib &&
        projectAttrib.map(({ name, value }) => (
          <TableRow
            key={name}
            name={name}
            value={value === 0 ? '0' : value}
            onCopy={copyToClipboard}
          />
        ))}
    </AttributeTableContainer>
  )
}

export default AttributeTable
