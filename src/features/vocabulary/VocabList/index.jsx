import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import { deleteVocabList, getVocabLists } from '../../../firebase/firestore'
import VocabForm from '../VocabForm'
import { Header } from './styles'

const VocabList = () => {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const load = async () => setItems(await getVocabLists())
  useEffect(() => { load() }, [])

  return (
    <>
      <Header>
        <h1 style={{ margin: 0 }}>Vocabulary Lists</h1>
        <Button onClick={() => { setSelected(null); setOpen(true) }}>+ Create List</Button>
      </Header>
      <Table
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'difficulty', label: 'Difficulty' },
          { key: 'passageId', label: 'Connected Passage' },
        ]}
        data={items}
        actions={(row) => (
          <>
            <Button size="sm" variant="ghost" onClick={() => { setSelected(row); setOpen(true) }}>Edit</Button>
            <Button size="sm" variant="danger" onClick={async () => {
              if (!window.confirm('Delete list and all words?')) return
              await deleteVocabList(row.id)
              await load()
            }}>Delete</Button>
          </>
        )}
      />
      <VocabForm isOpen={open} onClose={() => setOpen(false)} vocabList={selected} onSaved={load} />
    </>
  )
}

export default VocabList
