'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'

import {
  TreeExpander,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from '@/components/ui/kibo-ui/tree'
import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

export type GoDoxyError = string | Record<string, unknown> | WithSubject | NestedError
type WithSubject = { subjects: string[]; err: GoDoxyError }
type NestedError = { err: string | WithSubject | null; extras: GoDoxyError[] }

type FlatRow = {
  key: string
  level: number
  inner?: boolean
  isHeader?: boolean
  groupKey?: string
  text?: string
  subjects?: string[]
  message?: string
}

function subjectsToLabel(subjects?: string[]): string {
  if (!subjects || subjects.length === 0) return ''
  return subjects.join('.') + ':'
}

// FIXME: fix this
// eslint-disable-next-line react-refresh/only-export-components
export function flattenGoDoxyError(
  input: GoDoxyError,
  level = 0,
  rows: FlatRow[] = [],
  currentGroup?: string
): FlatRow[] {
  if (typeof input === 'string') {
    rows.push({
      key: `line-${rows.length}`,
      level,
      inner: !!currentGroup,
      groupKey: currentGroup,
      text: input,
    })
    return rows
  }

  if (typeof input === 'object' && 'subjects' in input && Array.isArray(input.subjects)) {
    const subj = input as WithSubject
    if (!subj.err) {
      rows.push({
        key: `subj-${rows.length}`,
        level,
        inner: !!currentGroup,
        groupKey: currentGroup,
        subjects: subj.subjects,
        message: undefined,
      })
      return rows
    }
    if (typeof subj.err === 'string') {
      rows.push({
        key: `subj-msg-${rows.length}`,
        level,
        inner: !!currentGroup,
        groupKey: currentGroup,
        subjects: subj.subjects,
        message: subj.err,
      })
      return rows
    }
    rows.push({
      key: `subj-only-${rows.length}`,
      level,
      inner: !!currentGroup,
      groupKey: currentGroup,
      subjects: subj.subjects,
      message: undefined,
    })
    return flattenGoDoxyError(subj.err, level, rows, currentGroup)
  }

  if (typeof input === 'object' && 'extras' in input && Array.isArray(input.extras)) {
    const nested = input as NestedError
    if (!nested.err) {
      nested.extras.forEach(e => flattenGoDoxyError(e as GoDoxyError, level, rows, currentGroup))
      return rows
    }

    let headerText = ''
    if (typeof nested.err === 'string') {
      headerText = nested.err
    } else {
      const label = subjectsToLabel((nested.err as WithSubject).subjects)
      const innerErr = (nested.err as WithSubject).err
      headerText = typeof innerErr === 'string' ? `${label} ${innerErr}` : label
    }

    if (input.extras.length <= 1) {
      if (typeof nested.err === 'object' && 'subjects' in nested.err) {
        rows.push({
          key: `hdr-inline-subj-${rows.length}`,
          level,
          inner: !!currentGroup,
          groupKey: currentGroup,
          subjects: (nested.err as WithSubject).subjects,
          message: (nested.err as WithSubject).err as string | undefined,
        })
      } else {
        rows.push({
          key: `hdr-inline-${rows.length}`,
          level,
          inner: !!currentGroup,
          groupKey: currentGroup,
          text: headerText,
        })
      }
      if (input.extras.length === 1) {
        flattenGoDoxyError(input.extras[0] as GoDoxyError, level + 1, rows, currentGroup)
      }
      return rows
    }

    const groupKey = `grp-${rows.length}`
    if (typeof nested.err === 'object' && 'subjects' in nested.err) {
      rows.push({
        key: `hdr-subj-${groupKey}`,
        level,
        isHeader: true,
        inner: !!currentGroup,
        groupKey,
        subjects: (nested.err as WithSubject).subjects,
        message: (nested.err as WithSubject).err as string | undefined,
      })
    } else {
      rows.push({
        key: `hdr-${groupKey}`,
        level,
        isHeader: true,
        inner: !!currentGroup,
        groupKey,
        text: headerText,
      })
    }
    input.extras.forEach((e: GoDoxyError) => {
      flattenGoDoxyError(e as GoDoxyError, level + 1, rows, groupKey)
    })
    return rows
  }

  if (Array.isArray(input)) {
    input.forEach(item => flattenGoDoxyError(item as GoDoxyError, level, rows, currentGroup))
    return rows
  }
  if (typeof input === 'object' && input) {
    Object.entries(input).forEach(([k, v]) => {
      if (v == null) return
      if (typeof v === 'string') {
        rows.push({
          key: `obj-${k}-${rows.length}`,
          level,
          inner: !!currentGroup,
          groupKey: currentGroup,
          text: `${k}: ${v}`,
        })
      } else {
        rows.push({
          key: `obj-${k}-label-${rows.length}`,
          level,
          inner: !!currentGroup,
          groupKey: currentGroup,
          text: `${k}:`,
        })
        flattenGoDoxyError(v as GoDoxyError, level + 1, rows, currentGroup)
      }
    })
    return rows
  }

  return rows
}

type TreeSpec = {
  id: string
  level: number
  label: ReactNode
  children: TreeSpec[]
}

export function GoDoxyErrorAlert({ err, title }: { err: GoDoxyError; title: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="-ml-5 max-h-[150px] overflow-y-auto">
        {err && <GoDoxyErrorText err={err} />}
      </AlertDescription>
    </Alert>
  )
}

export function GoDoxyErrorText({ err, level }: { err: GoDoxyError; level?: number }) {
  const baseLevel = level ?? 0
  const rows = useMemo(() => flattenGoDoxyError(err, baseLevel), [err, baseLevel])

  const tree = useMemo(() => {
    const root: TreeSpec = { id: 'root', level: -1, label: <span />, children: [] }
    const stack: TreeSpec[] = [root]

    rows.forEach(r => {
      const node: TreeSpec = {
        id: r.key,
        level: r.level,
        label: r.subjects ? (
          <SubjectText subjects={r.subjects} message={r.message} />
        ) : (
          <span>{r.text}</span>
        ),
        children: [],
      }

      while (stack.length - 1 > r.level) stack.pop()
      const parent = stack[stack.length - 1] ?? root
      parent.children.push(node)
      stack[r.level + 1] = node
    })

    return root.children
  }, [rows])

  return (
    <TreeProvider>
      <TreeView>{renderNodes(tree, 0)}</TreeView>
    </TreeProvider>
  )
}

function renderNodes(nodes: TreeSpec[], parentLevel = 0) {
  return nodes.map((node, idx) => {
    const hasChildren = node.children.length > 0
    const isLast = idx === nodes.length - 1
    return (
      <TreeNode key={node.id} nodeId={node.id} level={node.level} isLast={isLast}>
        <TreeNodeTrigger className="py-0.5">
          <TreeExpander hasChildren={hasChildren} />
          <TreeLabel className="text-wrap wrap-break-word">{node.label}</TreeLabel>
        </TreeNodeTrigger>
        {hasChildren && (
          <TreeNodeContent hasChildren>
            {renderNodes(node.children, parentLevel + 1)}
          </TreeNodeContent>
        )}
      </TreeNode>
    )
  })
}

function SubjectText({
  subjects,
  message,
  className,
}: {
  key?: string
  className?: string
  subjects: string[]
  message?: string
}) {
  return (
    <div className={className}>
      <span>{subjects.slice(0, -1).join('.')}</span>
      {subjects.length > 1 ? '.' : ''}
      <span className="font-semibold">{subjects.slice(-1)}</span>
      {message ? ` ${message}` : ''}
    </div>
  )
}
