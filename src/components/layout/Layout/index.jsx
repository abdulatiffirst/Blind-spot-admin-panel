import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { Main, Wrap } from './styles'

const Layout = () => {
  return (
    <Wrap>
      <Sidebar />
      <Main>
        <Outlet />
      </Main>
    </Wrap>
  )
}

export default Layout
