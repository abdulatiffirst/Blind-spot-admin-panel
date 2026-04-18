import { useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { addQuestion, updateQuestion } from '../../../firebase/firestore'
import { Actions, Form, Select, Textarea } from './styles'

const parseBlanks = (text) => [...text.matchAll(/\((\d+)\)/g)].map((m) => m[1])

const QuestionBuilder = ({ isOpen, onClose, question, passageId, onSaved }) => {
  const [form, setForm] = useState(
    question || {
      type: 'note_completion',
      questionNumber: 1,
      question: '',
      options: ['', '', '', ''],
      answer: '',
      noteText: '',
      answers: [],
      explanation: '',
    },
  )

  const blanks = useMemo(() => parseBlanks(form.noteText || ''), [form.noteText])

  const save = async (e) => {
    e.preventDefault()
    const payload = { ...form, passageId }
    if (question?.id) await updateQuestion(question.id, payload)
    else await addQuestion(payload)
    await onSaved?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Question Builder">
      <Form onSubmit={save}>
        <label>Question Type</label>
        <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="note_completion">Note Completion</option>
          <option value="identifying_information">Identifying Information</option>
          <option value="true_false_not_given">True/False/Not Given</option>
          <option value="multiple_choice">Multiple Choice</option>
        </Select>
        <Input
          label="Question Number"
          type="number"
          value={form.questionNumber}
          onChange={(e) => setForm({ ...form, questionNumber: Number(e.target.value) })}
        />
        {(form.type === 'true_false_not_given' || form.type === 'identifying_information') && (
          <>
            <label>Statement</label>
            <Textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            <Select value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}>
              <option value="">Select Answer</option>
              <option value="True">True</option>
              <option value="False">False</option>
              <option value="Not Given">Not Given</option>
            </Select>
          </>
        )}
        {form.type === 'note_completion' && (
          <>
            <label>Note Text</label>
            <Textarea value={form.noteText} onChange={(e) => setForm({ ...form, noteText: e.target.value })} />
            {blanks.map((n, i) => (
              <Input
                key={n}
                label={`Answer ${n}`}
                value={form.answers[i] || ''}
                onChange={(e) => {
                  const answers = [...(form.answers || [])]
                  answers[i] = e.target.value
                  setForm({ ...form, answers })
                }}
              />
            ))}
          </>
        )}
        {form.type === 'multiple_choice' && (
          <>
            <label>Question</label>
            <Textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            {['A', 'B', 'C', 'D'].map((k, i) => (
              <Input
                key={k}
                label={`Option ${k}`}
                value={form.options[i] || ''}
                onChange={(e) => {
                  const options = [...form.options]
                  options[i] = `${k}. ${e.target.value}`
                  setForm({ ...form, options })
                }}
              />
            ))}
            <Select value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}>
              <option value="">Correct answer</option>
              {['A', 'B', 'C', 'D'].map((o) => <option key={o} value={o}>{o}</option>)}
            </Select>
          </>
        )}
        <label>Explanation</label>
        <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
        <Actions>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </Actions>
      </Form>
    </Modal>
  )
}

export default QuestionBuilder
