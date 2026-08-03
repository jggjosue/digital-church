import type { ReactNode } from 'react';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description: string;
  detail?: string;
  actions: ReactNode;
  input?: ReactNode;
  busy?: boolean;
  compact?: boolean;
};

export function RegistryImportCard({ title, description, detail, actions, input, busy, compact }: Props) {
  return (
    <Card className={cn('overflow-hidden border-dashed', busy && 'pointer-events-none opacity-60')}>
      <CardContent className={cn('flex flex-col items-center justify-center text-center', compact ? 'gap-5 p-6 sm:p-8' : 'min-h-[320px] gap-6 p-6 sm:p-10')}>
        {input}
        <span className={cn('rounded-full bg-sky-100 text-sky-500', compact ? 'p-4' : 'p-6')}><UploadCloud className={compact ? 'h-8 w-8' : 'h-10 w-10'} /></span>
        <div className="max-w-3xl space-y-2">
          <p className={cn('font-extrabold tracking-tight', compact ? 'text-2xl' : 'text-2xl sm:text-4xl lg:text-5xl')}>{title}</p>
          <p className={cn('text-muted-foreground', compact ? 'text-sm' : 'text-base sm:text-xl lg:text-2xl')}>{description}</p>
          {detail ? <p className="text-sm text-muted-foreground sm:text-base">{detail}</p> : null}
        </div>
        <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">{actions}</div>
      </CardContent>
    </Card>
  );
}
