import styled from 'styled-components'

export const Wrap = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: #fff;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
`

export const Tag = styled.span`
  background: #e2e8f0;
  border-radius: 16px;
  padding: 4px 8px;
  display: inline-flex;
  gap: 6px;
  align-items: center;
`

export const Remove = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
`

export const InputField = styled.input`
  border: none;
  outline: none;
  min-width: 120px;
  background: transparent;
`
