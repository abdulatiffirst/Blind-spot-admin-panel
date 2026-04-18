import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from './config'

export const loginWithEmail = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const logout = async () => {
  return signOut(auth)
}
