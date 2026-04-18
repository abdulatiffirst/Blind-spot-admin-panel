import styled from 'styled-components'
export const Form = styled.form`display:flex;flex-direction:column;gap:12px;`
export const Select = styled.select`border:1px solid ${({ theme }) => theme.colors.border};border-radius:${({ theme }) => theme.radius};padding:10px;`
export const Actions = styled.div`display:flex;justify-content:flex-end;gap:8px;`
