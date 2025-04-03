import { toast } from "sonner";
import { useAtom } from "jotai";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { MdDeleteOutline } from "react-icons/md";
import { useEffect, useMemo, useState } from "react";
import { ICustomPrompt, userConfigAtom } from "@/stores";
import useWindowSize from "@/hooks/global/use-window-size";
import useDataSynchronization from "@/hooks/dataSynchronization";
import { BsTextIndentLeft, BsTextIndentRight } from "react-icons/bs";
import { IPresetsPromptList, useCreatePromptLists } from "./constan";

export const RightMenu = () => {
  const t = useTranslations();

  const { width } = useWindowSize()
  const [open, setOpen] = useState(true)

  const { PRESETS_PROMPT_LIST } = useCreatePromptLists()
  const { onSynchronizeOffline } = useDataSynchronization();

  const [{ customPromptList, templateTab }, useConfig] = useAtom(userConfigAtom);

  const onChoosePrompt = (item: ICustomPrompt | IPresetsPromptList) => {
    useConfig((v) => ({
      ...v,
      spoResultData:null,
      currentRecord: {
        id: 1,
        value: item.prompt,
        isOriginalEdition: true,
      },
      modifyRecord: [{
        id: 1,
        value: item.prompt,
        isOriginalEdition: true,
      }],
    }))
    if (width <= 1024) {
      setOpen(false)
    }
  }

  const RenderingList = (props: { item: ICustomPrompt }) => {
    const { item } = props
    const [isDelete, setIsDelete] = useState(false);
    return (
      <div className="border-b flex items-center justify-between text-sm font-bold p-3 cursor-pointer" onClick={() => { onChoosePrompt(item) }}>
        <div className="w-fit">
          <div className="">{item.title || item.prompt}</div>
          <span className="text-sm text-slate-500">{item?.createdAt}</span>
        </div>
        <Loader2 className={`h-[20px] w-[20px] animate-spin ${isDelete ? 'block' : 'hidden'}`} />
        <MdDeleteOutline
          className={`cursor-pointer text-red-600 text-2xl ${isDelete ? 'hidden' : 'block'}`}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDelete(true);
            try {
              await onSynchronizeOffline({ customPromptData: item, isDelete: true });
              toast(t('deleteSuccess'), { position: "top-right" })
            } catch (error) {
              toast(t('deleteError'), { position: "top-right" })
            }
            setIsDelete(false);
          }}
        />
      </div>
    )
  }

  const RenderingCustomPromptList = useMemo(() => {
    return customPromptList?.map(item => (<RenderingList item={item} key={item.id} />))
  }, [customPromptList.length])

  useEffect(() => {
    if (width <= 1024) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  }, [width])

  useEffect(() => {
    if (!templateTab && templateTab !== 0) {
      useConfig((v) => ({ ...v, templateTab: 0 }))
    }
  }, [])

  return (
    <>
      <div className={`
      flex flex-col h-full justify-between
      border absolute left-0 top-0 
      bg-background lg:!static
      ${open ? 'lg:min-w-[20%] lg:w-[20%] w-[80%] z-10 !fixed' : 'w-auto z-[8]'}
    `}>
        <div className={`flex items-center justify-evenly text-base p-2 ${open && 'border-b'}`}>
          {
            open &&
            [t('PresetTemplate'), t('CustomTemplate')].map((key, index) => (
              <div
                key={key}
                onClick={() => useConfig((v) => ({ ...v, templateTab: index }))}
                className={`border-b-2 border-transparent pb-1 cursor-pointer ${templateTab === index && '!border-[#7c3aed] text-[#7c3aed]'}`}
              >
                {key}
              </div>
            ))
          }
          <Button variant="icon" size="icon" onClick={() => setOpen(!open)} className={`${open && 'absolute right-2 top-1'} lg:hidden `}>
            {
              open ?
                <BsTextIndentRight className="text-2xl cursor-pointer" /> :
                <BsTextIndentLeft className="text-2xl cursor-pointer" />
            }
          </Button>
        </div>
        {
          open &&
          <div className="overflow-y-auto flex flex-col h-full">
            {
              templateTab ? RenderingCustomPromptList :
                PRESETS_PROMPT_LIST.map(item => (
                  <div className="border-b flex items-center justify-between text-sm font-bold p-3 cursor-pointer" key={item.id} onClick={() => { onChoosePrompt(item) }}>
                    {<item.icon className="text-lg" />}
                    {item.title}
                    <div></div>
                  </div>
                ))
            }
          </div>
        }
      </div>
      {open && <div onClick={() => setOpen(false)} className="w-full lg:hidden block h-full fixed right-0 top-0 z-[9] backdrop-blur-sm" />}
    </>
  );
};
