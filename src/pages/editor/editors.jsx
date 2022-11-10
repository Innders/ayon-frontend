import { InputText } from 'openpype-components'

import { InputNumber } from 'primereact/inputnumber'
import { Dropdown } from 'primereact/dropdown'

import { getFolderTypes, getTaskTypes } from '/src/utils'
import pypeClient from '/src/pype'

const FOLDER_TYPE = { name: '_', icon: 'folder', label: 'Folder' }

const typeEditor = (options, callback, value) => {
  const rowData = options.node.data
  if (!rowData) return <></>

  const types =
    rowData.__entityType === 'folder'
      ? [FOLDER_TYPE, ...getFolderTypes()]
      : getTaskTypes()

  const onChange = (event) =>
    callback(options, event.value === '_' ? null : event.value)

  const itemTemplate = (option, props) => {
    if (option) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <span
            className={`material-symbols-outlined`}
            style={{ marginRight: '0.6rem' }}
          >
            {option.icon}
          </span>
          <span>{option.label}</span>
        </div>
      )
    }

    return <span>{props.placeholder}</span>
  }

  // showClear={ rowData.__entityType === "folder" }
  return (
    <Dropdown
      options={types}
      optionLabel="label"
      optionValue="name"
      dataKey="name"
      value={value || '_'}
      emptyMessage="Folder"
      itemTemplate={itemTemplate}
      onChange={onChange}
      style={{ width: '100%' }}
    />
  )
}

const stringEditor = (options, callback, value) => {
  return (
    <InputText
      value={value}
      style={{ width: '100%' }}
      onChange={(e) => {
        callback(options, e.target.value)
      }}
    />
  )
}

const integerEditor = (options, callback, value) => {
  //  onChange={(e) => options.editorCallback(e.value)}
  const attrSettings = pypeClient.getAttribSettings(options.field)
  console.log(attrSettings)
  return (
    <div className="table-editor">
      <InputNumber
        style={{ width: '100%' }}
        showButtons={false}
        useGrouping={false}
        allowEmpty={true}
        value={value}
        onChange={(e) => {
          callback(options, e.value)
        }}
        className="p-inputtext-sm"
      />
    </div>
  )
}

const floatEditor = (options, callback, value) => {
  //  onChange={(e) => options.editorCallback(e.value)}
  const attrSettings = pypeClient.getAttribSettings(options.field)
  console.log(attrSettings)
  return (
    <div
      className="table-editor"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <InputNumber
        showButtons={false}
        value={value}
        minFractionDigits={0}
        maxFractionDigits={3}
        onChange={(e) => {
          callback(options, e.value)
        }}
        className="p-inputtext-sm"
      />
    </div>
  )
}

export { typeEditor, stringEditor, integerEditor, floatEditor }
