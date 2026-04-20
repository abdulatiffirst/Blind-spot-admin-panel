import styled, { css } from 'styled-components'

const noticeStyles = {
  error: css`
    color: ${({ theme }) => theme.colors.danger};
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.2);
  `,
  info: css`
    color: ${({ theme }) => theme.colors.primary};
    background: rgba(37, 99, 235, 0.08);
    border-color: rgba(37, 99, 235, 0.2);
  `,
}

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
`

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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

export const Notice = styled.div`
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius};
  font-size: 14px;
  ${({ variant = 'info' }) => noticeStyles[variant] || noticeStyles.info}
`

export const HelperText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`
