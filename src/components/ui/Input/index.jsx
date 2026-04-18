import { Error, Field, Label, Wrapper } from './styles'

const Input = ({ label, error, ...props }) => {
  return (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <Field {...props} />
      {error ? <Error>{error}</Error> : null}
    </Wrapper>
  )
}

export default Input
