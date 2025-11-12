'use client'

import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'
import { FieldContent, FieldDescription, FieldLabel } from '../field'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip'
import { useIdTitle } from './hooks'
import type { FormComponentProps, Prettify, StoreFieldPropsCommon } from './types'

type FieldContentProps<T, Form = false> = Prettify<
  Pick<
    StoreFieldPropsCommon<T, Form>,
    'state' | 'id' | 'title' | 'description' | 'descriptionVariant'
  > &
    FormComponentProps<typeof FieldLabel>
>

function StoreFieldContent<T, Form = false>({
  state,
  id,
  title,
  description,
  descriptionVariant = 'inline',
  className,
  ...labelProps
}: FieldContentProps<T, Form>) {
  const { fieldId, fieldTitle } = useIdTitle({ state, id, title })

  return (
    <FieldContent className="flex-none">
      <FieldLabel htmlFor={fieldId} className={cn('text-xs', className)} {...labelProps}>
        {fieldTitle}
        {descriptionVariant === 'tooltip' && description && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-4 m-0.5 ml-auto" />
            </TooltipTrigger>
            <TooltipContent>{description}</TooltipContent>
          </Tooltip>
        )}
      </FieldLabel>
      {descriptionVariant === 'inline' && description && (
        <FieldDescription>{description}</FieldDescription>
      )}
    </FieldContent>
  )
}

export { StoreFieldContent, type FieldContentProps }
