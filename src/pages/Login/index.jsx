import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { Card, Error, Wrap } from './styles'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, isAdmin, login, error } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/reading', { replace: true })
    }
  }, [isAdmin, navigate, user])

  const submit = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (!email || !password) {
      setLocalError('Email and password are required.')
      return
    }
    try {
      setLoading(true)
      await login(email, password)
      navigate('/reading')
    } catch (err) {
      setLocalError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Wrap>
      <Card as="form" onSubmit={submit}>
        <h2 style={{ margin: 0 }}>IELTS Admin</h2>
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        {(localError || error) ? <Error>{localError || error}</Error> : null}
        <Button disabled={loading} style={{ width: '100%' }} type="submit">
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Card>
    </Wrap>
  )
}

export default Login
