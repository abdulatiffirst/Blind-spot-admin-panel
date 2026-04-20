import { Suspense, lazy, useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import {
  deleteVocabList,
  getPassages,
  getVocabLists,
  getWords,
} from '../../../firebase/firestore'
import { ErrorText, Header } from './styles'

const VocabForm = lazy(() => import('../VocabForm'))

const formatDifficulty = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'

const formatPassageLabel = (passage) =>
  passage ? `${passage.title} (${passage.type === 'reading' ? 'Reading' : 'Listening'})` : 'Not connected'

const VocabList = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const [lists, readingPassages, listeningPassages] = await Promise.all([
        getVocabLists(),
        getPassages('reading'),
        getPassages('listening'),
      ])

      const passageMap = [...readingPassages, ...listeningPassages].reduce((accumulator, passage) => {
        accumulator[passage.id] = passage
        return accumulator
      }, {})

      const wordCounts = await Promise.all(lists.map((list) => getWords(list.id)))

      setItems(
        lists.map((list, index) => ({
          ...list,
          wordsCount: wordCounts[index].length,
          difficultyLabel: formatDifficulty(list.difficulty),
          connectedPassage: formatPassageLabel(passageMap[list.passageId]),
        })),
      )
    } catch (err) {
      setItems([])
      setError(err.message || 'Failed to load vocabulary lists.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleDelete = async (listId) => {
    const confirmed = window.confirm('Delete this list and all of its words?')
    if (!confirmed) return

    try {
      await deleteVocabList(listId)
      await load()
      window.alert('Vocabulary list deleted successfully.')
    } catch (err) {
      setError(err.message || 'Failed to delete vocabulary list.')
    }
  }

  return (
    <>
      <Header>
        <h1 style={{ margin: 0 }}>Vocabulary Lists</h1>
        <Button
          onClick={() => {
            setSelected(null)
            setOpen(true)
          }}
        >
          + Create List
        </Button>
      </Header>

      {error ? <ErrorText>{error}</ErrorText> : null}

      {loading ? (
        <p>Loading vocabulary lists...</p>
      ) : (
        <Table
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'wordsCount', label: 'Words Count' },
            { key: 'difficultyLabel', label: 'Difficulty' },
            { key: 'connectedPassage', label: 'Connected Passage' },
          ]}
          data={items}
          emptyMessage="No vocabulary lists yet."
          actions={(row) => (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelected(row)
                  setOpen(true)
                }}
              >
                Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
                Delete
              </Button>
            </>
          )}
        />
      )}

      <Suspense fallback={null}>
        <VocabForm
          isOpen={open}
          onClose={() => setOpen(false)}
          vocabList={selected}
          onSaved={load}
        />
      </Suspense>
    </>
  )
}

export default VocabList
