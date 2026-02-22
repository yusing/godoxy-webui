import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, Cards } from 'fumadocs-ui/components/card'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { Activity, Container, GitBranch, Lock, Moon, Shield } from 'lucide-react'
import RootProvider from '@/components/wiki/RootProvider'
import { baseOptions } from '@/lib/wiki/layout.shared'

const features = [
  {
    icon: Container,
    title: 'Docker-aware',
    description: 'Automatically detect and configure routes from Docker containers',
  },
  {
    icon: Moon,
    title: 'Idle-Sleep',
    description: 'Put containers to sleep on idle, wake them up when needed',
  },
  {
    icon: Shield,
    title: 'Access Control',
    description: 'Connection/Request level access control. IP/CIDR/GeoIP based',
  },
  {
    icon: Activity,
    title: 'Server Monitoring',
    description: 'Monitor your CPU, disk usage, memory usage, Docker logs, etc',
  },
  {
    icon: Lock,
    title: 'Certificates',
    description: "Automatic HTTPS with Let's Encrypt",
  },
  {
    icon: GitBranch,
    title: 'Load Balancing',
    description: 'Distribute traffic across containers',
  },
]

export const Route = createFileRoute('/docs/')({
  component: Home,
})

function Home() {
  return (
    <RootProvider>
      <Home_ />
    </RootProvider>
  )
}

function Home_() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-col flex-1 justify-center">
        <div className="container px-4 py-16 space-y-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Beyond a reverse proxy</h1>
            <p className={`text-lg text-fd-muted-foreground max-w-2xl mx-auto font-mono`}>
              A smart reverse proxy for Docker that automatically manages routes, saves resources,
              and keeps your services secure.
            </p>
          </div>

          <Cards className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {features.map(feature => (
              <Card
                key={feature.title}
                icon={<feature.icon className="text-fd-primary" />}
                title={<span className="text-fd-foreground">{feature.title}</span>}
                description={feature.description}
                className="bg-fd-card border-fd-border hover:border-fd-primary/50 hover:bg-fd-accent transition-all duration-300"
              />
            ))}
          </Cards>

          <div className="flex justify-center">
            <Link
              to="/docs/$"
              params={{
                _splat: 'godoxy/Setup',
              }}
              className="px-6 py-3 rounded-full bg-fd-accent text-fd-accent-foreground font-medium hover:bg-fd-accent/90 transition-colors font-mono cursor-pointer"
            >
              {'>'} Explore Documentation
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  )
}
