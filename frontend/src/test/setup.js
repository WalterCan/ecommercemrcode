import { expect, afterEach } from 'vitest'
import { cleanup } from 'test-cleanup'
import * as matchers from 'test-matchers'

expect.extend(matchers)

afterEach(() => {
    cleanup()
})
