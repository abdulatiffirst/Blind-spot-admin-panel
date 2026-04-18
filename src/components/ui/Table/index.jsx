import { StyledTable, Wrap } from './styles'

const Table = ({ columns, data, actions }) => {
  return (
    <Wrap>
      <StyledTable>
        <thead>
          <tr>
            {columns.map((col) => <th key={col.key}>{col.label}</th>)}
            {actions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => <td key={col.key}>{row[col.key]}</td>)}
              {actions ? <td>{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </Wrap>
  )
}

export default Table
