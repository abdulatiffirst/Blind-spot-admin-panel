import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { addWord, updateWord } from '../../../firebase/firestore'
import { Actions, Form, Label, Notice, Select, Textarea } from './styles'

const EMPTY_FORM = {
  word: '',
  definitionEn: '',
  definitionRu: '',
  examples: ['', '', ''],
  partOfSpeech: 'noun',
}

const buildFormState = (word) => ({
  ...EMPTY_FORM,
  ...word,
  examples: Array.isArray(word?.examples)
    ? [...word.examples, '', '', ''].slice(0, 3)
    : ['', '', ''],
})

const WordForm = ({ isOpen, onClose, word, listId, onSaved }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setForm(buildFormState(word))
    setMessage('')
  }, [isOpen, word])

  const save = async (event) => {
    event.preventDefault()

    if (!listId) {
      setMessage('Save the vocabulary list first.')
      return
    }

    if (!form.word.trim() || !form.definitionEn.trim() || !form.definitionRu.trim()) {
      setMessage('Word, English definition, and Russian definition are required.')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const payload = {
        word: form.word.trim(),
        partOfSpeech: form.partOfSpeech,
        definitionEn: form.definitionEn.trim(),
        definitionRu: form.definitionRu.trim(),
        examples: form.examples.map((example) => example.trim()).filter(Boolean).slice(0, 3),
      }

      if (word?.id) {
        await updateWord(listId, word.id, payload)
      } else {
        await addWord(listId, payload)
      }

      window.alert('Word saved successfully.')
      await onSaved?.()
      onClose()
    } catch (err) {
      setMessage(err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Word" width="700px">
      <Form onSubmit={save}>
        {message ? <Notice>{message}</Notice> : null}

        <Input
          label="Word"
          value={form.word}
          onChange={(event) => setForm((current) => ({ ...current, word: event.target.value }))}
        />

        <Label htmlFor="part-of-speech">Part of Speech</Label>
        <Select
          id="part-of-speech"
          value={form.partOfSpeech}
          onChange={(event) =>
            setForm((current) => ({ ...current, partOfSpeech: event.target.value }))
          }
        >
          <option value="noun">Noun</option>
          <option value="verb">Verb</option>
          <option value="adjective">Adjective</option>
          <option value="adverb">Adverb</option>
        </Select>

        <Label htmlFor="definition-en">Definition EN</Label>
        <Textarea
          id="definition-en"
          value={form.definitionEn}
          onChange={(event) =>
            setForm((current) => ({ ...current, definitionEn: event.target.value }))
          }
        />

        <Label htmlFor="definition-ru">Definition RU</Label>
        <Textarea
          id="definition-ru"
          value={form.definitionRu}
          onChange={(event) =>
            setForm((current) => ({ ...current, definitionRu: event.target.value }))
          }
        />

        {[0, 1, 2].map((index) => (
          <Input
            key={index}
            label={`Example ${index + 1}`}
            value={form.examples[index] || ''}
            onChange={(event) => {
              const nextExamples = [...form.examples]
              nextExamples[index] = event.target.value
              setForm((current) => ({ ...current, examples: nextExamples }))
            }}
          />
        ))}

        <Actions>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={saving} type="submit">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Actions>
      </Form>
    </Modal>
  )
}

export default WordForm
