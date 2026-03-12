import type { Metadata } from 'next';
import { ComposePageClient } from './ComposePageClient';

export const metadata: Metadata = {
  title: '拼好Prompt',
};

export default function ComposePage() {
  return <ComposePageClient />;
}
