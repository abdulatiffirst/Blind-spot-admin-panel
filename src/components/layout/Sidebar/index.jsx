import { useAuth } from '../../../hooks/useAuth'
import Button from '../../ui/Button'
import { Brand, LinkItem, Nav, Wrap } from './styles'

const Sidebar = () => {
  const { logout } = useAuth()
  return (
    <Wrap>
      <div>
        <Brand>IELTS Admin</Brand>
        <Nav>
          <LinkItem to="/dashboard">Dashboard</LinkItem>
          <LinkItem to="/reading">Reading</LinkItem>
          <LinkItem to="/listening">Listening</LinkItem>
          <LinkItem to="/vocabulary">Vocabulary</LinkItem>
          <LinkItem to="/students">Students</LinkItem>
        </Nav>
      </div>
      <Button variant="ghost" onClick={logout}>Logout</Button>
    </Wrap>
  )
}

export default Sidebar
