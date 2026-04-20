import styled, { css } from 'styled-components'

const variantMap = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  `,
  secondary: css`
    background: #fff;
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
    &:hover { background: #f3f4f6; }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.danger};
    color: #fff;
    &:hover { background: ${({ theme }) => theme.colors.dangerHover}; }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};
    &:hover { background: #f3f4f6; color: ${({ theme }) => theme.colors.text}; }
  `,
}

const sizeMap = {
  sm: css`padding: 6px 10px; font-size: 12px;`,
  md: css`padding: 10px 14px; font-size: 14px;`,
  lg: css`padding: 12px 16px; font-size: 16px;`,
}

export const StyledButton = styled.button`
  border: none;
  border-radius: ${({ theme }) => theme.radius};
  cursor: pointer;
  transition: all .2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  ${({ variant = 'primary' }) => variantMap[variant]}
  ${({ size = 'md' }) => sizeMap[size]}
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`
