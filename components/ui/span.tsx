import type { ResourceKey } from '@/types/i18n'
import type { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'

type HTMLTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'code'

type SpanProps<T extends HTMLTag = 'span'> = {
  tKey: ResourceKey
  as?: T
  values?: Record<string, string | number>
} & Omit<ComponentProps<T>, 'children'>

export default function Span<T extends HTMLTag = 'span'>({
  tKey,
  as = 'span' as T,
  values,
  ...props
}: SpanProps<T>) {
  const { t } = useTranslation()

  switch (as) {
    case 'span':
      return <span {...(props as ComponentProps<'span'>)}>{t(tKey, values)}</span>
    case 'div':
      return <div {...(props as ComponentProps<'div'>)}>{t(tKey, values)}</div>
    case 'p':
      return <p {...(props as ComponentProps<'p'>)}>{t(tKey, values)}</p>
    case 'h1':
      return <h1 {...(props as ComponentProps<'h1'>)}>{t(tKey, values)}</h1>
    case 'h2':
      return <h2 {...(props as ComponentProps<'h2'>)}>{t(tKey, values)}</h2>
    case 'h3':
      return <h3 {...(props as ComponentProps<'h3'>)}>{t(tKey, values)}</h3>
    case 'h4':
      return <h4 {...(props as ComponentProps<'h4'>)}>{t(tKey, values)}</h4>
    case 'h5':
      return <h5 {...(props as ComponentProps<'h5'>)}>{t(tKey, values)}</h5>
    case 'h6':
      return <h6 {...(props as ComponentProps<'h6'>)}>{t(tKey, values)}</h6>
    case 'code':
      return <code {...(props as ComponentProps<'code'>)}>{t(tKey, values)}</code>
    default:
      return <span {...(props as ComponentProps<'span'>)}>{t(tKey, values)}</span>
  }
}
