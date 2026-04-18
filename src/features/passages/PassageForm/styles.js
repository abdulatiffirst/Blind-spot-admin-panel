import styled from 'styled-components'

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`

export const Field = styled.select`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 10px 12px;
`

export const Textarea = styled.textarea`
  min-height: 120px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 10px 12px;
`

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`
