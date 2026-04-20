import styled from 'styled-components'

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
`

export const Select = styled.select`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 10px 12px;
  background: #fff;
`

export const Textarea = styled.textarea`
  min-height: 110px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 10px 12px;
  resize: vertical;
`

export const Notice = styled.div`
  padding: 12px 14px;
  color: ${({ theme }) => theme.colors.danger};
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: ${({ theme }) => theme.radius};
  font-size: 14px;
`

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`
