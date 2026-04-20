import { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import { getQuestions } from '../../../firebase/firestore'
import {
  AnswerField,
  AnswerGrid,
  Blank,
  Body,
  Column,
  EmptyState,
  Explanation,
  Footer,
  Header,
  NotePreview,
  OptionLabel,
  OptionList,
  Overlay,
  QuestionCard,
  QuestionText,
  ResultText,
  ScoreBox,
} from './styles'

const parseBlanks = (text) => [...text.matchAll(/\((\d+)\)/g)].map((match) => match[1])

const normalize = (value) => String(value || '').trim().toLowerCase()

const renderNoteSegments = (text) => {
  const parts = []
  const matches = [...text.matchAll(/\((\d+)\)/g)]
  let cursor = 0

  matches.forEach((match, index) => {
    const startIndex = match.index ?? 0

    if (startIndex > cursor) {
      parts.push(text.slice(cursor, startIndex))
    }

    parts.push({ blankNumber: match[1], key: `blank-${index}` })
    cursor = startIndex + match[0].length
  })

  if (cursor < text.length) {
    parts.push(text.slice(cursor))
  }

  return parts
}

const isCorrectAnswer = (question, studentAnswer) => {
  if (question.type === 'note_completion') {
    const expectedAnswers = question.answers || []
    const submittedAnswers = Array.isArray(studentAnswer) ? studentAnswer : []

    if (expectedAnswers.length !== submittedAnswers.length) return false

    return expectedAnswers.every(
      (answer, index) => normalize(answer) === normalize(submittedAnswers[index]),
    )
  }

  return normalize(studentAnswer) === normalize(question.answer)
}

const formatStudentAnswer = (question, value) => {
  if (question.type === 'note_completion') {
    return Array.isArray(value) && value.length ? value.join(', ') : '-'
  }

  return value || '-'
}

const formatCorrectAnswer = (question) => {
  if (question.type === 'note_completion') {
    return question.answers?.length ? question.answers.join(', ') : '-'
  }

  return question.answer || '-'
}

const PreviewModal = ({ isOpen, onClose, passage }) => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !passage?.id) return

    let active = true

    const loadQuestions = async () => {
      setLoading(true)
      setError('')
      setAnswers({})
      setSubmitted(false)

      try {
        const nextQuestions = await getQuestions(passage.id)
        if (active) {
          setQuestions(nextQuestions)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load preview questions.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadQuestions()

    return () => {
      active = false
    }
  }, [isOpen, passage?.id])

  const score = useMemo(
    () =>
      questions.reduce((total, question) => {
        if (!submitted) return total
        return total + (isCorrectAnswer(question, answers[question.id]) ? 1 : 0)
      }, 0),
    [answers, questions, submitted],
  )

  const renderQuestionInputs = (question) => {
    if (question.type === 'multiple_choice') {
      return (
        <OptionList>
          {(question.options || []).map((option) => {
            const optionLetter = option.split('.')[0]
            return (
              <OptionLabel key={option}>
                <input
                  checked={answers[question.id] === optionLetter}
                  type="radio"
                  name={question.id}
                  onChange={() =>
                    setAnswers((current) => ({ ...current, [question.id]: optionLetter }))
                  }
                />
                <span>{option}</span>
              </OptionLabel>
            )
          })}
        </OptionList>
      )
    }

    if (
      question.type === 'true_false_not_given' ||
      question.type === 'identifying_information'
    ) {
      return (
        <OptionList>
          {['True', 'False', 'Not Given'].map((option) => (
            <OptionLabel key={option}>
              <input
                checked={answers[question.id] === option}
                type="radio"
                name={question.id}
                onChange={() =>
                  setAnswers((current) => ({ ...current, [question.id]: option }))
                }
              />
              <span>{option}</span>
            </OptionLabel>
          ))}
        </OptionList>
      )
    }

    const blanks = parseBlanks(question.noteText || '')
    const noteSegments = renderNoteSegments(question.noteText || '')
    const noteAnswers = Array.isArray(answers[question.id]) ? answers[question.id] : []

    return (
      <>
        <NotePreview>
          {noteSegments.map((segment, index) =>
            typeof segment === 'string' ? (
              <span key={`text-${index}`}>{segment}</span>
            ) : (
              <Blank key={segment.key}>({segment.blankNumber})</Blank>
            ),
          )}
        </NotePreview>

        <AnswerGrid>
          {blanks.map((blankNumber, index) => (
            <label key={blankNumber}>
              <div style={{ marginBottom: 6 }}>Blank {blankNumber}</div>
              <AnswerField
                value={noteAnswers[index] || ''}
                onChange={(event) => {
                  const nextAnswers = [...noteAnswers]
                  nextAnswers[index] = event.target.value
                  setAnswers((current) => ({ ...current, [question.id]: nextAnswers }))
                }}
              />
            </label>
          ))}
        </AnswerGrid>
      </>
    )
  }

  if (!isOpen || !passage) return null

  return (
    <Overlay>
      <Header>
        <h2 style={{ margin: 0 }}>{passage.title}</h2>
        <Button onClick={onClose}>Exit Preview</Button>
      </Header>

      <Body twoColumn={passage.type === 'reading'}>
        {passage.type === 'reading' ? (
          <Column withDivider>
            <div dangerouslySetInnerHTML={{ __html: passage.text || '' }} />
          </Column>
        ) : null}

        <Column>
          {passage.type === 'listening' && passage.audioUrl ? (
            <audio controls src={passage.audioUrl} style={{ width: '100%', marginBottom: 24 }} />
          ) : null}

          {loading ? <p>Loading preview...</p> : null}
          {error ? <p style={{ color: '#ef4444' }}>{error}</p> : null}
          {!loading && !error && !questions.length ? (
            <EmptyState>No questions available for preview.</EmptyState>
          ) : null}

          {!loading && !error
            ? questions.map((question) => {
                const correct = isCorrectAnswer(question, answers[question.id])
                return (
                  <QuestionCard key={question.id}>
                    <QuestionText>
                      <strong>#{question.questionNumber}</strong>
                      {' '}
                      {question.type === 'note_completion'
                        ? 'Note Completion'
                        : question.question}
                    </QuestionText>

                    {renderQuestionInputs(question)}

                    {submitted ? (
                      <>
                        <ResultText success={correct}>
                          Student&apos;s answer:
                          {' '}
                          {formatStudentAnswer(question, answers[question.id])}
                          {' | '}
                          Correct answer:
                          {' '}
                          {formatCorrectAnswer(question)}
                        </ResultText>
                        {question.explanation ? (
                          <Explanation>{question.explanation}</Explanation>
                        ) : null}
                      </>
                    ) : null}
                  </QuestionCard>
                )
              })
            : null}

          {questions.length > 0 ? (
            <Footer>
              <Button onClick={() => setSubmitted(true)}>Submit Answers</Button>
            </Footer>
          ) : null}

          {submitted ? (
            <ScoreBox>
              You got {score} out of {questions.length} correct
            </ScoreBox>
          ) : null}
        </Column>
      </Body>
    </Overlay>
  )
}

export default PreviewModal
