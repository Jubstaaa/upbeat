import { react } from '@jubstaa/config/eslint/react'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    ...react({ tsconfigRootDir: import.meta.dirname }),
    {
        files: ['src/components/ui/**'],
        rules: { 'react-refresh/only-export-components': 'off' },
    },
])
