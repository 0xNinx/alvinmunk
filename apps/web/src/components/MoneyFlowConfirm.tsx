'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/Avatar';
import { config } from '@/lib/stellar';
import { shortAddr } from '@alvinmunk/shared';
import { useTranslations } from '@/lib/i18n';

interface MoneyFlowConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'tip' | 'claim';
  recipientAddress?: string;
  recipientHandle?: string;
  amount?: string;
  showUndo?: boolean;
  isFirstMainnetTip?: boolean;
}

export function MoneyFlowConfirm({
  open,
  onClose,
  onConfirm,
  type,
  recipientAddress,
  recipientHandle,
  amount,
  showUndo = false,
  isFirstMainnetTip = false,
}: MoneyFlowConfirmProps) {
  const t = useTranslations();
  const [undoCountdown, setUndoCountdown] = useState(5);
  const [canProceed, setCanProceed] = useState(!showUndo);

  // Undo countdown for tips
  useEffect(() => {
    if (!open || !showUndo) {
      setUndoCountdown(5);
      setCanProceed(!showUndo);
      return;
    }

    if (undoCountdown > 0) {
      const timer = setTimeout(() => setUndoCountdown(undoCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanProceed(true);
    }
  }, [open, showUndo, undoCountdown]);

  const isMainnet = config.network === 'mainnet';

  if (!isMainnet) return null;

  const handleConfirm = () => {
    if (canProceed) {
      onConfirm();
    }
  };

  const handleUndo = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {type === 'tip' ? t('moneyFlowConfirm.tipTitle') : t('moneyFlowConfirm.claimTitle')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {type === 'tip' ? t('moneyFlowConfirm.tipSubtitle') : t('moneyFlowConfirm.claimSubtitle')}
          </p>
        </div>

        {/* Recipient info for tips */}
        {type === 'tip' && recipientAddress && (
          <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-4">
            <Avatar address={recipientAddress} size={48} />
            <div className="flex-1">
              <p className="font-medium">{recipientHandle || shortAddr(recipientAddress, 6, 6)}</p>
              <p className="text-xs text-muted-foreground font-mono">{recipientAddress}</p>
            </div>
          </div>
        )}

        {/* Amount display */}
        {amount && (
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{amount} USDC</p>
          </div>
        )}

        {/* Warning message */}
        <div className="rounded-lg bg-destructive/10 p-3">
          <p className="text-sm font-medium text-destructive">
            {t('moneyFlowConfirm.realMoneyWarning')}
          </p>
        </div>

        {/* First tip checkbox */}
        {isFirstMainnetTip && (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border"
              onChange={(e) => setCanProceed(e.target.checked)}
              checked={canProceed}
            />
            <span className="text-sm text-muted-foreground">
              {t('moneyFlowConfirm.firstTipCheckbox')}
            </span>
          </label>
        )}

        {/* Undo window for tips */}
        {showUndo && !canProceed && (
          <div className="text-center">
            <p className="text-sm font-medium">
              {t('moneyFlowConfirm.sending')} {undoCountdown}s
            </p>
            <Button
              variant="outline"
              onClick={handleUndo}
              className="mt-2 w-full"
              size="lg"
            >
              {t('moneyFlowConfirm.undo')}
            </Button>
          </div>
        )}

        {/* Confirm button */}
        {canProceed && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1" size="lg">
              {t('moneyFlowConfirm.cancel')}
            </Button>
            <Button onClick={handleConfirm} className="flex-1" size="lg">
              {type === 'tip' ? t('moneyFlowConfirm.confirmTip') : t('moneyFlowConfirm.confirmClaim')}
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
