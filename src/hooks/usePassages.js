import { useCallback, useEffect, useState } from 'react'
import {
  addPassage as addPassageReq,
  deletePassage as deletePassageReq,
  getPassages,
  updatePassage as updatePassageReq,
} from '../firebase/firestore'

export const usePassages = (type) => {
  const [passages, setPassages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPassages(type)
      setPassages(data)
    } catch (err) {
      setError(err.message || 'Failed to load passages.')
      setPassages([])
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    void load()
  }, [load])

  const addPassage = async (data) => {
    await addPassageReq(data)
    await load()
  }

  const updatePassage = async (id, data) => {
    await updatePassageReq(id, data)
    await load()
  }

  const deletePassage = async (id) => {
    await deletePassageReq(id)
    await load()
  }

  return { passages, loading, error, addPassage, updatePassage, deletePassage, reload: load }
}
