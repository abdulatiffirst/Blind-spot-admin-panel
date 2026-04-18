import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import { getQuestions } from '../../../firebase/firestore'
import { Body, Column, Header, Overlay } from './styles'

const PreviewModal = ({ isOpen, onClose, passage }) => {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!passage?.id) return
      setQuestions(await getQuestions(passage.id))
    }
    if (isOpen) load()
  }, [isOpen, passage])

  if (!isOpen || !passage) return null
  const correct = questions.filter((q) => answers[q.id] === q.answer).length

  return (
    <Overlay>
      <Header>
        <h3 style={{ margin: 0 }}>{passage.title}</h3>
        <Button onClick={onClose}>Exit Preview</Button>
      </Header>
      <Body twoCol={passage.type === 'reading'}>
        {passage.type === 'reading' && (
          <Column dangerouslySetInnerHTML={{ __html: passage.text || '' }} />
        )}
        <Column style={{ borderRight: 'none' }}>
          {passage.type === 'listening' && passage.audioUrl ? <audio src={passage.audioUrl} controls /> : null}
          {questions.map((q) => (
            <div key={q.id} style={{ marginBottom: 16 }}>
              <p><strong>#{q.questionNumber}</strong> {q.question || q.noteText}</p>
              {q.type === 'multiple_choice' && q.options?.map((o) => {
                const letter = o.split('.')[0]
                return (
                  <label key={o} style={{ display: 'block' }}>
                    <input type="radio" name={q.id} onChange={() => setAnswers({ ...answers, [q.id]: letter })} /> {o}
                  </label>
                )
              })}
              {(q.type === 'true_false_not_given' || q.type === 'identifying_information') && ['True', 'False', 'Not Given'].map((opt) => (
                <label key={opt} style={{ display: 'block' }}>
                  <input type="radio" name={q.id} onChange={() => setAnswers({ ...answers, [q.id]: opt })} /> {opt}
                </label>
              ))}
              {q.type === 'note_completion' && (q.answers || []).map((_, i) => (
                <input
                  key={i}
                  placeholder={`Blank ${i + 1}`}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: `${(answers[q.id] || []).slice(0, i).join('|')}|${e.target.value}` })}
                />
              ))}
              {submitted ? (
                <p style={{ color: answers[q.id] === q.answer ? 'green' : 'red' }}>
                  Your answer: {answers[q.id] || '-'} | Correct: {q.answer} {q.explanation ? `| ${q.explanation}` : ''}
                </p>
              ) : null}
            </div>
          ))}
          <Button onClick={() => setSubmitted(true)}>Submit Answers</Button>
          {submitted ? <p>You got {correct} out of {questions.length} correct</p> : null}
        </Column>
      </Body>
    </Overlay>
  )
}

export default PreviewModal
