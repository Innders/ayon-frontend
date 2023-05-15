import { Splitter, SplitterPanel } from 'primereact/splitter'
import { Button, Dialog, Section } from '@ynput/ayon-react-components'

import Hierarchy from '/src/containers/hierarchy'
import TaskList from '/src/containers/taskList'

import Subsets from './Subsets'
import Detail from './detail/Detail'
import { useState } from 'react'
import GraphPage from '../GraphPage'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const DialogStyled = styled(Dialog)`
  width: 90vw;
  height: 90vh;
  padding: 0;
  border-radius: 20px;
  overflow: hidden;

  /* remove hide button */
  & > button {
    display: none;
  }
`

const PremiumButtonStyled = styled(Button)`
  background-image: linear-gradient(to right, #4cb8c4 0%, #3cd3ad 51%, #4cb8c4 100%);
  /* padding: 10px 20px; */
  text-align: center;
  text-transform: uppercase;
  transition: 0.5s;
  background-size: 200% auto;
  color: white;
  border-radius: 10px;

  &:hover {
    background-position: right center; /* change the direction of the change here */
    color: #fff;
    text-decoration: none;
    background-image: linear-gradient(to right, #4cb8c4 0%, #3cd3ad 51%, #4cb8c4 100%);
  }
`

const BrowserPage = () => {
  const [graphOpen, setGraphOpen] = useState(false)

  const toggleGraph = () => setGraphOpen(!graphOpen)

  const { name: projectName } = useSelector((state) => state.project)

  const { focused } = useSelector((state) => state.context) || {}

  return (
    <>
      <main>
        <Splitter
          layout="horizontal"
          style={{ width: '100%', height: '100%' }}
          stateKey="browser-splitter-1"
        >
          <SplitterPanel size={18} style={{ minWidth: 250, maxWidth: 600 }}>
            <Section className="wrap">
              <Hierarchy onViewGraph={toggleGraph} />
              <TaskList style={{ maxHeight: 300 }} />
            </Section>
          </SplitterPanel>
          <SplitterPanel size={82}>
            <Splitter layout="horizontal" style={{ height: '100%' }} stateKey="browser-splitter-2">
              <SplitterPanel style={{ minWidth: 500 }}>
                <Subsets />
              </SplitterPanel>
              <SplitterPanel style={{ minWidth: 250, maxWidth: 480 }}>
                <Detail />
              </SplitterPanel>
            </Splitter>
          </SplitterPanel>
        </Splitter>
      </main>
      <DialogStyled
        visible={graphOpen}
        onHide={toggleGraph}
        header={
          <>
            <PremiumButtonStyled label="Graph Premium" icon="magic_button" />

            <Button icon="close" onClick={toggleGraph} />
            <Link
              to={`${window.location.origin}/projects/${projectName}/graph?type=${
                focused?.type
              }&id=${focused?.[focused?.type + 's']?.join('&id=')}`}
            >
              <Button icon="open_in_full" />
            </Link>
          </>
        }
        headerStyle={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          padding: 8,
          gap: 8,
          zIndex: 10,
          justifyContent: 'flex-end',
        }}
      >
        <GraphPage />
      </DialogStyled>
    </>
  )
}

export default BrowserPage
