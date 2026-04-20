import { useState } from 'react'
import { InputField, Remove, Tag, Wrap } from './styles'

const TagInput = ({ value = [], onChange, disabled = false, placeholder = 'Add tag' }) => {
  const [text, setText] = useState('')

  const addTag = () => {
    if (disabled) return

    const tag = text.trim()
    if (!tag || value.includes(tag)) return

    onChange([...value, tag])
    setText('')
  }

  return (
    <Wrap disabled={disabled}>
      {value.map((tag) => (
        <Tag key={tag}>
          {tag}
          <Remove
            type="button"
            disabled={disabled}
            onClick={() => onChange(value.filter((item) => item !== tag))}
          >
            x
          </Remove>
        </Tag>
      ))}
      <InputField
        disabled={disabled}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (disabled) return

          if (event.key === 'Enter') {
            event.preventDefault()
            addTag()
          }
        }}
        placeholder={placeholder}
      />
    </Wrap>
  )
}

export default TagInput
