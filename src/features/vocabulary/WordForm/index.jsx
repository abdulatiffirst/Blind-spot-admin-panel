import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { addWord, updateWord } from '../../../firebase/firestore'
import { Actions, Form, Select } from './styles'

const WordForm = ({ isOpen, onClose, word, listId, onSaved }) => {
  const [form, setForm] = useState({ word: '', definitionEn: '', definitionRu: '', examples: ['', '', ''], partOfSpeech: 'noun' })
  useEffect(() => {
    setForm(word || { word: '', definitionEn: '', definitionRu: '', examples: ['', '', ''], partOfSpeech: 'noun' })
  }, [word, isOpen])

  const save = async (e) => {
    e.preventDefault()
    if (!form.word || !form.definitionEn || !form.definitionRu) return
    if (word?.id) await updateWord(listId, word.id, form)
    else await addWord(listId, form)
    await onSaved?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Word">
      <Form onSubmit={save}>
        <Input label="Word" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} />
        <label>Part of Speech</label>
        <Select value={form.partOfSpeech} onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })}>
          <option value="noun">Noun</option>
          <option value="verb">Verb</option>
          <option value="adjective">Adjective</option>
          <option value="adverb">Adverb</option>
        </Select>
        <Input label="Definition EN" value={form.definitionEn} onChange={(e) => setForm({ ...form, definitionEn: e.target.value })} />
        <Input label="Definition RU" value={form.definitionRu} onChange={(e) => setForm({ ...form, definitionRu: e.target.value })} />
        {[0, 1, 2].map((i) => (
          <Input
            key={i}
            label={`Example ${i + 1}`}
            value={form.examples[i] || ''}
            onChange={(e) => {
              const examples = [...form.examples]
              examples[i] = e.target.value
              setForm({ ...form, examples })
            }}
          />
        ))}
        <Actions>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </Actions>
      </Form>
    </Modal>
  )
}

export default WordForm
