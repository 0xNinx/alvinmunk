import { ImageResponse } from 'next/og';
import { ogResolve, ogCard } from '@/lib/og-card';
import { loadFont } from '@/lib/og-assets';
import { buildNetworkConfig } from '@/lib/stellar';

// Invite card — what a shared /v/<handle> recruit link unfurls into ("@handle invited you").
export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'You\'re invited to alvinmunk';

export default async function Image({ params, searchParams }: { params: { handle: string }; searchParams: { network?: string } }) {
  const handle = params.handle.toLowerCase();
  const networkParam = searchParams.network as 'testnet' | 'mainnet' | null;
  
  const networkConfig = networkParam && (networkParam === 'testnet' || networkParam === 'mainnet')
    ? buildNetworkConfig(networkParam)
    : undefined;

  const { address, scores, avatar } = await ogResolve(handle, networkConfig);
  const regularFont = loadFont('fonts/NotoSans-Regular.ttf');
  const boldFont = loadFont('fonts/NotoSans-Bold.ttf');

  return new ImageResponse(ogCard({ handle, address, scores, invite: true, avatar }), {
    ...size,
    // Both weights are required: passing only the bold font replaces Satori's default font
    // entirely, so every text node (not just the ones with fontWeight: 700) would render in
    // bold with no regular counterpart to fall back to.
    fonts: [
      {
        name: 'Noto Sans',
        data: regularFont,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Noto Sans',
        data: boldFont,
        weight: 700,
        style: 'normal',
      },
    ],
  });
}
