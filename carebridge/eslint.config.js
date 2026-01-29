import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**']
  }
]