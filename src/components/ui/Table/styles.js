import styled from 'styled-components'

export const Wrap = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  overflow: auto;
`

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    text-align: left;
    padding: 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    font-size: 14px;
  }
  tbody tr:hover { background: #f8fafc; }
`
