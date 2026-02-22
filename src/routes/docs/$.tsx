import browserCollections from 'fumadocs-mdx:collections/browser'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions'
import { useFumadocsLoader } from 'fumadocs-core/source/client'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { Suspense } from 'react'
import RootProvider from '@/components/wiki/RootProvider'
import { baseOptions, gitConfig } from '@/lib/wiki/layout.shared'
import { source } from '@/lib/wiki/source'
import { getMDXComponents } from '@/mdx-components'
import { LLMCopyButton, ViewOptions } from '@/wiki/components/ai/page-actions'

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? []
    const data = await loader({ data: slugs })
    await clientLoader.preload(data.path)
    return data
  },
})

const loader = createServerFn({
  method: 'GET',
})
  .inputValidator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs)
    if (!page) throw notFound()

    return {
      slugs: page.slugs,
      path: page.path,
      pageTree: await source.serializePageTree(source.getPageTree()),
    }
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
  const { pageTree, slugs, path } = useFumadocsLoader(Route.useLoaderData())
  const markdownUrl = `/llms.mdx/docs/${[...slugs, 'index.mdx'].join('/')}`

  return (
    <RootProvider>
      <DocsLayout {...baseOptions()} tree={pageTree}>
        <Link to={markdownUrl} hidden />
        <Suspense>{clientLoader.useContent(path, { markdownUrl, path })}</Suspense>
      </DocsLayout>
    </RootProvider>
  )
}

function LinkComponent({ href, ...props }: React.ComponentProps<'a'>) {
  if (!href) return <a {...props} />
  href = href.replace('/../..', '').replace('..', 'docs/godoxy')
  return <a href={href} {...props} />
}
