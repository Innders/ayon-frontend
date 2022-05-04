import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Menu } from 'primereact/menu'
import { toast } from 'react-toastify'
import axios from 'axios'

import { logout } from '../../features/user'

const UserMenu = ({ menuRef }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const doLogout = () => {
    axios
      .post('/api/auth/logout')
      .then((response) => {
        toast.info(response.data.detail)
        dispatch(logout())
      })
      .catch(() => {
        toast.error('Unable to log out. Weird.')
      })
  }

  const menuModel = useMemo(() => {
    return [
      {
        label: 'Developer',
        items: [
          {
            label: 'GraphQL explorer',
            icon: 'pi pi-sitemap',
            command: () => {
              navigate('/explorer')
            },
          },
          {
            label: 'REST API docs',
            icon: 'pi pi-book',
            url: '/doc/api',
          },
        ],
      },
      {
        label: 'Admin',
        items: [
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: () => navigate('/settings'),
          },
        ],
      },
      {
        label: 'Account',
        items: [
          {
            label: 'Options',
            icon: 'pi pi-fw pi-cog',
            command: () => {
              window.location.href = '/profile'
            },
          },
          {
            label: 'Sign Out',
            icon: 'pi pi-fw pi-power-off',
            command: doLogout,
          },
        ],
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Menu model={menuModel} popup ref={menuRef} />
}

export default UserMenu