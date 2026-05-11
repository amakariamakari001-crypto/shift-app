import dynamic from 'next/dynamic';

const ShiftApp = dynamic(() => import('@/components/ShiftApp'), { ssr: false });

export default function Home() {
  return <ShiftApp />;
}
