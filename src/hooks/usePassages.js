import { useCallback, useEffect, useState } from 'react'
import {
  addPassage as addPassageReq,
  deletePassage as deletePassageReq,
  getPassages,
  updatePassage as updatePassageReq,
} from '../firebase/firestore'
import { agentLog } from '../debug/instrument.js'

export const usePassages = (type) => {
  const [passages, setPassages] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPassages(type)
      setPassages(data)
    } catch (err) {
      // #region agent log
      agentLog({
        runId: 'run1',
        hypothesisId: 'H8',
        location: 'src/hooks/usePassages.js:18',
        message: 'getPassages failed',
        data: { type, error: err?.message || String(err) },
      })
      // #endregion
      setPassages([])
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    load()
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

  return { passages, loading, addPassage, updatePassage, deletePassage, reload: load }
}
