import assert from 'assert'
import { cn } from '../src/lib/utils'

assert.strictEqual(cn('foo', 'bar'), 'foo bar')
console.log('smoke test passed')
