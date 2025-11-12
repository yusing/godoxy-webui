'use client'

import { CodeMirror } from '@/components/ObjectDataList'
import { useMemo } from 'react'
import { Field, FieldDescription } from '../field'
import { StoreLabel } from './Label'
import type { FormComponentProps, Prettify, StoreFieldPropsCommon } from './types'

type CodeMirrorFieldProps<Form = false> = Prettify<
  StoreFieldPropsCommon<string, Form> & FormComponentProps<typeof CodeMirror>
>

function StoreCodeMirrorField({
  state,
  id,
  title,
  description,
  descriptionVariant = 'inline',
  labelProps,
  ...props
}: CodeMirrorFieldProps) {
  const [value, setValue] = state.useState()
  const fieldId = useMemo(() => id ?? state.field, [id, state.field])
  return (
    <Field>
      <StoreLabel
        state={state}
        id={id}
        title={title}
        description={description}
        descriptionVariant={descriptionVariant}
        {...labelProps}
      />
      {descriptionVariant === 'inline' && description && (
        <FieldDescription>{description}</FieldDescription>
      )}
      <CodeMirror id={fieldId} value={value ?? ''} setValue={setValue} {...props} />
    </Field>
  )
}

export { StoreCodeMirrorField }
