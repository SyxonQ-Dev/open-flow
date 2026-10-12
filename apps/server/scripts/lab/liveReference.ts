import type { LiveDetails } from '@oomol-lab/open-flow/control-api'
import type { ToolCall } from './driver.ts'

import { randomUUID } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'

/** All discovery and editing goes through caller-visible CLI commands. */
export async function referenceLive(call: ToolCall, flowId: string) {
  const before = await call('flow_read', { flowId })
  const saved = await call('flow_edit', {
    flowId,
    baseRevision: before.revision,
    requestId: randomUUID(),
    edits: [
      {
        op: 'node.add',
        as: 'hook',
        type: 'webhook',
        name: 'Published hook',
        config: { method: 'POST', body: { message: { schema: { type: 'string' }, nullable: false } } },
      },
      {
        op: 'node.add',
        as: 'echo',
        type: 'code',
        name: 'Echo',
        config: { outputs: { message: { schema: { type: 'string' }, nullable: false } } },
        inputs: { body: { kind: 'output', node: '$hook', port: 'body' } },
        code: 'export default ({body}) => ({message: body.message})',
      },
      { op: 'edge.connect', source: '$hook', target: '$echo' },
    ],
  })
  const published = await call('flow_publish', { flowId, revisionId: saved.revision, idempotencyKey: randomUUID() })
  if (published.warnings != null) throw new Error(`Unexpected publication warnings: ${JSON.stringify(published.warnings)}`)
  const live = published.live as LiveDetails
  const hook = live.entries.find((entry) => entry.type == 'webhook')
  if (hook?.type != 'webhook' || !hook.binding.endpointUrl || hook.config.method != 'POST' || !hook.config.body.message)
    throw new Error('Publish did not expose the Webhook contract')
  const queried = await call('flow_live', { flowId })
  if (!isDeepStrictEqual(queried.live, live)) throw new Error('Publish and live disagree')
  await call('flow_edit', {
    flowId,
    baseRevision: saved.revision,
    requestId: randomUUID(),
    edits: [{ op: 'node.update', node: hook.nodeId, set: { name: 'Draft hook', config: { method: 'PUT' } } }],
  })
  const after = await call('flow_live', { flowId })
  if (!isDeepStrictEqual(after.live, live)) throw new Error('Draft edit changed online entries')
}
