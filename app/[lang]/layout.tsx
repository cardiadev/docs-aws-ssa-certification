import { RootProvider } from 'fumadocs-ui/provider/next';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { i18n } from '@/lib/i18n';
import type { ReactNode } from 'react';

const { provider } = defineI18nUI(i18n, {
  translations: {
    es: {
      displayName: 'Español',
      search: 'Buscar...',
    },
    en: {
      displayName: 'English',
    },
  },
});

export default async function LangLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const lang = (await params).lang;
  return <RootProvider i18n={provider(lang)}>{children}</RootProvider>;
}
