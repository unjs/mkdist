import type {
  ParentNode,
  ExpressionNode,
  TemplateChildNode,
  AttributeNode,
  DirectiveNode,
  SourceLocation,
  RootNode,
} from "@vue/compiler-dom-types";

// copy from `@vue/compiler-dom`
enum NodeTypes {
  ROOT,
  ELEMENT,
  TEXT,
  COMMENT,
  SIMPLE_EXPRESSION,
  INTERPOLATION,
  ATTRIBUTE,
  DIRECTIVE,

  // containers
  COMPOUND_EXPRESSION,
  IF,
  IF_BRANCH,
  FOR,
  TEXT_CALL,

  // codegen
  VNODE_CALL,
  JS_CALL_EXPRESSION,
  JS_OBJECT_EXPRESSION,
  JS_PROPERTY,
  JS_ARRAY_EXPRESSION,
  JS_FUNCTION_EXPRESSION,
  JS_CONDITIONAL_EXPRESSION,
  JS_CACHE_EXPRESSION,

  // ssr codegen
  JS_BLOCK_STATEMENT,
  JS_TEMPLATE_LITERAL,
  JS_IF_STATEMENT,
  JS_ASSIGNMENT_EXPRESSION,
  JS_SEQUENCE_EXPRESSION,
  JS_RETURN_STATEMENT,
}

interface Expression {
  loc: SourceLocation;
  src: string;
  replacement?: string;
}

function handleNode(
  node:
    | ParentNode
    | ExpressionNode
    | TemplateChildNode
    | AttributeNode
    | DirectiveNode
    | undefined,
  addExpression: (...expressions: Expression[]) => void,
) {
  if (!node) {
    return;
  }

  const search = (
    node: ExpressionNode | TemplateChildNode | AttributeNode | DirectiveNode,
  ) => handleNode(node, addExpression);

  switch (node.type) {
    case NodeTypes.ROOT: {
      for (const child of node.children) {
        search(child);
      }
      return;
    }
    case NodeTypes.ELEMENT: {
      const nodes = [...node.children, ...node.props];
      for (const child of nodes) {
        search(child);
      }
      return;
    }
    case NodeTypes.TEXT: {
      return;
    }
    case NodeTypes.COMMENT: {
      return;
    }
    case NodeTypes.SIMPLE_EXPRESSION: {
      if (node.ast === null || node.ast === false) {
        return;
      }
      addExpression({ loc: node.loc, src: node.content });
      return;
    }
    case NodeTypes.INTERPOLATION: {
      search(node.content);
      return;
    }
    case NodeTypes.ATTRIBUTE: {
      search(node.value);
      return;
    }
    case NodeTypes.DIRECTIVE: {
      const nodes = [
        node.exp,
        // node.arg,
        // node.forParseResult?.source,
        // node.forParseResult?.value,
        // node.forParseResult?.key,
        // node.forParseResult?.index,
        ...node.modifiers,
      ].filter((item) => !!item);
      for (const child of nodes) {
        search(child);
      }
      return;
    }
    case NodeTypes.COMPOUND_EXPRESSION: {
      if (!node.ast) {
        return;
      }

      addExpression({ loc: node.loc, src: node.loc.source });
      return;
    }
    // case NodeTypes.IF:
    // case NodeTypes.FOR:
    // case NodeTypes.TEXT_CALL:
    default: {
      throw new Error(`Unexpected node type: ${node.type}`);
    }
  }
}

export async function transpileVueTemplate(
  content: string,
  root: RootNode,
  offset = 0,
  transform: (code: string) => Promise<string>,
): Promise<string> {
  const { MagicString } = await import("vue/compiler-sfc");
  const expressions: Expression[] = [];

  const s = new MagicString(content);

  handleNode(root, (...items) => expressions.push(...items));
  await Promise.all(
    expressions.map(async (item) => {
      if (item.src.trim() === "") {
        item.replacement = item.src;
        return;
      }

      try {
        item.replacement = await transformJsSnippet(item.src, transform);

        const surrounding = getSurrounding(
          content,
          item.loc.start.offset - offset,
          item.loc.end.offset - offset,
        );
        if (surrounding) {
          const replace = surrounding.code === `"` ? `'` : `"`;
          item.replacement = replaceQuote(
            item.replacement,
            surrounding.code,
            replace,
          );
        }
      } catch {
        item.replacement = item.src;
      }
    }),
  );

  for (const item of expressions.filter((item) => !!item.replacement)) {
    s.overwrite(
      item.loc.start.offset - offset,
      item.loc.end.offset - offset,
      item.replacement,
    );
  }

  return s.toString();
}

function replaceQuote(code: string, target: string, replace: string): string {
  let res = code;

  if (res.includes(target)) {
    /**
     * Due to the way Vue parses templates,
     * the symbol of target would never appear in the code.
     * We just need to replace the symbol of target.
     *
     * But for replace symbol exist in code, we need to escape it,
     * because esbuild have removed the escape character.
     */
    res = res.replaceAll(replace, `\\${replace}`);
    res = res.replaceAll(target, replace);
  }

  return res;
}

function getSurrounding(code: string, start: number, end: number) {
  const empty = new Set([" ", "\n", "\r", "\t"]);
  let startIndex = start - 1;
  let endIndex = end;

  while (startIndex > 0 && empty.has(code.at(startIndex))) {
    startIndex--;
  }

  while (endIndex < code.length && empty.has(code.at(endIndex))) {
    endIndex++;
  }

  const prev = startIndex >= 0 ? code.at(startIndex) : "";
  const next = endIndex < code.length ? code.at(endIndex) : "";

  return prev && next && prev === next
    ? { code: prev, prevAt: startIndex, nextAt: endIndex }
    : undefined;
}

async function transformJsSnippet(
  code: string,
  transform: (code: string) => Promise<string>,
): Promise<string> {
  // `{ key: val } as any` in `<div :style="{ key: val } as any" />` is a valid js snippet,
  // but it can't be transformed.
  // We can warp it with `()` to make it a valid js file

  let res = await transform(`(${code})`);

  res = res.trim();

  // result will be wrapped in `{content};\n`, we need to remove it
  if (res.endsWith(";")) {
    res = res.slice(0, -1);
  }

  return res;
}
