import styled, { css } from 'styled-components'

const noticeStyles = {
  error: css`
    color: ${({ theme }) => theme.colors.danger};
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.2);
  `,
  success: css`
    color: ${({ theme }) => theme.colors.success};
    background: rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.2);
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
  gap: 18px;
`

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
`

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`

export const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const SelectField = styled.select`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 10px 12px;
  background: #fff;
`

export const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: none;
  border-radius: ${({ theme }) => theme.radius} ${({ theme }) => theme.radius} 0 0;
  background: #f8fafc;
`

export const EditorShell = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  overflow: hidden;
  background: #fff;
`

export const EditorArea = styled.div`
  min-height: 300px;
  padding: 16px;

  .ProseMirror {
    min-height: 300px;
    outline: none;
  }

  .ProseMirror p,
  .ProseMirror h2,
  .ProseMirror h3 {
    margin: 0 0 12px;
  }

  .ProseMirror ul {
    margin: 0 0 12px 20px;
  }
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

export const AudioPlayer = styled.audio`
  width: 100%;
`

export const FileName = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: #e5e7eb;
`

export const ProgressFill = styled.div`
  height: 100%;
  width: ${({ value }) => `${value}%`};
  background: ${({ theme }) => theme.colors.primary};
  transition: width 0.2s ease;
`

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`

export const QuestionActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`
