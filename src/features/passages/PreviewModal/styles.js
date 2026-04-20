import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: #fff;
  z-index: 1100;
  display: flex;
  flex-direction: column;
`

export const Header = styled.div`
  height: 72px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  flex-shrink: 0;
`

export const Body = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: ${({ twoColumn }) => (twoColumn ? '1fr 1fr' : '1fr')};
  min-height: 0;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`

export const Column = styled.div`
  overflow-y: auto;
  padding: 24px;
  border-right: ${({ withDivider, theme }) =>
    withDivider ? `1px solid ${theme.colors.border}` : 'none'};
`

export const QuestionCard = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
  margin-bottom: 16px;
`

export const QuestionText = styled.p`
  margin: 0 0 12px;
  line-height: 1.6;
`

export const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const OptionLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.5;
`

export const NotePreview = styled.p`
  margin: 0 0 12px;
  line-height: 1.8;
  white-space: pre-wrap;
`

export const Blank = styled.span`
  display: inline-block;
  min-width: 80px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.text};
  margin: 0 4px;
  text-align: center;
`

export const AnswerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export const AnswerField = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 10px 12px;
  width: 100%;
`

export const ScoreBox = styled.div`
  margin: 24px 0 0;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radius};
  background: rgba(37, 99, 235, 0.08);
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`

export const ResultText = styled.p`
  margin: 12px 0 0;
  color: ${({ success, theme }) =>
    success ? theme.colors.success : theme.colors.danger};
  font-weight: 600;
`

export const Explanation = styled.p`
  margin: 10px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`

export const EmptyState = styled.div`
  padding: 32px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Footer = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
`
