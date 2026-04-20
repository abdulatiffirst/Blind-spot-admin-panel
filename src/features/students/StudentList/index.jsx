import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import { deleteStudent, getStudents } from '../../../firebase/firestore'
import { ErrorText, Header, Wrap } from './styles'

const formatDate = (value) => {
  if (!value) return '-'
  const date = value.toDate ? value.toDate() : new Date(value)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const StudentList = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const nextStudents = await getStudents()
      setStudents(nextStudents)
    } catch (err) {
      setStudents([])
      setError(err.message || 'Failed to load students.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleDelete = async (studentId) => {
    const confirmed = window.confirm('Delete this student?')
    if (!confirmed) return

    try {
      await deleteStudent(studentId)
      await load()
      window.alert('Student deleted successfully.')
    } catch (err) {
      setError(err.message || 'Failed to delete student.')
    }
  }

  return (
    <Wrap>
      <Header>
        <h1 style={{ margin: 0 }}>Students</h1>
      </Header>

      {error ? <ErrorText>{error}</ErrorText> : null}

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <Table
          columns={[
            { key: 'email', label: 'Email' },
            { key: 'registeredDate', label: 'Registered Date' },
          ]}
          data={students.map((student) => ({
            ...student,
            registeredDate: formatDate(student.createdAt),
          }))}
          emptyMessage="No students found."
          actions={(row) => (
            <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
              Delete
            </Button>
          )}
        />
      )}
    </Wrap>
  )
}

export default StudentList
