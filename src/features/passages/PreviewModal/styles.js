import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: #fff;
  z-index: 1001;
`

export const Header = styled.div`
  height: 64px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
`

export const Body = styled.div`
  height: calc(100vh - 64px);
  display: grid;
  grid-template-columns: ${({ twoCol }) => (twoCol ? '1fr 1fr' : '1fr')};
`

export const Column = styled.div`
  overflow-y: auto;
  padding: 20px;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
`
