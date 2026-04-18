import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Table from '../../../components/ui/Table'
import TagInput from '../../../components/ui/TagInput'
import { addVocabList, getPassages, getWords, updateVocabList, deleteWord } from '../../../firebase/firestore'
import WordForm from '../WordForm'
import { Actions, Form, Select } from './styles'

const VocabForm = ({ isOpen, onClose, vocabList, onSaved }) => {
  const [form, setForm] = useState({ title: '', difficulty: 'easy', tags: [], passageId: '' })
  const [words, setWords] = useState([])
  const [wordOpen, setWordOpen] = useState(false)
  const [word, setWord] = useState(null)
  const [passages, setPassages] = useState([])

  useEffect(() => {
    setForm(vocabList || { title: '', difficulty: 'easy', tags: [], passageId: '' })
  }, [vocabList, isOpen])

  useEffect(() => {
    const load = async () => {
      const [reading, listening] = await Promise.all([getPassages('reading'), getPassages('listening')])
      setPassages([...reading, ...listening])
    }
    if (isOpen) load()
  }, [isOpen])

  useEffect(() => {
    const loadWords = async () => {
      if (!vocabList?.id) return setWords([])
      setWords(await getWords(vocabList.id))
    }
    if (isOpen) loadWords()
  }, [isOpen, vocabList])

  const save = async (e) => {
    e.preventDefault()
    if (!form.title) return
    if (vocabList?.id) await updateVocabList(vocabList.id, form)
    else await addVocabList(form)
    await onSaved?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vocabulary List">
      <Form onSubmit={save}>
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <label>Difficulty</label>
        <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
        <label>Tags</label>
        <TagInput value={form.tags || []} onChange={(tags) => setForm({ ...form, tags })} />
        <label>Connected Passage</label>
        <Select value={form.passageId || ''} onChange={(e) => setForm({ ...form, passageId: e.target.value })}>
          <option value="">Select passage</option>
          {passages.map((p) => <option key={p.id} value={p.id}>{p.title} ({p.type})</option>)}
        </Select>
        <h4>Words</h4>
        {vocabList?.id ? (
          <>
            <Button type="button" onClick={() => { setWord(null); setWordOpen(true) }}>+ Add Word</Button>
            <Table
              columns={[
                { key: 'word', label: 'Word' },
                { key: 'partOfSpeech', label: 'Part of Speech' },
                { key: 'definitionEn', label: 'Definition EN' },
              ]}
              data={words}
              actions={(row) => (
                <>
                  <Button size="sm" variant="ghost" onClick={() => { setWord(row); setWordOpen(true) }}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={async () => {
                    await deleteWord(vocabList.id, row.id)
                    setWords(await getWords(vocabList.id))
                  }}>Delete</Button>
                </>
              )}
            />
          </>
        ) : (
          <p>Save the list first to add words</p>
        )}
        <Actions>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </Actions>
      </Form>
      <WordForm
        isOpen={wordOpen}
        onClose={() => setWordOpen(false)}
        word={word}
        listId={vocabList?.id}
        onSaved={async () => setWords(await getWords(vocabList.id))}
      />
    </Modal>
  )
}

export default VocabForm
