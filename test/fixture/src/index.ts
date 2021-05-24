import bar from './bar'

const foo: string = 'foo'

export const importFoo = () => import('path')

export default () => foo + bar
