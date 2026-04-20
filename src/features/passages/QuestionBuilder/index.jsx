import { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { addQuestion, updateQuestion } from '../../../firebase/firestore'
import { Actions, FieldGroup, Form, Grid, HelperText, Label, Notice, Select, Textarea } from './styles'

const parseBlanks = (text) => [...text.matchAll(/\((\d+)\)/g)].map((match) => match[1])

const getNextQuestionNumber = (questions = []) => {
  if (!questions.length) return 1
  return (
    Math.max(...questions.map((question) => Number(question.questionNumber) || 0)) + 1
  )
}

const stripOptionLabel = (option = '') => option.replace(/^[A-D]\.\s*/, '')

const buildFormState = (question, questions) => ({
  type: question?.type || 'note_completion',
  questionNumber: question?.questionNumber || getNextQuestionNumber(questions),
  question: question?.question || '',
  options: question?.options?.length
    ? question.options.map((option) => stripOptionLabel(option))
    : ['', '', '', ''],
  answer: question?.answer || '',
  noteText: question?.noteText || '',
  answers: question?.answers || [],
  explanation: question?.explanation || '',
})

const QuestionBuilder = ({ isOpen, onClose, question, passageId, questions, onQuestionsChange }) => {
  const [form, setForm] = useState(buildFormState(question, questions))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const blanks = useMemo(() => parseBlanks(form.noteText || ''), [form.noteText])

  useEffect(() => {
    if (!isOpen) return
    setForm(buildFormState(question, questions))
    setMessage('')
  }, [isOpen, question, questions])

  const validate = () => {
    if (!passageId) return 'Save the passage first to add questions.'
    if (!form.questionNumber || Number(form.questionNumber) <= 0) {
      return 'Question number must be greater than 0.'
    }

    if (form.type === 'note_completion') {
      if (!form.noteText.trim()) return 'Note text is required.'
      if (!blanks.length) return 'Add blanks in the note using (1), (2), (3), and so on.'
      if (blanks.some((_, index) => !form.answers[index]?.trim())) {
        return 'Each blank needs an answer.'
      }
    }

    if (form.type === 'true_false_not_given' || form.type === 'identifying_information') {
      if (!form.question.trim()) return 'Statement is required.'
      if (!form.answer) return 'Select the correct answer.'
    }

    if (form.type === 'multiple_choice') {
      if (!form.question.trim()) return 'Question text is required.'
      if (form.options.some((option) => !option.trim())) return 'All four options are required.'
      if (!form.answer) return 'Select the correct answer.'
    }

    return ''
  }

  const save = async (event) => {
    event.preventDefault()

    const validationError = validate()
    if (validationError) {
      setMessage(validationError)
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const optionLetters = ['A', 'B', 'C', 'D']
      const payload = {
        passageId,
        type: form.type,
        questionNumber: Number(form.questionNumber),
        question: form.type === 'note_completion' ? '' : form.question.trim(),
        options:
          form.type === 'multiple_choice'
            ? form.options.map((option, index) => `${optionLetters[index]}. ${option.trim()}`)
            : [],
        answer:
          form.type === 'note_completion'
            ? ''
            : form.answer,
        noteText: form.type === 'note_completion' ? form.noteText.trim() : '',
        answers:
          form.type === 'note_completion'
            ? blanks.map((_, index) => form.answers[index].trim())
            : [],
        explanation: form.explanation.trim(),
      }

      if (question?.id) {
        await updateQuestion(question.id, payload)
      } else {
        await addQuestion(payload)
      }

      window.alert('Question saved successfully.')
      await onQuestionsChange?.()
      onClose()
    } catch (err) {
      setMessage(err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Question Builder">
      <Form onSubmit={save}>
        {message ? <Notice>{message}</Notice> : null}

        <FieldGroup>
          <Label htmlFor="question-type">Question Type</Label>
          <Select
            id="question-type"
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: event.target.value,
                answer: '',
              }))
            }
          >
            <option value="note_completion">Note Completion</option>
            <option value="identifying_information">Identifying Information</option>
            <option value="true_false_not_given">True/False/Not Given</option>
            <option value="multiple_choice">Multiple Choice</option>
          </Select>
        </FieldGroup>

        <Input
          label="Question Number"
          type="number"
          value={form.questionNumber}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              questionNumber: Number(event.target.value),
            }))
          }
        />

        {(form.type === 'true_false_not_given' || form.type === 'identifying_information') && (
          <>
            <FieldGroup>
              <Label htmlFor="question-statement">Statement</Label>
              <Textarea
                id="question-statement"
                value={form.question}
                onChange={(event) =>
                  setForm((current) => ({ ...current, question: event.target.value }))
                }
              />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="question-answer">Answer</Label>
              <Select
                id="question-answer"
                value={form.answer}
                onChange={(event) =>
                  setForm((current) => ({ ...current, answer: event.target.value }))
                }
              >
                <option value="">Select Answer</option>
                <option value="True">True</option>
                <option value="False">False</option>
                <option value="Not Given">Not Given</option>
              </Select>
            </FieldGroup>
          </>
        )}

        {form.type === 'note_completion' && (
          <>
            <FieldGroup>
              <Label htmlFor="note-text">Note Text</Label>
              <Textarea
                id="note-text"
                value={form.noteText}
                onChange={(event) =>
                  setForm((current) => ({ ...current, noteText: event.target.value }))
                }
              />
              <HelperText>Use placeholders like (1), (2), (3) to mark blanks.</HelperText>
            </FieldGroup>

            <Grid>
              {blanks.map((blankNumber, index) => (
                <Input
                  key={blankNumber}
                  label={`Answer ${blankNumber}`}
                  value={form.answers[index] || ''}
                  onChange={(event) => {
                    const nextAnswers = [...form.answers]
                    nextAnswers[index] = event.target.value
                    setForm((current) => ({ ...current, answers: nextAnswers }))
                  }}
                />
              ))}
            </Grid>
          </>
        )}

        {form.type === 'multiple_choice' && (
          <>
            <FieldGroup>
              <Label htmlFor="mc-question">Question</Label>
              <Textarea
                id="mc-question"
                value={form.question}
                onChange={(event) =>
                  setForm((current) => ({ ...current, question: event.target.value }))
                }
              />
            </FieldGroup>

            <Grid>
              {['A', 'B', 'C', 'D'].map((letter, index) => (
                <Input
                  key={letter}
                  label={`Option ${letter}`}
                  value={form.options[index] || ''}
                  onChange={(event) => {
                    const nextOptions = [...form.options]
                    nextOptions[index] = event.target.value
                    setForm((current) => ({ ...current, options: nextOptions }))
                  }}
                />
              ))}
            </Grid>

            <FieldGroup>
              <Label htmlFor="mc-answer">Correct Answer</Label>
              <Select
                id="mc-answer"
                value={form.answer}
                onChange={(event) =>
                  setForm((current) => ({ ...current, answer: event.target.value }))
                }
              >
                <option value="">Correct answer</option>
                {['A', 'B', 'C', 'D'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </FieldGroup>
          </>
        )}

        <FieldGroup>
          <Label htmlFor="question-explanation">Explanation</Label>
          <Textarea
            id="question-explanation"
            value={form.explanation}
            onChange={(event) =>
              setForm((current) => ({ ...current, explanation: event.target.value }))
            }
          />
        </FieldGroup>

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

export default QuestionBuilder
