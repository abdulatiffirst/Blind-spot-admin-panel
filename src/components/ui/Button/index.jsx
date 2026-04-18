import { StyledButton } from './styles'

const Button = ({ variant = 'primary', size = 'md', children, ...props }) => {
  return (
    <StyledButton variant={variant} size={size} {...props}>
      {children}
    </StyledButton>
  )
}

export default Button
