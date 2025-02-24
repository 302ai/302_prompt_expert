"use client";

import { useAtom } from "jotai";
import { appConfigAtom } from "@/stores";
import { useTranslations } from "next-intl";
import { Chat } from "@/components/Chat/page";
import { MainArea } from "@/components/MainArea/page";
import { RightMenu } from "@/components/RightMenu/page";

export default function Home() {
  const t = useTranslations();
  const [{ hideBrand }] = useAtom(appConfigAtom);

  return (
    <div className="text-2xl lg:w-[1500px] lg:px-5 w-full mx-auto max-h-[calc(100vh-52px)] overflow-hidden">
      <div className='h-20 w-full flex items-center justify-center gap-5 py-3'>
        {!hideBrand && <img src="/images/global/logo-mini.png" className='h-full' />}
        <h2 className='text-[26px] font-bold'>{t('home.title')}</h2>
      </div>
      <div className="w-full flex overflow-hidden h-[calc(100%-80px)] relative gap-4">
        <RightMenu />
        <div className="w-full h-full lg:px-0 px-[60px]">
          <MainArea />
        </div>
        <Chat />
      </div>
    </div >
  );
}
