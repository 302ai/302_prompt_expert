import { toast } from "sonner";
import { useAtom } from "jotai";
import html2md from "html-to-md";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { IoReload } from "react-icons/io5";
import { useTranslations } from "next-intl";
import { LuDownload } from "react-icons/lu";
import { RiRobot2Line } from "react-icons/ri";
import { FaRegTrashAlt } from "react-icons/fa";
import { MarkdownViewer } from "./MarkdownViewer";
import { FaRegCircleUser } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { MdOutlineUnfoldLess } from "react-icons/md";
import { appConfigAtom, userConfigAtom } from "@/stores";
import { MdContentCopy, MdOutlineUnfoldMore } from "react-icons/md";
import { clearPerformStatusData, deleteData, IChat } from "./indexDB";
import { useMonitorMessage } from "@/hooks/global/use-monitor-message";

export const MessageListView = (props: { onRetry: (type: 'painting' | 'chat', chatList: IChat[]) => void }) => {
  const t = useTranslations();
  const { handleDownload } = useMonitorMessage()
  const { onRetry } = props;

  const [{ hideBrand }] = useAtom(appConfigAtom);
  const [{ chatData, chatScroll, isChat }, setConfig] = useAtom(userConfigAtom);
  const [collapsedState, setCollapsedState] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ListCom = (props: { item: IChat, index: number }) => {
    const chatRef = useRef<HTMLDivElement>(null);
    const { item, index } = props;
    const isCollapsed = collapsedState[item.uid] || false;

    // 删除单条聊天记录
    const onDeleteChat = async (item: IChat) => {
      if (item?.id) {
        const previousRecord = chatData[index - 1];
        if (previousRecord?.id && previousRecord.isTest) {
          await deleteData(previousRecord.id);
        }
        const data = await deleteData(item.id);
        setConfig((v) => ({ ...v, chatData: data }))
      }
    }

    // 复制
    const onCopyText = () => {
      const htmlContent = chatRef.current?.getHTML();
      if (htmlContent) {
        const markdown = html2md(htmlContent)
        navigator.clipboard.writeText(markdown).then(() => {
          toast(t('CopyTextOk'), { position: "top-right" })
        }, (err) => {
          toast(t('CopyTextError'), { position: "top-right" })
        });
      }
    }

    const onRetryChat = () => {
      const chatList = chatData.filter((f, i) => i === index || i === index - 1);
      const type = item.isImage ? 'painting' : 'chat';
      onRetry(type, chatList)
    }

    if (item?.isTest) return;

    return (
      <div className={`flex flex-col gap-4 border p-2 ${item.role === 'user' && 'bg-[#8e47f005]'}`} key={item.uid} >
        <div className={`flex items-start gap-2 rounded-sm`}>
          {item.role === 'user' ?
            <FaRegCircleUser /> : hideBrand ? <RiRobot2Line /> :
              <img src="/images/global/logo-mini.png" className="w-[25px]" />
          }
          <div ref={chatRef} className={`relative overflow-hidden transition-all duration-100 ${isCollapsed && 'max-h-6'}`}>
            {
              item?.status === 'done' ?
                <div>
                  {item?.isImage ?
                    <img src={item.askText} className="w-full" /> :
                    <MarkdownViewer content={item.askText} />
                  }
                </div> :
                <Loader2 className="h-[20px] w-[20px] animate-spin m-[3px]" />
            }
          </div>
        </div>
        {
          (item.status === 'done' && !(index === chatData.length - 1 && isChat)) &&
          <div className='flex justify-between items-center'>
            <div className='flex gap-2'>
              {
                !item?.isImage &&
                <Button variant="icon" size="icon" className="w-7 h-7" onClick={onCopyText}>
                  <MdContentCopy className='text-[#8e47f0] cursor-pointer' />
                </Button>
              }
              {
                item.role === 'assistant' &&
                <Button variant="icon" size="icon" className="w-7 h-7" disabled={isChat} onClick={onRetryChat}>
                  <IoReload className='text-[#8e47f0] cursor-pointer' />
                </Button>
              }
              {
                item?.isImage &&
                <Button variant="icon" size="icon" className="w-7 h-7" onClick={() => handleDownload(item.askText)}>
                  <LuDownload className='text-[#8e47f0] cursor-pointer' />
                </Button>
              }
              <Button variant="icon" size="icon" className="w-7 h-7" onClick={() => onDeleteChat(item)}>
                <FaRegTrashAlt className='text-red-600 cursor-pointer' />
              </Button>
            </div>
            <div>
              {
                item?.isImage ? <span className="text-sm text-slate-500">{item.paintingModel}</span> :
                  <Button variant="icon" size="icon" className="w-7 h-7" onClick={() => setCollapsedState(prev => ({ ...prev, [item.uid]: !prev[item.uid] }))}>
                    {isCollapsed ? <MdOutlineUnfoldMore /> : <MdOutlineUnfoldLess />}
                  </Button>
              }
            </div>
          </div>
        }
      </div>
    )
  }

  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatScroll])

  useEffect(() => {
    clearPerformStatusData().then(res => {
      setConfig((v) => ({ ...v, chatData: res, chatScroll: 1 }))
    })
  }, [])

  return (
    <div className='h-full overflow-y-auto flex flex-col gap-4 p-3 border'>
      {chatData?.map((item, index) => (<ListCom item={item} index={index} key={item.uid} />))}
      <div ref={messagesEndRef} /> {/* 添加这个空的 div 作为滚动目标 */}
    </div>
  )
}
