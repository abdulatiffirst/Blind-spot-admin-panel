import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Table from '../../../components/ui/Table'
import TagInput from '../../../components/ui/TagInput'
import {
  addVocabList,
  deleteWord,
  getPassages,
  getWords,
  updateVocabList,
} from '../../../firebase/firestore'
import WordForm from '../WordForm'
import { Actions, Form, HelperText, Label, Notice, Section, SectionHeader, Select } from './styles'

const EMPTY_FORM = {
  title: '',
  difficulty: 'easy',
  tags: [],
  passageId: '',
}

const buildFormState = (vocabList) => ({
  ...EMPTY_FORM,
  ...vocabList,
  tags: Array.isArray(vocabList?.tags) ? vocabList.tags : [],
  passageId: vocabList?.passageId || '',
})

const formatPassageLabel = (passage) =>
  `${passage.title} (${passage.type === 'reading' ? 'Reading' : 'Listening'})`

const VocabForm = ({ isOpen, onClose, vocabList, onSaved }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [passages, setPassages] = useState([])
  const [words, setWords] = useState([])
  const [loadingPassages, setLoadingPassages] = useState(false)
  const [loadingWords, setLoadingWords] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [wordOpen, setWordOpen] = useState(false)
  const [selectedWord, setSelectedWord] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    setForm(buildFormState(vocabList))
    setMessage(null)
    setSelectedWord(null)
    setWordOpen(false)
  }, [isOpen, vocabList])

  useEffect(() => {
    if (!isOpen) return

    let active = true

    const loadPassageOptions = async () => {
      setLoadingPassages(true)

      try {
        const [readingPassages, listeningPassages] = await Promise.all([
          getPassages('reading'),
          getPassages('listening'),
        ])

        if (active) {
          setPassages([...readingPassages, ...listeningPassages])
        }
      } catch (err) {
        if (active) {
          setMessage({
            variant: 'error',
            text: err.message || 'Failed to load passages.',
          })
        }
      } finally {
        if (active) {
          setLoadingPassages(false)
        }
      }
    }

    void loadPassageOptions()

    return () => {
      active = false
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    let active = true

    const loadWords = async () => {
      if (!vocabList?.id) {
        if (active) {
          setWords([])
        }
        return
      }

      setLoadingWords(true)

      try {
        const nextWords = await getWords(vocabList.id)
        if (active) {
          setWords(nextWords)
        }
      } catch (err) {
        if (active) {
          setMessage({
            variant: 'error',
            text: err.message || 'Failed to load words.',
          })
        }
      } finally {
        if (active) {
          setLoadingWords(false)
        }
      }
    }

    void loadWords()

    return () => {
      active = false
    }
  }, [isOpen, vocabList])

  const loadWords = async () => {
    if (!vocabList?.id) {
      setWords([])
      return
    }

    setLoadingWords(true)

    try {
      const nextWords = await getWords(vocabList.id)
      setWords(nextWords)
    } catch (err) {
      setMessage({
        variant: 'error',
        text: err.message || 'Failed to load words.',
      })
    } finally {
      setLoadingWords(false)
    }
  }

  const save = async (event) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setMessage({ variant: 'error', text: 'Title is required.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const payload = {
        title: form.title.trim(),
        difficulty: form.difficulty,
        tags: form.tags,
        passageId: form.passageId,
      }

      if (vocabList?.id) {
        await updateVocabList(vocabList.id, payload)
      } else {
        await addVocabList(payload)
      }

      window.alert('Vocabulary list saved successfully.')
      await onSaved?.()
      onClose()
    } catch (err) {
      setMessage({
        variant: 'error',
        text: err.message || 'Failed to save. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteWord = async (wordId) => {
    if (!vocabList?.id) return

    const confirmed = window.confirm('Delete this word?')
    if (!confirmed) return

    try {
      await deleteWord(vocabList.id, wordId)
      await loadWords()
      window.alert('Word deleted successfully.')
    } catch (err) {
      setMessage({
        variant: 'error',
        text: err.message || 'Failed to delete word.',
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vocabulary List" width="820px">
      <Form onSubmit={save}>
        {message ? <Notice variant={message.variant}>{message.text}</Notice> : null}

        <Section>
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />

          <Label htmlFor="vocab-difficulty">Difficulty</Label>
          <Select
            id="vocab-difficulty"
            value={form.difficulty}
            onChange={(event) =>
              setForm((current) => ({ ...current, difficulty: event.target.value }))
            }
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>

          <Label>Tags</Label>
          <TagInput
            value={form.tags}
            onChange={(tags) => setForm((current) => ({ ...current, tags }))}
          />

          <Label htmlFor="connected-passage">Connected Passage</Label>
          <Select
            id="connected-passage"
            value={form.passageId}
            onChange={(event) =>
              setForm((current) => ({ ...current, passageId: event.target.value }))
            }
          >
            <option value="">Select a passage</option>
            {passages.map((passage) => (
              <option key={passage.id} value={passage.id}>
                {formatPassageLabel(passage)}
              </option>
            ))}
          </Select>
          {loadingPassages ? <HelperText>Loading passages...</HelperText> : null}
        </Section>

        <Section>
          <SectionHeader>
            <h3 style={{ margin: 0 }}>Words</h3>
            {vocabList?.id ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSelectedWord(null)
                  setWordOpen(true)
                }}
              >
                + Add Word
              </Button>
            ) : null}
          </SectionHeader>

          {!vocabList?.id ? (
            <Notice variant="info">Save the list first to add words.</Notice>
          ) : loadingWords ? (
            <p>Loading words...</p>
          ) : (
            <Table
              columns={[
                { key: 'word', label: 'Word' },
                { key: 'partOfSpeech', label: 'Part of Speech' },
                { key: 'definitionEn', label: 'Definition EN' },
              ]}
              data={words}
              emptyMessage="No words in this list yet."
              actions={(row) => (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedWord(row)
                      setWordOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteWord(row.id)}>
                    Delete
                  </Button>
                </>
              )}
            />
          )}
        </Section>

        <Actions>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={saving} type="submit">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Actions>
      </Form>

      <WordForm
        isOpen={wordOpen}
        onClose={() => setWordOpen(false)}
        word={selectedWord}
        listId={vocabList?.id}
        onSaved={loadWords}
      />
    </Modal>
  )
}

export default VocabForm
