import { useState } from 'react'
import { FiEdit2, FiEye, FiPlay, FiTrash2 } from 'react-icons/fi'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import { usePassages } from '../../../hooks/usePassages'
import PassageForm from '../PassageForm'
import PreviewModal from '../PreviewModal'
import { ActionRow, Header } from './styles'

const PassageList = ({ type }) => {
  const { passages, loading, deletePassage, reload } = usePassages(type)
  const [mode, setMode] = useState('create')
  const [selected, setSelected] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)

  const open = (nextMode, item = null) => {
    setMode(nextMode)
    setSelected(item)
    setOpenForm(true)
  }

  const data = passages.map((p) => ({
    ...p,
    tags: (p.tags || []).join(', '),
    status: p.status || 'draft',
  }))

  return (
    <>
      <Header>
        <h1 style={{ margin: 0, textTransform: 'capitalize' }}>{type} Passages</h1>
        <Button onClick={() => open('create')}>+ Add Passage</Button>
      </Header>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'level', label: 'Level' },
            { key: 'status', label: 'Status' },
            { key: 'tags', label: 'Tags' },
          ]}
          data={data}
          actions={(row) => (
            <ActionRow>
              <Button size="sm" variant="ghost" onClick={() => open('view', row)}><FiEye /></Button>
              <Button size="sm" variant="ghost" onClick={() => open('edit', row)}><FiEdit2 /></Button>
              <Button size="sm" variant="ghost" onClick={() => { setSelected(row); setOpenPreview(true) }}><FiPlay /></Button>
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  if (!window.confirm('Delete passage and all related questions?')) return
                  await deletePassage(row.id)
                }}
              >
                <FiTrash2 />
              </Button>
            </ActionRow>
          )}
        />
      )}
      <PassageForm
        isOpen={openForm}
        onClose={() => setOpenForm(false)}
        passage={selected}
        type={type}
        mode={mode}
        onSaved={reload}
      />
      <PreviewModal
        isOpen={openPreview}
        onClose={() => setOpenPreview(false)}
        passage={selected}
      />
    </>
  )
}

export default PassageList
