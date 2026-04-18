import { useState } from 'react'
import { InputField, Remove, Tag, Wrap } from './styles'

const TagInput = ({ value = [], onChange }) => {
  const [text, setText] = useState('')
  const addTag = () => {
    const tag = text.trim()
    if (!tag || value.includes(tag)) return
    onChange([...value, tag])
    setText('')
  }
  return (
    <Wrap>
      {value.map((tag) => (
        <Tag key={tag}>
          {tag}
          <Remove onClick={() => onChange(value.filter((t) => t !== tag))}>×</Remove>
        </Tag>
      ))}
      <InputField
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
          }
        }}
        placeholder="Add tag"
      />
    </Wrap>
  )
}

export default TagInput
