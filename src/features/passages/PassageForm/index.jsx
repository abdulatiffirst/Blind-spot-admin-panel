import { useEffect, useMemo, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Table from '../../../components/ui/Table'
import TagInput from '../../../components/ui/TagInput'
import { storage } from '../../../firebase/config'
import {
  addPassage,
  deleteQuestion,
  getQuestions,
  getVocabLists,
  updatePassage,
} from '../../../firebase/firestore'
import QuestionBuilder from '../QuestionBuilder'
import {
  Actions,
  AudioPlayer,
  EditorArea,
  EditorShell,
  FieldGroup,
  FileName,
  Form,
  HelperText,
  Label,
  Notice,
  ProgressFill,
  ProgressTrack,
  QuestionActions,
  Row,
  Section,
  SectionHeader,
  SelectField,
  Toolbar,
} from './styles'

const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const EMPTY_FORM = {
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

const buildFormState = (passage) => ({
  ...EMPTY_FORM,
  ...passage,
  categories: Array.isArray(passage?.categories) ? passage.categories : [],
  tags: Array.isArray(passage?.tags) ? passage.tags : [],
  readingTime: passage?.readingTime ?? '',
  duration: passage?.duration ?? '',
  audioUrl: passage?.audioUrl ?? '',
  text: passage?.text ?? '',
})

const formatQuestionType = (value) =>
  value
    .split('_')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ')

const truncate = (value, maxLength = 80) => {
  if (!value) return '-'
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength)}...`
}

const getQuestionSummary = (question) => {
  if (question.type === 'note_completion') return question.noteText || 'Note completion'
  return question.question || '-'
}

const PassageForm = ({ isOpen, onClose, passage, type, mode, onSaved }) => {
  const readOnly = mode === 'view'
  const [form, setForm] = useState(EMPTY_FORM)
  const [currentPassageId, setCurrentPassageId] = useState('')
  const [questions, setQuestions] = useState([])
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [connectedVocabTitle, setConnectedVocabTitle] = useState('No vocabulary list connected')
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [pendingAudioFile, setPendingAudioFile] = useState(null)
  const [localAudioPreview, setLocalAudioPreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
    ],
    content: '',
    editable: !readOnly,
    onUpdate: ({ editor: currentEditor }) => {
      setForm((current) => ({ ...current, text: currentEditor.getHTML() }))
    },
  })

  const audioPreviewUrl = localAudioPreview || form.audioUrl || ''
  const effectiveMode = readOnly ? 'view' : currentPassageId ? 'edit' : 'create'
  const questionRows = useMemo(
    () =>
      questions.map((question) => ({
        id: question.id,
        number: `#${question.questionNumber}`,
        typeLabel: formatQuestionType(question.type),
        questionText: truncate(getQuestionSummary(question)),
      })),
    [questions],
  )

  useEffect(() => {
    if (!isOpen) return

    setForm(buildFormState(passage))
    setCurrentPassageId(passage?.id || '')
    setQuestions([])
    setQuestionsLoading(false)
    setConnectedVocabTitle('No vocabulary list connected')
    setShowQuestionForm(false)
    setEditingQuestion(null)
    setPendingAudioFile(null)
    setUploadProgress(0)
    setMessage(null)
    setLocalAudioPreview('')
  }, [isOpen, passage])

  useEffect(() => {
    return () => {
      if (localAudioPreview) {
        URL.revokeObjectURL(localAudioPreview)
      }
    }
  }, [localAudioPreview])

  useEffect(() => {
    if (!editor) return

    editor.setEditable(!readOnly)

    const nextContent = form.text || ''
    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, false)
    }
  }, [editor, form.text, readOnly])

  useEffect(() => {
    if (!isOpen) return

    let active = true

    const loadRelatedData = async () => {
      if (!currentPassageId) {
        if (active) {
          setQuestions([])
          setConnectedVocabTitle('No vocabulary list connected')
        }
        return
      }

      setQuestionsLoading(true)

      try {
        const [nextQuestions, vocabLists] = await Promise.all([
          getQuestions(currentPassageId),
          getVocabLists(),
        ])

        if (!active) return

        setQuestions(nextQuestions)

        const connectedList = vocabLists.find((list) => list.passageId === currentPassageId)
        setConnectedVocabTitle(connectedList ? connectedList.title : 'No vocabulary list connected')
      } catch (err) {
        if (active) {
          setMessage({
            variant: 'error',
            text: err.message || 'Failed to load passage details.',
          })
        }
      } finally {
        if (active) {
          setQuestionsLoading(false)
        }
      }
    }

    void loadRelatedData()

    return () => {
      active = false
    }
  }, [currentPassageId, isOpen])

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.'
    if (!form.level) return 'Level is required.'

    if (type === 'reading') {
      if (!form.readingTime || Number(form.readingTime) <= 0) {
        return 'Reading time must be greater than 0.'
      }

      const plainText = editor?.getText().trim() || ''
      if (!plainText) return 'Reading passage text is required.'
    }

    if (type === 'listening') {
      if (!form.duration || Number(form.duration) <= 0) {
        return 'Duration must be greater than 0.'
      }

      if (!form.audioUrl && !pendingAudioFile) {
        return 'Please upload an audio file.'
      }
    }

    return ''
  }

  const uploadAudio = async (file, passageId) => {
    const storageRef = ref(storage, `audio/${passageId}/${file.name}`)

    await new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file)

      task.on(
        'state_changed',
        (snapshot) => {
          const nextProgress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          )
          setUploadProgress(nextProgress)
        },
        reject,
        resolve,
      )
    })

    return getDownloadURL(storageRef)
  }

  const handleAudioSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (localAudioPreview) {
      URL.revokeObjectURL(localAudioPreview)
    }

    setPendingAudioFile(file)
    setLocalAudioPreview(URL.createObjectURL(file))
  }

  const reloadQuestions = async () => {
    if (!currentPassageId) return
    const nextQuestions = await getQuestions(currentPassageId)
    setQuestions(nextQuestions)
  }

  const handleDeleteQuestion = async (questionId) => {
    const confirmed = window.confirm('Delete this question?')
    if (!confirmed) return

    try {
      await deleteQuestion(questionId)
      await reloadQuestions()
      window.alert('Question deleted successfully.')
    } catch (err) {
      setMessage({
        variant: 'error',
        text: err.message || 'Failed to delete question.',
      })
    }
  }

  const handleOpenQuestionBuilder = () => {
    if (readOnly) return

    if (!currentPassageId) {
      setMessage({
        variant: 'info',
        text: 'Save the passage first to add questions.',
      })
      return
    }

    setEditingQuestion(null)
    setShowQuestionForm(true)
  }

  const save = async (event) => {
    event.preventDefault()
    if (readOnly) return

    const validationError = validate()
    if (validationError) {
      setMessage({ variant: 'error', text: validationError })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const isCreatingNewPassage = !currentPassageId
      const basePayload = {
        title: form.title.trim(),
        type,
        text: type === 'reading' ? editor?.getHTML() || form.text || '' : '',
        audioUrl: type === 'listening' ? form.audioUrl || '' : '',
        level: form.level,
        readingTime: type === 'reading' ? Number(form.readingTime) : 0,
        duration: type === 'listening' ? Number(form.duration) : 0,
        source: form.source.trim(),
        categories: form.categories,
        tags: form.tags,
        status: form.status,
      }

      let currentId = currentPassageId
      let nextAudioUrl = basePayload.audioUrl

      if (!currentId) {
        const created = await addPassage(basePayload)
        currentId = created.id
        setCurrentPassageId(currentId)

        if (type === 'listening' && pendingAudioFile) {
          nextAudioUrl = await uploadAudio(pendingAudioFile, currentId)
          await updatePassage(currentId, { ...basePayload, audioUrl: nextAudioUrl })
        }
      } else {
        if (type === 'listening' && pendingAudioFile) {
          nextAudioUrl = await uploadAudio(pendingAudioFile, currentId)
        }

        await updatePassage(currentId, { ...basePayload, audioUrl: nextAudioUrl })
      }

      setForm((current) => ({ ...current, audioUrl: nextAudioUrl || current.audioUrl }))
      setPendingAudioFile(null)
      setLocalAudioPreview('')
      setUploadProgress(0)
      await onSaved?.()

      if (isCreatingNewPassage) {
        setMessage({
          variant: 'success',
          text: 'Passage created. You can add questions now.',
        })
        return
      }

      window.alert('Passage saved successfully.')
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${effectiveMode.charAt(0).toUpperCase() + effectiveMode.slice(1)} ${type} passage`}
      width="980px"
    >
      <Form onSubmit={save}>
        {message ? <Notice variant={message.variant}>{message.text}</Notice> : null}

        <Section>
          <SectionHeader>
            <h3 style={{ margin: 0 }}>Passage Details</h3>
          </SectionHeader>

          <Input
            disabled={readOnly}
            label="Title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />

          <Row>
            <FieldGroup>
              <Label htmlFor="passage-level">Level</Label>
              <SelectField
                id="passage-level"
                disabled={readOnly}
                value={form.level}
                onChange={(event) =>
                  setForm((current) => ({ ...current, level: event.target.value }))
                }
              >
                {LEVEL_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </SelectField>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="passage-status">Status</Label>
              <SelectField
                id="passage-status"
                disabled={readOnly}
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value }))
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </SelectField>
            </FieldGroup>
          </Row>

          <Input
            disabled={readOnly}
            label="Source"
            value={form.source}
            onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}
          />

          <FieldGroup>
            <Label>Categories</Label>
            <TagInput
              disabled={readOnly}
              value={form.categories}
              onChange={(categories) => setForm((current) => ({ ...current, categories }))}
            />
          </FieldGroup>

          <FieldGroup>
            <Label>Tags</Label>
            <TagInput
              disabled={readOnly}
              value={form.tags}
              onChange={(tags) => setForm((current) => ({ ...current, tags }))}
            />
          </FieldGroup>
        </Section>

        {type === 'reading' ? (
          <Section>
            <SectionHeader>
              <h3 style={{ margin: 0 }}>Reading Content</h3>
            </SectionHeader>

            <Input
              disabled={readOnly}
              label="Reading Time (minutes)"
              type="number"
              value={form.readingTime}
              onChange={(event) =>
                setForm((current) => ({ ...current, readingTime: event.target.value }))
              }
            />

            <FieldGroup>
              <Label>Passage Text</Label>
              {!readOnly ? (
                <Toolbar>
                  <Button
                    type="button"
                    size="sm"
                    variant={editor?.isActive('bold') ? 'primary' : 'secondary'}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  >
                    Bold
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={editor?.isActive('italic') ? 'primary' : 'secondary'}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  >
                    Italic
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={editor?.isActive('underline') ? 'primary' : 'secondary'}
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  >
                    Underline
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={editor?.isActive('heading', { level: 2 }) ? 'primary' : 'secondary'}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    H2
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={editor?.isActive('heading', { level: 3 }) ? 'primary' : 'secondary'}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  >
                    H3
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={editor?.isActive('bulletList') ? 'primary' : 'secondary'}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  >
                    Bullet List
                  </Button>
                </Toolbar>
              ) : null}

              <EditorShell>
                <EditorArea>
                  {editor ? <EditorContent editor={editor} /> : null}
                </EditorArea>
              </EditorShell>
            </FieldGroup>
          </Section>
        ) : (
          <Section>
            <SectionHeader>
              <h3 style={{ margin: 0 }}>Listening Content</h3>
            </SectionHeader>

            <Input
              disabled={readOnly}
              label="Duration (minutes)"
              type="number"
              value={form.duration}
              onChange={(event) =>
                setForm((current) => ({ ...current, duration: event.target.value }))
              }
            />

            <FieldGroup>
              <Label htmlFor="passage-audio">Audio Upload</Label>
              <input
                id="passage-audio"
                disabled={readOnly}
                type="file"
                accept="audio/*"
                onChange={handleAudioSelect}
              />
              <HelperText>
                Audio files are stored in Firebase Storage under
                {' '}
                <strong>audio/passageId/fileName</strong>.
              </HelperText>
              {pendingAudioFile ? <FileName>Selected file: {pendingAudioFile.name}</FileName> : null}
              {uploadProgress > 0 ? (
                <ProgressTrack>
                  <ProgressFill value={uploadProgress} />
                </ProgressTrack>
              ) : null}
              {audioPreviewUrl ? <AudioPlayer controls src={audioPreviewUrl} /> : null}
            </FieldGroup>
          </Section>
        )}

        <Section>
          <SectionHeader>
            <h3 style={{ margin: 0 }}>Vocabulary</h3>
          </SectionHeader>

          <HelperText>Connected list: {connectedVocabTitle}</HelperText>
          <HelperText>Manage vocabulary in the Vocabulary section.</HelperText>
        </Section>

        <Section>
          <SectionHeader>
            <h3 style={{ margin: 0 }}>IELTS Questions</h3>
            {!readOnly ? (
              <Button type="button" variant="secondary" onClick={handleOpenQuestionBuilder}>
                + Add Question
              </Button>
            ) : null}
          </SectionHeader>

          {!currentPassageId ? (
            <Notice variant="info">Save the passage first to add questions.</Notice>
          ) : questionsLoading ? (
            <p>Loading questions...</p>
          ) : (
            <Table
              columns={[
                { key: 'number', label: '#' },
                { key: 'typeLabel', label: 'Type' },
                { key: 'questionText', label: 'Question Text' },
              ]}
              data={questionRows}
              emptyMessage="No questions added yet."
              actions={
                readOnly
                  ? null
                  : (row) => (
                      <QuestionActions>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const selectedQuestion = questions.find(
                              (question) => question.id === row.id,
                            )
                            setEditingQuestion(selectedQuestion || null)
                            setShowQuestionForm(true)
                          }}
                        >
                          <FiEdit2 />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteQuestion(row.id)}
                        >
                          <FiTrash2 />
                        </Button>
                      </QuestionActions>
                    )
              }
            />
          )}
        </Section>

        <Actions>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={readOnly || saving} type="submit">
            {saving ? 'Saving...' : currentPassageId ? 'Save' : 'Save Passage'}
          </Button>
        </Actions>
      </Form>

      <QuestionBuilder
        isOpen={showQuestionForm}
        onClose={() => setShowQuestionForm(false)}
        question={editingQuestion}
        passageId={currentPassageId}
        questions={questions}
        onQuestionsChange={reloadQuestions}
      />
    </Modal>
  )
}

export default PassageForm
