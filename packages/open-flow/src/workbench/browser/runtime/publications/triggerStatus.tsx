import type { TFunction } from 'val-i18n'
import type { TriggerBinding } from '../api.ts'

import { useTranslate } from 'val-i18n-react'

export function triggerLabel(binding: TriggerBinding, enabled: boolean, t: TFunction): string {
  if (binding.currentPublicationId == null) return t('publication.retired')
  if (!enabled) return t('publication.suspended')
  if (binding.listener?.health == 'healthy' && (binding.health == 'failed' || binding.health == 'needs_reauth')) return t('publication.listenerDegraded')
  switch (binding.listener?.health == 'failed' || binding.listener?.health == 'needs_reauth' ? binding.listener.health : binding.health) {
    case 'healthy':
      return t('publication.active')
    case 'failed':
      return t('publication.failed')
    case 'needs_reauth':
      return t('publication.needsReauth')
    case 'initializing':
      return t('publication.reconciling')
    case 'suspended':
      return t('publication.suspended')
  }
}

export function triggerClass(binding: TriggerBinding, enabled: boolean): string {
  if (binding.currentPublicationId == null || !enabled) return 'neutral'
  if (binding.listener?.health == 'healthy' && (binding.health == 'failed' || binding.health == 'needs_reauth')) return 'running'
  switch (binding.listener?.health == 'failed' || binding.listener?.health == 'needs_reauth' ? binding.listener.health : binding.health) {
    case 'healthy':
      return 'success'
    case 'failed':
    case 'needs_reauth':
      return 'danger'
    case 'initializing':
      return 'running'
    case 'suspended':
      return 'neutral'
  }
}

export function TriggerStatus({ binding, enabled }: { readonly binding: TriggerBinding; readonly enabled: boolean }) {
  const t = useTranslate()
  return <span className={'trigger-binding-state ' + triggerClass(binding, enabled)}>{triggerLabel(binding, enabled, t)}</span>
}

export function ListenerHealth({ binding, enabled }: { readonly binding: TriggerBinding; readonly enabled: boolean }) {
  const t = useTranslate()
  if (binding.listener == null || binding.currentPublicationId == null || !enabled) return null
  return (
    <p className="trigger-recovery">
      {t(
        binding.listener.health == 'healthy'
          ? 'publication.listenerScanning'
          : binding.listener.health == 'needs_reauth'
            ? 'publication.needsReauthDescription'
            : 'publication.listenerScanFailed',
      )}
      {binding.listener.lastErrorCode == null ? '' : ` (${binding.listener.lastErrorCode})`}
    </p>
  )
}
