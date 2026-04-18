import { useEffect, useMemo, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import TagInput from '../../../components/ui/TagInput'
import { storage } from '../../../firebase/config'
import { addPassage, getQuestions, updatePassage, deleteQuestion } from '../../../firebase/firestore'
import QuestionBuilder from '../QuestionBuilder'
import { Actions, Field, Form, Row, Textarea } from './styles'
// import { agentLog } from '../../../debug/instrument.js'

const emptyState = {
  title: '',
  level: 'A1',
  source: '',
  categories: [],
  tags: [],
  status: 'draft',
  readingTime: '',
  duration: '',
  text: '',
  audioUrl: '',
}

const PassageForm = ({ isOpen, onClose, passage, type, mode, onSaved }) => {
  const readOnly = mode === 'view'
  const [form, setForm] = useState(emptyState)
  const [questions, setQuestions] = useState([])
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: form.text || '',
    editable: !readOnly,
    onUpdate: ({ editor: e }) => setForm((p) => ({ ...p, text: e.getHTML() })),
  })

  useEffect(() => {
    const seed = passage ? { ...emptyState, ...passage } : { ...emptyState }
    setForm(seed)
  }, [passage, isOpen])

  useEffect(() => {
    const loadQ = async () => {
      if (!passage?.id) return setQuestions([])
      const q = await getQuestions(passage.id)
      setQuestions(q)
    }
    if (isOpen) loadQ()
  }, [isOpen, passage])

  const canSave = useMemo(() => form.title && form.level, [form.title, form.level])

  const uploadAudio = async (file, passageId) => {
    const storageRef = ref(storage, `audio/${passageId}/${file.name}`)
    await new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file)
      task.on(
        'state_changed',
        (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        resolve,
      )
    })
    return getDownloadURL(storageRef)
  }

  const save = async (e) => {
    e.preventDefault()
    // // #region agent log
    // agentLog({
    //   runId: 'run1',
    //   hypothesisId: 'H3',
    //   location: 'src/features/passages/PassageForm/index.jsx:78',
    //   message: 'passage save attempt',
    //   data: { mode, type, canSave: Boolean(canSave), readOnly },
    // })
    // // #endregion
    if (readOnly || !canSave) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        type,
        readingTime: type === 'reading' ? Number(form.readingTime || 0) : 0,
        duration: type === 'listening' ? Number(form.duration || 0) : 0,
      }

      let id = passage?.id
      if (mode === 'create') {
        const created = await addPassage(payload)
        id = created.id
      } else {
        await updatePassage(id, payload)
      }
      await onSaved?.()
      // #region agent log
      // agentLog({
      //   runId: 'run1',
      //   hypothesisId: 'H3',
      //   location: 'src/features/passages/PassageForm/index.jsx:99',
      //   message: 'passage save success',
      //   data: { mode, type },
      // })
      // #endregion
      onClose()
    } catch (err) {
      // #region agent log
      // agentLog({
      //   runId: 'run1',
      //   hypothesisId: 'H3',
      //   location: 'src/features/passages/PassageForm/index.jsx:104',
      //   message: 'passage save error',
      //   data: { error: err?.message || 'unknown' },
      // })
      // #endregion
      alert(err.message || 'Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${mode.toUpperCase()} ${type} Passage`} width="900px">
      <Form onSubmit={save}>
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Row>
          <div>
            <label>Level</label>
            <Field value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} disabled={readOnly}>
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => <option key={l} value={l}>{l}</option>)}
            </Field>
          </div>
          <div>
            <label>Status</label>
            <Field value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} disabled={readOnly}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Field>
          </div>
        </Row>
        <Input label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
        <div>
          <label>Categories</label>
          <TagInput value={form.categories} onChange={(categories) => setForm({ ...form, categories })} />
        </div>
        <div>
          <label>Tags</label>
          <TagInput value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
        </div>

        {type === 'reading' ? (
          <>
            <Input label="Reading Time (minutes)" type="number" value={form.readingTime} onChange={(e) => setForm({ ...form, readingTime: e.target.value })} />
            <div>
              <label>Passage Text</label>
              {editor ? <EditorContent editor={editor} style={{ minHeight: 300, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }} /> : null}
            </div>
          </>
        ) : (
          <>
            <Input label="Duration (minutes)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <input
              disabled={readOnly || !passage?.id}
              type="file"
              accept="audio/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file || !passage?.id) return
                const audioUrl = await uploadAudio(file, passage.id)
                setForm((p) => ({ ...p, audioUrl }))
              }}
            />
            {uploadProgress > 0 ? <progress value={uploadProgress} max={100} /> : null}
            {form.audioUrl ? <audio src={form.audioUrl} controls /> : null}
          </>
        )}

        <div>
          <h3>IELTS Questions</h3>
          <Button
            type="button"
            onClick={() => {
              setEditingQuestion(null)
              setShowQuestionForm(true)
            }}
            disabled={!passage?.id && mode === 'create'}
          >
            + Add Question
          </Button>
          <ul>
            {questions.map((q) => (
              <li key={q.id}>
                #{q.questionNumber} - {q.type}
                <Button type="button" size="sm" variant="ghost" onClick={() => { setEditingQuestion(q); setShowQuestionForm(true) }}>Edit</Button>
                <Button type="button" size="sm" variant="danger" onClick={async () => {
                  await deleteQuestion(q.id)
                  const next = await getQuestions(passage.id)
                  setQuestions(next)
                }}>Delete</Button>
              </li>
            ))}
          </ul>
        </div>

        <Actions>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={readOnly || !canSave || loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </Actions>
      </Form>

      <QuestionBuilder
        isOpen={showQuestionForm}
        onClose={() => setShowQuestionForm(false)}
        passageId={passage?.id}
        question={editingQuestion}
        onSaved={async () => {
          const next = await getQuestions(passage.id)
          setQuestions(next)
        }}
      />
    </Modal>
  )
}

export default PassageForm
