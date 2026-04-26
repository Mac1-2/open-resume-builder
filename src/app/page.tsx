"use client";

import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowRight, FileText, Sparkles, LayoutGrid, BarChart3} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {cn} from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const features = [
    {
      icon: <LayoutGrid className="h-8 w-8 text-primary" />,
      title: 'Modern Templates',
      description:
        'Choose from professionally designed templates that adapt to your style and industry.',
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: 'AI Assistance',
      description:
        'Get intelligent suggestions and content improvements powered by advanced AI models.',
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'Multiple Formats',
      description:
        'Export your resume in PDF, DOCX, or HTML format with pixel-perfect precision.',
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: 'Real-time Preview',
      description:
        'See changes instantly with our live preview that updates as you type.',
    },
  ];

  return (
    <div className="relative isolate">
      {/* Background decoration */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/20 to-secondary/20 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.1%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-20 sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Build Your Professional{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Resume
            </span>
          </h1>
          <p className="mt-8 text-lg leading-8 text-muted-foreground">
            Create stunning, professional resumes with our next-generation builder.
            Powered by AI, designed for success. Land your dream job faster.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              size="lg"
              className="text-base"
              onClick={() => router.push('/editor')}
            >
              Start Building
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {/* Temporarily disabled - editor under construction */}
            <Button
              size="lg"
              variant="outline"
              className="text-base"
              onClick={() => router.push('/editor')}
            >
              View Templates
            </Button>
          </div>
        </div>

        {/* Features grid */}
        <div className="mx-auto mt-20 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Everything you need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Professional tools for your job search
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-y-8 xl:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={cn(
                  'relative overflow-hidden p-6 transition-all hover:shadow-lg',
                  'border-border/50'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative mt-20 rounded-2xl bg-primary/5 px-6 py-16 sm:px-16 md:py-24">
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to advance your career?
            </h2>
            <div className="mt-10">
              <Button size="lg" className="text-base" onClick={() => router.push('/editor')}>
                Create Your Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}