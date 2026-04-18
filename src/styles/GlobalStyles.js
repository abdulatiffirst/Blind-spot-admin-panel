import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font: inherit; }
`

export default GlobalStyles
