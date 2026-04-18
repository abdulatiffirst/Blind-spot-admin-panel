import styled from 'styled-components'

export const Wrap = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.background};
`

export const Card = styled.div`
  width: 400px;
  max-width: 95vw;
  background: #fff;
  border-radius: ${({ theme }) => theme.radius};
  box-shadow: ${({ theme }) => theme.shadowMd};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

export const Error = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
`
