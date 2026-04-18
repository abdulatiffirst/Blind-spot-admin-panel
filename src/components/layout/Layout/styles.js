import styled from 'styled-components'

export const Wrap = styled.div`
  display: flex;
`

export const Main = styled.main`
  margin-left: 220px;
  flex: 1;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding: 32px;
`
