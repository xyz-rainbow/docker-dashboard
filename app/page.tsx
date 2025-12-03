import Image from "next/image";

import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('HomePage');
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold text-black dark:text-white">
          {t('title')}
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          {t('welcome')}
        </p>
      </main>
    </div>
  );
}
