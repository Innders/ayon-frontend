import { useState, useEffect, useMemo } from 'react'
// import { toast } from 'react-toastify'
import { Section, Toolbar, Spacer, Button } from '@ynput/ayon-react-components'
import * as Styled from './Bundles.styled'
import BundleForm from './BundleForm'
import BundleDeps from './BundleDeps'
import { upperFirst } from 'lodash'
import BundleCompare from './BundleCompare'

const BundleDetail = ({ bundles = [], onDuplicate, installers, toggleBundleStatus, addons }) => {
  const [selectedBundle, setSelectedBundle] = useState(null)

  const [formData, setFormData] = useState({})
  const [selectedAddons, setSelectedAddons] = useState([])

  // data for first selected bundle
  const bundle = useMemo(() => {
    return bundles.find((b) => b.name === selectedBundle)
  }, [bundles, selectedBundle])

  const bundleStates = [
    {
      name: 'staging',
      active: bundles.length > 1 ? false : bundle?.isStaging,
    },
    {
      name: 'production',
      active: bundles.length > 1 ? false : bundle?.isProduction,
    },
  ]

  // every time we select a new bundle, update the form data
  useEffect(() => {
    if (bundles.length) {
      const selectedBundleData = bundles.find((b) => b.name === selectedBundle)

      if (!selectedBundleData) {
        setSelectedBundle(bundles[0].name)
        setFormData(bundles[0])
      }
    }
  }, [bundles, selectedBundle])

  return (
    <Section>
      <Toolbar>
        <Spacer />
        <>
          {bundleStates.map(({ name, active }) => (
            <Styled.BadgeButton
              key={name}
              $hl={active ? name : null}
              icon={active && 'cancel'}
              onClick={() => toggleBundleStatus(name, bundle.name)}
              disabled={bundles.length > 1}
            >
              {!active ? 'Set' : 'Unset'} {upperFirst(name)}
            </Styled.BadgeButton>
          ))}
        </>
        <Button
          label="Duplicate and Edit"
          icon="edit_document"
          onClick={() => onDuplicate(bundle.name)}
          disabled={bundles.length > 1}
        />
      </Toolbar>
      {bundles.length > 1 ? (
        <BundleCompare bundles={bundles} addons={addons} />
      ) : (
        <BundleForm
          isNew={false}
          {...{ selectedAddons, setSelectedAddons, formData, setFormData, installers }}
        >
          <BundleDeps bundle={bundle} />
        </BundleForm>
      )}
    </Section>
  )
}

export default BundleDetail