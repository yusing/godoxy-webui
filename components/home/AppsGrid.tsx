'use client'

import { AppItem } from '@/components/home/AppItem'
import { CategoryIcon } from '@/components/ui/category-icon'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProduce } from '@/hooks/producer-consumer'
import { useWebSocketApi } from '@/hooks/websocket'
import { type HealthMap, type HomepageItem } from '@/lib/api'
import { api } from '@/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import AppItemTooltipContent from './AppItemTooltipContent'

export default function AppGrid() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Favorites')
  const [comboboxValue, setComboboxValue] = useState<string>('')

  // const categories = [
  //   { id: 'pinned', label: 'Pinned', icon: Star },
  //   { id: 'all', label: 'All', icon: Grid3X3 },
  //   { id: 'productivity', label: 'Productivity', icon: BarChart3 },
  //   { id: 'communication', label: 'Communication', icon: Mail },
  //   { id: 'development', label: 'Development', icon: Database },
  //   { id: 'system', label: 'System', icon: Settings },
  // ]

  const {
    data: categories,
    // isLoading,
    // error,
  } = useQuery({
    queryKey: ['homepage.items'],
    queryFn: () =>
      api.homepage
        .items({
          search: searchQuery,
        })
        .then(res => res.data),
  })

  const categoryNames = useMemo(() => categories?.map(c => c.name) ?? [], [categories])

  const maxTabsWithoutCombobox = 5
  const comboboxStartIndex = 5
  const visibleTabs = useMemo(() => {
    const list = categories ?? []
    if (list.length <= maxTabsWithoutCombobox) return list
    return list.slice(0, comboboxStartIndex)
  }, [categories])
  const overflowTabs = useMemo(() => {
    const list = categories ?? []
    if (list.length <= maxTabsWithoutCombobox) return []
    return list.slice(comboboxStartIndex)
  }, [categories])

  useEffect(() => {
    if (!categoryNames.length) return
    if (!categoryNames.includes(activeCategory)) {
      setActiveCategory(categoryNames[0] ?? 'All')
    }

    // Clear combobox value when active category is in visible tabs
    if (visibleTabs.some(tab => tab.name === activeCategory)) {
      setComboboxValue('')
    }

    // if current category is Favorites and there are no favorites, set to All
    if (
      activeCategory === 'Favorites' &&
      !categories?.find(c => c.name === activeCategory)?.items?.some(c => c.favorite)
    ) {
      setActiveCategory('All')
    }
  }, [categoryNames, activeCategory, visibleTabs])

  return (
    <div className="space-y-4">
      <HealthWatcher />
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="w-auto">
            <TabsList className="flex w-auto gap-1 h-auto p-1">
              {visibleTabs?.map(({ name: category }) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <CategoryIcon
                    category={category.toLowerCase().replace(/\s+/g, '-')}
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <span className="hidden sm:inline lg:inline">{category}</span>
                </TabsTrigger>
              ))}
              {overflowTabs.length > 0 && (
                <div className="ml-1">
                  <Combobox
                    value={comboboxValue}
                    options={overflowTabs.map(c => ({
                      label: c.name,
                      icon: (
                        <CategoryIcon
                          category={c.name.toLowerCase().replace(/\s+/g, '-')}
                          className="h-3 w-3 sm:h-4 sm:w-4"
                        />
                      ),
                    }))}
                    placeholder="More"
                    emptyMessage="No more categories"
                    onValueChange={value => {
                      setActiveCategory(value)
                      setComboboxValue(value)
                    }}
                  />
                </div>
              )}
            </TabsList>
          </div>

          <div className="relative w-full lg:w-75 min-w-0 md:min-w-50">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {categories?.map(({ name: category, items }) => (
          <TabsContent key={category} value={category} className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 auto-rows-max">
                {items?.map(app => (
                  <AppItemWithTooltip key={app.alias} app={app} />
                ))}
              </div>

              {categories?.length === 0 && (
                <div className="text-center py-12">
                  <CategoryIcon
                    category="all"
                    className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                  />
                  <p className="text-muted-foreground">No apps found</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function AppItemWithTooltip({ app }: { app: HomepageItem }) {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <AppItem app={app} />
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
        <AppItemTooltipContent alias={app.alias} />
      </TooltipContent>
    </Tooltip>
  )
}

function HealthWatcher() {
  const produce = useProduce()

  useWebSocketApi<HealthMap>({
    endpoint: '/health',
    onMessage: data => {
      Object.entries(data).forEach(([key, value]) => {
        produce(`service-health-${key}`, value)
        produce(`service-health-status-${key}`, value.status)
      })
    },
  })

  return null
}

// const apps: App[] = [
//   {
//     id: '1',
//     name: 'Analytics Dashboard',
//     description: 'Business intelligence platform',
//     category: 'productivity',
//     isPinned: true,
//     widgets: [
//       { label: 'Active Users', value: '1,234' },
//       { label: 'Page Views', value: '45.6K' },
//       { label: 'Bounce Rate', value: '23%' },
//     ],
//   },
//   {
//     id: '2',
//     name: 'Database Manager',
//     description: 'Database management tool',
//     category: 'development',
//     isPinned: true,
//   },
//   {
//     id: '3',
//     name: 'Corporate Website',
//     description: 'Company website CMS',
//     category: 'productivity',
//     isPinned: true,
//   },
//   {
//     id: '4',
//     name: 'Email Client',
//     description: 'Email management platform',
//     category: 'communication',
//     isPinned: true,
//   },
//   {
//     id: '5',
//     name: 'Project Calendar',
//     description: 'Team scheduling tool',
//     category: 'productivity',
//     widgets: [
//       { label: 'Today', value: '5' },
//       { label: 'This Week', value: '23' },
//     ],
//   },
//   {
//     id: '6',
//     name: 'Document Portal',
//     description: 'Document collaboration workspace',
//     category: 'productivity',
//   },
//   {
//     id: '7',
//     name: 'Team Collaboration',
//     description: 'Project management hub',
//     category: 'communication',
//   },
//   {
//     id: '8',
//     name: 'Security Center',
//     description: 'Security monitoring system',
//     category: 'development',
//     widgets: [
//       { label: 'Threats', value: '0' },
//       { label: 'Scans', value: '12' },
//       { label: 'Status', value: 'Safe' },
//     ],
//   },
//   {
//     id: '9',
//     name: 'System Settings',
//     description: 'System configuration console',
//     category: 'system',
//   },
//   {
//     id: '10',
//     name: 'Performance Monitor',
//     description: 'System metrics tracker',
//     category: 'system',
//   },
//   {
//     id: '11',
//     name: 'Code Repository',
//     description: 'Git version control',
//     icon: Database,
//     category: 'development',
//   },
//   {
//     id: '12',
//     name: 'CI/CD Pipeline',
//     description: 'Automated deployment system',
//     category: 'development',
//     widgets: [
//       { label: 'Builds', value: '147' },
//       { label: 'Success Rate', value: '94%' },
//     ],
//   },
//   {
//     id: '13',
//     name: 'API Gateway',
//     description: 'API management platform',
//     category: 'development',
//   },
//   {
//     id: '14',
//     name: 'Log Aggregator',
//     description: 'Centralized logging platform',
//     category: 'system',
//   },
//   {
//     id: '15',
//     name: 'Backup Service',
//     description: 'Automated backup system',
//     category: 'system',
//   },
//   {
//     id: '16',
//     name: 'Video Conferencing',
//     description: 'Video meeting platform',
//     category: 'communication',
//   },
//   {
//     id: '17',
//     name: 'Task Manager',
//     description: 'Agile task tracking',
//     category: 'productivity',
//     widgets: [
//       { label: 'Open Tasks', value: '23' },
//       { label: 'Due Today', value: '8' },
//     ],
//   },
//   {
//     id: '18',
//     name: 'Knowledge Base',
//     description: 'Documentation help center',
//     category: 'productivity',
//   },
//   {
//     id: '19',
//     name: 'Customer Support',
//     description: 'Helpdesk ticketing system',
//     category: 'communication',
//   },
//   {
//     id: '20',
//     name: 'Financial Reports',
//     description: 'Financial analysis dashboard',
//     category: 'productivity',
//   },
//   {
//     id: '21',
//     name: 'Network Monitor',
//     description: 'Network diagnostics tool',
//     category: 'system',
//   },
//   {
//     id: '22',
//     name: 'Container Registry',
//     description: 'Docker image storage',

//     category: 'development',
//   },
//   {
//     id: '23',
//     name: 'Load Balancer',
//     description: 'Traffic distribution system',
//     category: 'system',
//   },
//   {
//     id: '24',
//     name: 'Chat Platform',
//     description: 'Team messaging tool',
//     category: 'communication',
//   },
//   {
//     id: '25',
//     name: 'Code Editor',
//     description: 'Cloud IDE platform',
//     category: 'development',
//     widgets: [
//       { label: 'Active Sessions', value: '15' },
//       { label: 'Projects', value: '42' },
//     ],
//   },
// ]
