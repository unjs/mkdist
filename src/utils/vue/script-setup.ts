import type { ExpressionStatement, CallExpression, Expression, Node } from "@babel/types";
import type { extractRuntimeEmits, extractRuntimeProps, resolveTypeElements, SFCScriptBlock, SimpleTypeResolveContext } from "vue/compiler-sfc";
import type { SFCDescriptor } from "vue/compiler-sfc";

interface Context {
  ctx: SimpleTypeResolveContext
  utils: {
    extractRuntimeProps: typeof extractRuntimeProps
    extractRuntimeEmits: typeof extractRuntimeEmits
    resolveTypeElements: typeof resolveTypeElements
    MagicString: typeof import('vue/compiler-sfc').MagicString
    babel: {
      parse: typeof import('@babel/parser').parse
      generate: typeof import('@babel/generator').default
    }
  }
}

const DEFINE_EMITS = 'defineEmits'
const DEFINE_PROPS = 'defineProps'
const WITH_DEFAULTS = 'withDefaults'

/**
 * Pre-transpile script setup block to remove type syntax and replace it with runtime declarations.
 * This function only performs minimal error checking, it means that it will preserve all errors that can be triggered at runtime
 */
export async function preTranspileScriptSetup(
  sfc: SFCDescriptor,
  id: string,
): Promise<SFCScriptBlock> {
  const { scriptSetup } = sfc

  const context = await prepareContext(sfc, id)
  const resultBuilder = new context.utils.MagicString(scriptSetup.content)

  for (const node of context.ctx.ast) {
    if (node.type === 'ExpressionStatement') {
      const processedTypeSyntax =
        processDefineProps(node.expression, context) ||
        processDefineEmits(node.expression, context) ||
        processWithDefaults(node.expression, context)

      if (processedTypeSyntax !== undefined) {
        resultBuilder.overwrite(node.start!, node.end!, processedTypeSyntax)
      }
    }

    if (node.type === 'VariableDeclaration' && !node.declare) {
      const total = node.declarations.length
      for (let i = 0; i < total; i += 1) {
        const decl = node.declarations[i]
        if (!decl.init) {
          continue
        }

        const processedTypeSyntax =
          processDefineProps(decl.init, context) ||
          processDefineEmits(decl.init, context) ||
          processWithDefaults(decl.init, context)

        if (processedTypeSyntax !== undefined) {
          resultBuilder.overwrite(decl.init.start!, decl.init.end!, processedTypeSyntax)
        }
      }
    }
  }

  return {
    ...scriptSetup,
    content: resultBuilder.toString(),
  }
}

function processDefineProps(node: Expression, context: Context): string | undefined {
  if (!isCallOf(node, DEFINE_PROPS)) {
    return undefined
  }

  const propsRuntimeDecl = node.arguments[0]
  if (!node.typeParameters) {
    return
  }
  if (propsRuntimeDecl) {
    throw new Error(
      `${DEFINE_PROPS}() cannot accept both type and non-type arguments ` +
      `at the same time. Use one or the other.`,
    )
  }

  const propsTypeDecl = node.typeParameters.params[0]
  if (!propsTypeDecl) {
    return
  }

  context.ctx.propsTypeDecl = propsTypeDecl
  const propsStr = context.utils.extractRuntimeProps(context.ctx)
  const propsAst = context.utils.babel.parse(`${DEFINE_PROPS}(${propsStr})`, {
    sourceType: 'module',
    plugins: ['typescript']
  })

  node.typeArguments = undefined
  node.typeParameters = undefined
  node.arguments = ((propsAst.program.body[0] as ExpressionStatement).expression as CallExpression).arguments

  return context.utils.babel.generate(node).code
}
function processDefineEmits(node: Expression, context: Context): string | undefined {
  if (!isCallOf(node, DEFINE_EMITS)) {
    return
  }

  const emitsRuntimeDecl = node.arguments[0]
  if (!node.typeParameters) {
    return
  }
  if (emitsRuntimeDecl) {
    throw new Error(
      `${DEFINE_EMITS}() cannot accept both type and non-type arguments ` +
      `at the same time. Use one or the other.`,
    )
  }

  const emitsTypeDecl = node.typeParameters.params[0]
  if (!emitsTypeDecl) {
    return
  }

  context.ctx.emitsTypeDecl = emitsTypeDecl
  const emits = context.utils.extractRuntimeEmits(context.ctx)

  node.typeArguments = undefined
  node.typeParameters = undefined
  node.arguments[0] = {
    type: 'ArrayExpression',
    elements: [...emits].map(emit => ({
      type: 'StringLiteral',
      value: emit
    }))
  }

  return context.utils.babel.generate(node).code
}
function processWithDefaults(node: Expression, context: Context): string | undefined {
  if (!isCallOf(node, WITH_DEFAULTS)) {
    return undefined
  }

  context.ctx.propsRuntimeDefaults = node.arguments[1]
  const res = processDefineProps(node.arguments[0] as Expression, context)
  if (!res) {
    context.ctx.error(
      `${WITH_DEFAULTS}' first argument must be a ${DEFINE_PROPS} call.`,
      node.arguments[0] || node,
    )
  }

  if (!context.ctx.propsTypeDecl) {
    context.ctx.error(
      `${WITH_DEFAULTS} can only be used with type-based ` +
      `${DEFINE_PROPS} declaration.`,
      node
    )
  }
  if (!context.ctx.propsRuntimeDefaults) {
    context.ctx.error(`The 2nd argument of ${WITH_DEFAULTS} is required.`, node)
  }

  return res
}

async function prepareContext({ script, scriptSetup }: SFCDescriptor, id: string): Promise<Context> {
  const { extractRuntimeProps, extractRuntimeEmits, resolveTypeElements, MagicString } = await import('vue/compiler-sfc')
  const { parse } = await import('@babel/parser')
  const generate = await import('@babel/generator').then(m => m.default || m) as typeof import('@babel/generator').default

  const helper = new Set<string>()
  const ast = parse(`${scriptSetup.content}\n${script?.content}`, {
    sourceType: 'module',
    plugins: ['tsx', 'jsx'].includes(scriptSetup.lang) ? ['typescript', 'jsx'] : ['typescript'],
  })

  const ctx = {
    filename: id,
    source: scriptSetup.content,
    ast: ast.program.body,
    error: (msg) => {
      throw new Error(`[mkdist/vue-loader] ${msg}`)
    },
    helper: (key) => {
      helper.add(key)
      return `_${key}`
    },
    getString: (node) => {
      return scriptSetup.content.slice(node.start!, node.end!)
    },
    propsTypeDecl: undefined,
    propsRuntimeDefaults: undefined,
    propsDestructuredBindings: Object.create(null),
    emitsTypeDecl: undefined,
    isCE: false,
    options: {}
  } satisfies SimpleTypeResolveContext

  return {
    ctx,
    utils: {
      MagicString,
      extractRuntimeProps,
      extractRuntimeEmits,
      resolveTypeElements,
      babel: {
        parse,
        generate
      }
    }
  }
}

function isCallOf(
  node: Node | undefined | undefined,
  test: string | ((id: string) => boolean)
): node is CallExpression {
  return !!(
    node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    (typeof test === 'string'
      ? node.callee.name === test
      : test(node.callee.name))
  )
}
