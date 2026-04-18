import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const Label = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`

export const Field = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius};
  outline: none;
`

export const Error = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 12px;
`
