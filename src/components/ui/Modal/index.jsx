import { Body, CloseButton, Container, Header, Overlay } from './styles'

const Modal = ({ isOpen, onClose, title, children, width = '600px' }) => {
  if (!isOpen) return null
  return (
    <Overlay onClick={onClose}>
      <Container width={width} onClick={(e) => e.stopPropagation()}>
        <Header>
          <strong>{title}</strong>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>
        <Body>{children}</Body>
      </Container>
    </Overlay>
  )
}

export default Modal
