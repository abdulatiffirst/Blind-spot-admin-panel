import styled from 'styled-components'

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`

export const ErrorText = styled.p`
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.danger};
`
