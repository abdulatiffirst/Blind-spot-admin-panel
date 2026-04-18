import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import { deleteStudent, getStudents } from '../../../firebase/firestore'
import { Wrap } from './styles'

const fmt = (v) => {
  if (!v) return '-'
  const d = v.toDate ? v.toDate() : new Date(v)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const StudentList = () => {
  const [students, setStudents] = useState([])
  const load = async () => setStudents(await getStudents())
  useEffect(() => { load() }, [])
  return (
    <Wrap>
      <h1 style={{ margin: 0 }}>Students</h1>
      <Table
        columns={[
          { key: 'email', label: 'Email' },
          { key: 'registered', label: 'Registered Date' },
        ]}
        data={students.map((s) => ({ ...s, registered: fmt(s.createdAt) }))}
        actions={(row) => (
          <Button size="sm" variant="danger" onClick={async () => {
            if (!window.confirm('Delete this student?')) return
            await deleteStudent(row.id)
            await load()
          }}>
            Delete
          </Button>
        )}
      />
    </Wrap>
  )
}

export default StudentList
