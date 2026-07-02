import browserCollections from 'fumadocs-mdx:collections/browser'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions'
import { useFumadocsLoader } from 'fumadocs-core/source/client'
import type { TOCItemType } from 'fumadocs-core/toc'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { isValidElement, Suspense, type ComponentProps, type ReactNode } from 'react'
import { APIPage } from '@/components/wiki/APIPage'
import RootProvider from '@/components/wiki/RootProvider'
import { baseOptions, gitConfig } from '@/lib/wiki/layout.shared'
import { source } from '@/lib/wiki/source'
import { getMDXComponents } from '@/mdx-components'
import { LLMCopyButton, ViewOptions } from '@/wiki/components/ai/page-actions'

type SerializableTOCItem = Omit<TOCItemType, 'title'> & {
  title: string
}

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? []
    const data = await loader({ data: slugs })
    if (data.type === 'docs') {
      await clientLoader.preload(data.path)
    }
    return data
  },
})

function getTOCTitleText(title: ReactNode): string {
  if (title == null || typeof title === 'boolean') return ''
  if (typeof title === 'string' || typeof title === 'number' || typeof title === 'bigint') {
    return String(title)
  }
  if (Array.isArray(title)) return title.map(getTOCTitleText).join('')
  if (isValidElement<{ children?: ReactNode }>(title)) {
    return getTOCTitleText(title.props.children)
  }
  return ''
}

function serializeTOC(toc: TOCItemType[]): SerializableTOCItem[] {
  return toc.map(item => ({
    ...item,
    title: getTOCTitleText(item.title),
  }))
}

const loader = createServerFn({
  method: 'GET',
})
  .validator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs)
    if (!page) throw notFound()

    const pageTree = await source.serializePageTree(source.getPageTree())
    if (page.data.type === 'openapi') {
      return {
        type: 'openapi',
        title: page.data.title,
        description: page.data.description,
        toc: serializeTOC(page.data.toc),
        pageTree,
        props: await page.data.getClientAPIPageProps(),
      } as const
    }

    return {
      type: 'docs',
      slugs: page.slugs,
      path: page.path,
      pageTree,
    } as const
  })

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    {
      markdownUrl,
      path,
    }: {
      markdownUrl: string
      path: string
    }
  ) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <LLMCopyButton markdownUrl={markdownUrl} />
          <ViewOptions
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}-wiki/blob/${gitConfig.branch}/content/docs/${path}`}
          />
        </div>
        <DocsBody>
          <MDX
            components={getMDXComponents({
              a: LinkComponent,
            })}
          />
        </DocsBody>
      </DocsPage>
    )
  },
})

function Page() {
  const page = useFumadocsLoader(Route.useLoaderData())
  let content: ReactNode

  if (page.type === 'openapi') {
    content = (
      <DocsPage toc={page.toc} full>
        <DocsTitle>{page.title}</DocsTitle>
        <DocsDescription>{page.description}</DocsDescription>
        <DocsBody className="max-w-none w-full">
          <APIPage {...page.props} />
        </DocsBody>
      </DocsPage>
    )
  } else {
    const markdownUrl = `/llms.mdx/docs/${[...page.slugs, 'index.mdx'].join('/')}`
    content = (
      <>
        <Link to={markdownUrl} hidden />
        <Suspense>{clientLoader.useContent(page.path, { markdownUrl, path: page.path })}</Suspense>
      </>
    )
  }
  return (
    <RootProvider>
      <DocsLayout {...baseOptions()} tree={page.pageTree}>
        {content}
      </DocsLayout>
    </RootProvider>
  )
}

function LinkComponent({ href, ...props }: ComponentProps<'a'>) {
  if (!href) return <a {...props} />
  href = href.replace('/../..', '').replace('..', 'docs/godoxy')
  return <a href={href} {...props} />
}
