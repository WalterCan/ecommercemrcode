import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

import fs from 'fs';

// Helper to resolve and check path
const resolvePath = (relativePath) => {
    const p = path.resolve(process.cwd(), relativePath);
    if (!fs.existsSync(p)) {
        throw new Error(`CRITICAL: File not found at ${p}. CWD is ${process.cwd()}`);
    }
    // Normalize for Windows
    return p.replace(/\\/g, '/');
};

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
        css: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@testing-library/react': resolvePath('./node_modules/@testing-library/react/pure.js'),
            '@testing-library/jest-dom': resolvePath('./node_modules/@testing-library/jest-dom/dist/vitest.mjs'),
            '@testing-library/jest-dom/matchers': resolvePath('./node_modules/@testing-library/jest-dom/dist/matchers.mjs'),
            'test-cleanup': resolvePath('./node_modules/@testing-library/react/pure.js'),
            'test-matchers': resolvePath('./node_modules/@testing-library/jest-dom/dist/matchers.mjs'),
        },
    },
})
