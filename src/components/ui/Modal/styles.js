import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

export const Container = styled.div`
  width: ${({ width = '600px' }) => width};
  max-width: 95vw;
  background: #fff;
  border-radius: ${({ theme }) => theme.radius};
  box-shadow: ${({ theme }) => theme.shadowMd};
  overflow: hidden;
`

export const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const Body = styled.div`
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
`

export const CloseButton = styled.button`
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
`
