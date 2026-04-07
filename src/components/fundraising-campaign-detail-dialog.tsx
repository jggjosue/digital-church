'use client';

import { Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { FundraisingCampaignDoc, FundraisingStatus } from '@/lib/fundraising-seed';

const statusColors: Record<FundraisingStatus, string> = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Completed: 'bg-blue-100 text-blue-800 border-blue-200',
  Upcoming: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Draft: 'bg-gray-100 text-gray-800 border-gray-200',
};

const progressIndicator: Record<FundraisingStatus, string> = {
  Active: 'bg-blue-500',
  Completed: 'bg-green-500',
  Upcoming: 'bg-gray-400',
  Draft: 'bg-muted-foreground',
};

function statusLabel(s: FundraisingStatus) {
  if (s === 'Active') return 'Activo';
  if (s === 'Completed') return 'Completado';
  if (s === 'Upcoming') return 'Próximo';
  return 'Borrador';
}

function datePrefix(status: FundraisingStatus) {
  if (status === 'Completed') return 'Finalizó';
  if (status === 'Upcoming') return 'Comienza';
  return 'Termina';
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type FundraisingCampaignDetailDialogProps = {
  campaign: FundraisingCampaignDoc | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FundraisingCampaignDetailDialog({
  campaign,
  open,
  onOpenChange,
}: FundraisingCampaignDetailDialogProps) {
  const showProgress =
    campaign != null &&
    campaign.status !== 'Draft' &&
    campaign.goal != null &&
    campaign.goal > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {campaign ? (
        <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-lg">
          <DialogHeader className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <DialogTitle className="pr-8 text-left leading-tight">{campaign.name}</DialogTitle>
              <Badge
                variant="outline"
                className={cn('w-fit shrink-0', statusColors[campaign.status])}
              >
                {statusLabel(campaign.status)}
              </Badge>
            </div>
            <DialogDescription className="text-left">{campaign.description}</DialogDescription>
          </DialogHeader>

          <Separator />

          <dl className="grid gap-4 text-sm">
            {showProgress ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <dt className="sr-only">Recaudación</dt>
                  <dd className="flex flex-wrap items-end gap-1">
                    <span className="text-xl font-bold tabular-nums">
                      {formatCurrency(campaign.raised)}
                    </span>
                    <span className="text-muted-foreground">
                      / {formatCurrency(campaign.goal!)}
                    </span>
                  </dd>
                </div>
                <Progress
                  value={Math.min(100, campaign.progress)}
                  className="h-2"
                  indicatorClassName={progressIndicator[campaign.status]}
                />
                <p
                  className={cn(
                    'font-medium',
                    campaign.progress > 100 ? 'text-green-600' : 'text-foreground'
                  )}
                >
                  {campaign.progress}% recaudado
                  {campaign.progress > 100 ? ' — Meta superada' : ''}
                </p>
              </div>
            ) : (
              <div>
                <dt className="text-muted-foreground">Progreso</dt>
                <dd className="mt-1 font-medium">
                  {campaign.status === 'Draft' ? 'No iniciado' : 'Sin meta definida'}
                </dd>
              </div>
            )}

            {campaign.date ? (
              <div>
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Fecha
                </dt>
                <dd className="mt-1 pl-6">
                  {datePrefix(campaign.status)} {campaign.date}
                </dd>
              </div>
            ) : null}

            <div>
              <dt className="text-muted-foreground">Identificador</dt>
              <dd className="mt-1 font-mono text-xs text-foreground">{campaign.id}</dd>
            </div>
          </dl>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
