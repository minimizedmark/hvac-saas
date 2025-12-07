'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

export default function HVACMap({ height = '100%', width = '100%' }) {
  const Map = useMemo(() => dynamic(
    () => import('./MapComponent'),
    { 
      loading: () => <div style={{ height, width, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff' }}>Loading map...</div>,
      ssr: false
    }
  ), [height, width]);

  return <Map height={height} width={width} />;
}
