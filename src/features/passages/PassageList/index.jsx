import { Suspense, lazy, useMemo, useState } from 'react'
import { FiEdit2, FiEye, FiPlay, FiTrash2 } from 'react-icons/fi'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import { usePassages } from '../../../hooks/usePassages'
import { ActionRow, ErrorText, Header } from './styles'

const PassageForm = lazy(() => import('../PassageForm'))
const PreviewModal = lazy(() => import('../PreviewModal'))

const formatStatus = (value) => {
  if (!value) return 'Draft'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const PassageList = ({ type }) => {
  const { passages, loading, error, deletePassage, reload } = usePassages(type)
  const [mode, setMode] = useState('create')
  const [selected, setSelected] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [previewPassage, setPreviewPassage] = useState(null)

  const rows = useMemo(
    () =>
      passages.map((passage) => ({
        ...passage,
        level: passage.level || '-',
        statusLabel: formatStatus(passage.status),
        tagsLabel: passage.tags?.length ? passage.tags.join(', ') : 'No tags',
      })),
    [passages],
  )

  const openFormFor = (nextMode, passage = null) => {
    setMode(nextMode)
    setSelected(passage)
    setOpenForm(true)
  }

  const handleDelete = async (passageId) => {
    const confirmed = window.confirm('Delete this passage and all of its questions?')
    if (!confirmed) return

    try {
      await deletePassage(passageId)
      window.alert('Passage deleted successfully.')
    } catch (err) {
      window.alert(err.message || 'Failed to delete passage.')
    }
  }

  return (
    <>
      <Header>
        <h1 style={{ margin: 0, textTransform: 'capitalize' }}>{type} Passages</h1>
        <Button onClick={() => openFormFor('create')}>+ Add Passage</Button>
      </Header>

      {error ? <ErrorText>{error}</ErrorText> : null}

      {loading ? (
        <p>Loading passages...</p>
      ) : (
        <Table
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'level', label: 'Level' },
            { key: 'statusLabel', label: 'Status' },
            { key: 'tagsLabel', label: 'Tags' },
          ]}
          data={rows}
          emptyMessage={`No ${type} passages yet.`}
          actions={(row) => (
            <ActionRow>
              <Button size="sm" variant="ghost" onClick={() => openFormFor('view', row)}>
                <FiEye />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => openFormFor('edit', row)}>
                <FiEdit2 />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPreviewPassage(row)}>
                <FiPlay />
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
                <FiTrash2 />
              </Button>
            </ActionRow>
          )}
        />
      )}

      <Suspense fallback={null}>
        <PassageForm
          isOpen={openForm}
          onClose={() => setOpenForm(false)}
          passage={selected}
          type={type}
          mode={mode}
          onSaved={reload}
        />

        <PreviewModal
          isOpen={Boolean(previewPassage)}
          onClose={() => setPreviewPassage(null)}
          passage={previewPassage}
        />
      </Suspense>
    </>
  )
}

export default PassageList
