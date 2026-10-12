import { useEffect, useState } from 'react'
import { useTranslate } from 'val-i18n-react'
import { Button } from '../../../../ui/browser/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../../ui/browser/tooltip.tsx'

export function WebhookCopyButton({ endpointUrl, iconOnly = false }: { readonly endpointUrl: string; readonly iconOnly?: boolean }) {
  const t = useTranslate()
  const [copyResult, setCopyResult] = useState<'copied' | 'failed'>()
  const [container, setContainer] = useState<HTMLSpanElement | null>(null)
  useEffect(() => {
    if (copyResult !== 'copied') return
    const timer = globalThis.setTimeout(() => setCopyResult(undefined), 1_500)
    return () => globalThis.clearTimeout(timer)
  }, [copyResult])
  const label = t(copyResult === 'copied' ? 'publication.webhookCopied' : copyResult === 'failed' ? 'webhookDeployment.copyFailed' : 'publication.webhookCopy')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(endpointUrl)
      setCopyResult('copied')
    } catch {
      setCopyResult('failed')
    }
  }
  return (
    <span className="inline-flex shrink-0 flex-col gap-2" ref={setContainer}>
      {iconOnly ? (
        <Tooltip>
          <TooltipTrigger render={<Button aria-label={label} size="icon-sm" variant="ghost" onClick={copy} />}>
            <i aria-hidden="true" className={copyResult === 'copied' ? 'i-lucide-light:check text-base' : 'i-lucide-light:copy text-base'} />
          </TooltipTrigger>
          <TooltipContent container={container} side="bottom" align="end">
            {label}
          </TooltipContent>
        </Tooltip>
      ) : (
        <Button size="sm" variant="outline" onClick={copy}>
          {t(copyResult === 'copied' ? 'publication.webhookCopied' : 'publication.webhookCopy')}
        </Button>
      )}
      <span className={iconOnly || copyResult !== 'failed' ? 'sr-only' : 'text-xs text-destructive'} role="status">
        {copyResult == null ? '' : label}
      </span>
    </span>
  )
}

export function WebhookEndpoint({ endpointUrl }: { readonly endpointUrl: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <code className="min-w-0 flex-1 select-text break-all text-foreground text-xs leading-5">{endpointUrl}</code>
      <WebhookCopyButton key={endpointUrl} endpointUrl={endpointUrl} />
    </div>
  )
}
