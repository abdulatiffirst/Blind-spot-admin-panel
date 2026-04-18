import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

export const Wrap = styled.aside`
  width: 220px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  background: #fff;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

export const Brand = styled.h2`
  margin: 0 8px 12px;
  font-size: 20px;
`

export const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const LinkItem = styled(NavLink)`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme }) => theme.colors.text};
  &.active {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
`
