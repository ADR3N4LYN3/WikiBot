import { Metadata } from 'next';
import { CheckCircle, AlertCircle, Clock, Activity, Server, Database, Globe } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Status - WikiBot',
  description: 'Check the current status of WikiBot services.',
};

const services = [
  {
    name: 'Discord Bot',
    status: 'operational',
    icon: Activity,
    description: 'Core bot functionality',
  },
  {
    name: 'API',
    status: 'operational',
    icon: Server,
    description: 'REST API endpoints',
  },
  {
    name: 'Dashboard',
    status: 'operational',
    icon: Globe,
    description: 'Web dashboard',
  },
  {
    name: 'Database',
    status: 'operational',
    icon: Database,
    description: 'Data storage',
  },
];

const incidents = [
  {
    id: 1,
    title: 'Scheduled maintenance complete',
    status: 'resolved',
    date: '2024-01-14',
    description: 'Database optimization completed successfully. All services are back to normal.',
  },
  {
    id: 2,
    title: 'Minor API latency',
    status: 'resolved',
    date: '2024-01-10',
    description: 'Some users experienced increased API response times. Issue has been resolved.',
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'operational':
      return 'text-green-500';
    case 'degraded':
      return 'text-yellow-500';
    case 'outage':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case 'operational':
      return 'bg-green-500';
    case 'degraded':
      return 'bg-yellow-500';
    case 'outage':
      return 'bg-red-500';
    default:
      return 'bg-muted';
  }
}

export default function StatusPage() {
  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className={cn(
              'w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center',
              allOperational ? 'bg-green-500/20' : 'bg-yellow-500/20'
            )}>
              {allOperational ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              System <GradientText>Status</GradientText>
            </h1>

            <Badge
              variant={allOperational ? 'success' : 'default'}
              glow={allOperational}
              className="text-base"
            >
              {allOperational ? 'All systems operational' : 'Some systems affected'}
            </Badge>
          </div>
        </section>

        {/* Services Status */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Services</h2>

            <div className="space-y-3">
              {services.map((service) => (
                <GlassCard key={service.name} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                        <service.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-medium capitalize', getStatusColor(service.status))}>
                        {service.status}
                      </span>
                      <div className={cn('w-2 h-2 rounded-full', getStatusBg(service.status))} />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Uptime */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Uptime (last 90 days)</h2>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-bold text-green-500">99.98%</span>
                <span className="text-sm text-muted-foreground">Total uptime</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 90 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 h-8 rounded-sm',
                      i === 45 ? 'bg-yellow-500' : 'bg-green-500'
                    )}
                    title={`Day ${90 - i}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Recent incidents</h2>

            <div className="space-y-4">
              {incidents.map((incident) => (
                <GlassCard key={incident.id} className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{incident.title}</h3>
                    <Badge variant="success">Resolved</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Subscribe */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Stay updated</h2>
            <p className="text-muted-foreground mb-6">
              Get notified about incidents and maintenance.
            </p>
            <a
              href="https://discord.gg/wikibot"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
                'bg-[#5865F2] text-white font-semibold',
                'hover:bg-[#4752C4] transition-colors'
              )}
            >
              Join our Discord
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
