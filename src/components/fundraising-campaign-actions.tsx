'use client';

import * as React from 'react';
import { DollarSign, Facebook, Instagram, Link2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { FundraisingCampaignDoc } from '@/lib/fundraising-seed';

function campaignUrl(campaign: FundraisingCampaignDoc) {
  if (typeof window === 'undefined') return '';
  const url = new URL('/donations/fundraising', window.location.origin);
  url.searchParams.set('campaign', campaign.id);
  return url.toString();
}

export function CampaignShareButton({ campaign }: { campaign: FundraisingCampaignDoc }) {
  const { toast } = useToast();

  const copyLink = async (network?: string) => {
    const url = campaignUrl(campaign);
    await navigator.clipboard.writeText(`${campaign.name}\n${campaign.description}\n${url}`);
    toast({
      title: 'Enlace copiado',
      description: network
        ? `Ya puede pegarlo y compartirlo en ${network}.`
        : 'Ya puede compartir la campaña con más hermanos.',
    });
  };

  const shareMore = async () => {
    const url = campaignUrl(campaign);
    if (navigator.share) {
      await navigator.share({ title: campaign.name, text: campaign.description, url });
      return;
    }
    await copyLink();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" /> Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl(campaign))}`}
            target="_blank"
            rel="noreferrer"
          >
            <Facebook className="mr-2 h-4 w-4" /> Facebook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void copyLink('Instagram')}>
          <Instagram className="mr-2 h-4 w-4" /> Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void copyLink()}>
          <Link2 className="mr-2 h-4 w-4" /> Copiar enlace
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void shareMore()}>
          <Share2 className="mr-2 h-4 w-4" /> Más opciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type DonationDialogProps = {
  campaign: FundraisingCampaignDoc | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (campaign: FundraisingCampaignDoc) => void;
};

export function FundraisingDonationDialog({
  campaign,
  open,
  onOpenChange,
  onSaved,
}: DonationDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setAmount('');
  }, [open, campaign?.id]);

  const save = async () => {
    if (!campaign) return;
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast({ variant: 'destructive', title: 'Monto inválido', description: 'Ingrese un monto mayor que cero.' });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/fundraising/${encodeURIComponent(campaign.id)}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsedAmount }),
      });
      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
        campaign?: FundraisingCampaignDoc;
      };
      if (!response.ok || !json.campaign) {
        throw new Error(json.error || 'No se pudo guardar la donación.');
      }
      onSaved(json.campaign);
      onOpenChange(false);
      toast({ title: 'Donación guardada', description: `Su aportación a ${campaign.name} fue registrada.` });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo donar',
        description: error instanceof Error ? error.message : 'Inténtelo nuevamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Donar a {campaign?.name}</DialogTitle>
          <DialogDescription>
            Escriba el monto de su aportación. Se registrará con la información de esta campaña.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="campaign-donation-amount">Monto</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="campaign-donation-amount"
              type="number"
              min="0.01"
              step="0.01"
              className="pl-9"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={saving}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void save()} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar donación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
