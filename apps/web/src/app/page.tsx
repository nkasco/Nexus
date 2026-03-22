'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function readDefaultLandingSection() {
  const raw = window.localStorage.getItem('nexus-operator-preferences');

  if (!raw) {
    return 'overview';
  }

  try {
    const parsed = JSON.parse(raw) as {
      state?: { defaultLandingSection?: string };
    };
    const section = parsed.state?.defaultLandingSection;

    if (
      section === 'overview' ||
      section === 'home-lab' ||
      section === 'media' ||
      section === 'devops' ||
      section === 'metrics' ||
      section === 'alerts'
    ) {
      return section;
    }
  } catch {}

  return 'overview';
}

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${readDefaultLandingSection()}`);
  }, [router]);

  return null;
}
