import React, { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setMenuOpen } from '/src/features/context'
import * as Styled from './Menu.styled'
import { useNavigate } from 'react-router'

const MenuContainer = ({ id, target, children, align = 'right', ...props }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isOpen = useSelector((state) => state.context.menuOpen) === id
  const dialogRef = useRef(null)

  const handleClose = () => {
    // close menu
    dispatch(setMenuOpen(false))
  }
  // when the menu is open, focus the first element
  // this is used to allow keyboard navigation
  useEffect(() => {
    if (isOpen) {
      const first = dialogRef.current.querySelectorAll('li, button')[0]
      first && first.focus()
    }
  }, [isOpen, dialogRef])

  // if target is a element, find it's position bottom and right
  // then set the style of the dialog to position it there

  const pos = useMemo(() => {
    let pos = { top: 4 }
    if (target) {
      const rect = target.getBoundingClientRect()
      if (align === 'left') {
        pos = {
          ...pos,
          left: rect.left,
        }
      } else {
        pos = {
          ...pos,
          right: window.innerWidth - rect.right,
        }
      }
    }
    return pos
  }, [target, align])

  if (!isOpen) return null

  const handleNavigate = (path) => {
    handleClose()
    if (path) navigate(path)
  }

  // attach the handleClose as a prop to each child
  children = React.Children.map(children, (child, i) => {
    return React.cloneElement(child, { onClose: handleClose, index: i, navigate: handleNavigate })
  })

  const handleKeyDown = (e) => {
    // close on esc
    if (e.key === 'Escape') handleClose()
  }

  const handleOnClick = (e) => {
    if (e.target.id === 'dialog') handleClose()
  }

  return (
    <Styled.Dialog
      open={true}
      onClick={handleOnClick}
      onKeyDown={handleKeyDown}
      {...props}
      ref={dialogRef}
      id="dialog"
    >
      <Styled.DialogContent id="content" style={{ ...pos }} $align={align}>
        {children}
      </Styled.DialogContent>
    </Styled.Dialog>
  )
}

export default MenuContainer
