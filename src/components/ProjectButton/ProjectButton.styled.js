import styled from 'styled-components'

export const Project = styled.div`
  display: flex;
  align-items: center;
  padding-left: 8px;
  padding-right: 2px;
  border-radius: var(--border-radius);
  cursor: pointer;
  user-select: none;
  & > span {
    flex: 1;
    padding: 6px 0;
  }

  &.pinned {
    .pin {
      .icon {
        /* fill in */
        font-variation-settings: 'FILL' 1, 'wght' 200, 'GRAD' 200, 'opsz' 20;
      }
    }
  }

  /* button default hidden */
  button {
    display: none;
    padding: 4px;
  }

  &:hover,
  &:focus-within {
    background-color: var(--md-sys-color-surface-container-highest);
    button {
      display: flex;
    }
  }

  &:active:not(:has(button:active)) {
    background-color: var(--md-sys-color-surface-container-high-active);

    button {
      background-color: var(--md-sys-color-surface-container-high-active);
    }
  }
`
