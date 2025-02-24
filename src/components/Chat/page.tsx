import dayjs from 'dayjs'
import { toast } from 'sonner';
import { useAtom } from 'jotai';
import { CoreMessage } from 'ai';
import { v4 as uuiV4 } from 'uuid';
import { Slider } from '../ui/slider';
import { Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { useTranslations } from 'next-intl';
import { readStreamableValue } from 'ai/rsc';
import { ErrorToast } from '../ui/errorToast';
import { FaRegTrashAlt } from "react-icons/fa";
import { Button } from '@/components/ui/button';
import { useChatConfiguration } from './constant';
import { MessageListView } from './MessageListView';
import { IStreamableValue, onChat } from './service';
import { LuSlidersHorizontal } from "react-icons/lu";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { IoReload, IoSendSharp } from "react-icons/io5";
import { appConfigAtom, userConfigAtom } from '@/stores';
import useWindowSize from '@/hooks/global/use-window-size';
import React, { useEffect, useMemo, useState } from 'react';
import { BsTextIndentLeft, BsTextIndentRight } from 'react-icons/bs';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addData, clearAllChatData, deleteData, IChat, updateData } from './indexDB';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const internationalModel = [
  'gpt-4o',
  'chatgpt-4o-latest',
  'claude-3-5-sonnet-20241022',
  'deepseek-chat',
  'gemini-2.0-pro-exp-02-05',
  'llama3.3-70b',
  'qwen-max-latest',
  'gpt-4o-mini',
  'llama3.1-405b',
  'claude-3-5-haiku-20241022',
  'qwen-plus',
  'mistral-large-2411',
]
const domesticModel = ['deepseek-chat', 'qwen-max-latest', 'qwen-plus'];

const paintingModelList = ['flux-pro-v1.1', 'flux-schnell', 'ideogram/V_2', 'recraftv3']

export function Chat() {
  const t = useTranslations('chat');
  const { width } = useWindowSize();
  const { chatConfigList } = useChatConfiguration()
  const [{ apiKey = '', region }] = useAtom(appConfigAtom);
  const [{ chatConfig, chatData, currentRecord, promptScheme, chatModel, isTestPrompt, imageNumber, aspectRatio, isChat, paintingModel }, useConfig] = useAtom(userConfigAtom);

  const [open, setOpen] = useState(true)
  const [inputValue, setInputValue] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSendMessage = async () => {
    if (isChat || promptScheme === "DRAW") return;
    if (inputValue.trim()) {
      await onSendChat('chat')
      setInputValue('');
    } else {
      toast(t('enterMessage'), { position: "top-right" })
    }
  };

  const onSendChat = async (actionType: 'test' | 'chat') => {
    const type = promptScheme === "DRAW" ? 'painting' : 'chat';
    const askText = actionType === 'chat' ? inputValue : currentRecord?.value || '';
    const newChats = await addData([{
      uid: uuiV4(),
      aspectRatio,
      role: 'user',
      status: 'done',
      askText: askText,
      isTest: actionType === "test",
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      paintingModel,
    }, {
      paintingModel,
      askText: '',
      uid: uuiV4(),
      role: 'assistant',
      status: 'perform',
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }]);

    const currentChat = newChats[newChats.length - 1];
    let messages: Array<CoreMessage> = [];
    if (actionType === 'chat') {
      messages = chatData?.map(item => ({ role: item.role, content: item.askText })) || [];
    }
    messages.push({ role: 'user', content: askText });
    useConfig((v) => ({ ...v, chatScroll: v.chatScroll + 1, chatData: newChats, isChat: true }));
    await onGenerate(
      type,
      currentChat,
      messages,
      {
        imageNumber,
        aspectRatio,
      }
    )
  };

  const onRetryData = async (type: 'painting' | 'chat', chatList: IChat[]) => {
    const userContet = chatList[chatList.length - 2];
    delete userContet.id;
    const newChats = await addData([{
      ...userContet,
      uid: uuiV4(),
      isTest: true,
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }, {
      paintingModel,
      uid: uuiV4(),
      role: 'assistant',
      status: 'perform',
      askText: '',
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }]);

    const currentChat = newChats[newChats.length - 1];
    const messages: Array<CoreMessage> = chatList?.map(item => ({ role: item.role, content: item.askText }));
    messages.push({ role: 'user', content: userContet.askText });
    useConfig((v) => ({ ...v, chatScroll: v.chatScroll + 1, chatData: newChats, isChat: true }));
    await onGenerate(
      type,
      currentChat,
      messages,
      {
        imageNumber: 1,
        aspectRatio: userContet?.aspectRatio || '1:1',
      }
    )
  }

  const onGenerate = async (type: 'painting' | 'chat', currentChat: IChat, messages: Array<CoreMessage>, params: { imageNumber: number, aspectRatio: `${number}:${number}` }) => {
    try {
      const result = await onChat({
        ...params,
        type,
        apiKey,
        messages,
        chatModel,
        chatConfig,
        paintingModel,
        paintingPrompt: currentRecord.value
      });
      console.log('=======result', result);
      if (type === 'painting') {
        await paintingResult(result, currentChat)
      } else {
        await chatResult(result, currentChat)
      }
    } catch (error: any) {
      console.log('=======error', error);

      if (error?.message?.error?.err_code) {
        toast(() => (ErrorToast(error.message.error.err_code)), { position: "top-right" })
      }
      const data = await deleteData(currentChat.id || 0);
      useConfig((v) => ({ ...v, chatData: data, chatScroll: 0 }))
    }
    useConfig((v) => ({ ...v, isTestPrompt: false, isChat: false }))
  }

  const chatResult = async (result: IStreamableValue, currentChat: IChat) => {
    if (result?.output) {
      let chatValue = '';
      for await (const delta of readStreamableValue(result.output)) {
        if (delta?.type === 'text-delta') {
          chatValue += delta?.textDelta;
          if (chatValue.length > 0) {
            currentChat = { ...currentChat, askText: chatValue, status: chatValue.length ? 'done' : 'perform' };
            useConfig((v) => ({
              ...v,
              chatData: v.chatData.map(item => item.uid === currentChat.uid ? { ...currentChat } : item),
              chatScroll: v.chatScroll += 1
            }))
          }
        } else if (delta?.type === 'logprobs') {
          const newChat = await updateData({ ...currentChat });
          useConfig((v) => ({
            ...v,
            chatData: newChat,
            chatScroll: 0,
          }))
        }
      }
    }
  }

  const paintingResult = async (result: { resultImage: string[], error: any }, currentChat: IChat) => {
    if (result?.resultImage) {
      const chatDatTemp = await deleteData(currentChat.id || 0);
      const userContent = chatDatTemp[chatDatTemp.length - 1];
      const tempChat = result?.resultImage.map((url, index) => {
        const assistantContent = {
          paintingModel,
          uid: uuiV4(),
          role: 'assistant',
          status: 'done',
          askText: url,
          isImage: true,
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        }
        if (index) {
          delete userContent.id;
          return [{ ...userContent, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'), uid: uuiV4() }, { ...assistantContent }]
        } else {
          return [{ ...assistantContent }]
        }
      }).flat() as IChat[];
      const newChats = await addData(tempChat)
      useConfig((v) => ({ ...v, chatScroll: 0, chatData: newChats }))
    } else {
      if (result?.error?.err_code) {
        toast(() => (ErrorToast(result.error.err_code)), { position: "top-right" })
      } else {
        toast(t('TestRequestFailed'), { position: "top-right" })
      }
      const data = await deleteData(currentChat.id || 0);
      useConfig((v) => ({ ...v, chatData: data, chatScroll: 0 }))
    }
  }

  const onClearAllChatData = async () => {
    await clearAllChatData();
    useConfig((v) => ({ ...v, chatData: [] }))
  }

  const onTryLastOneAgain = async () => {
    const type = chatData[chatData.length - 1].isImage ? 'painting' : 'chat';
    await onRetryData(type, chatData)
  }

  const RenderingModels = useMemo(() => {
    return (
      <Select value={chatModel} onValueChange={(value) => useConfig((v) => ({ ...v, chatModel: value }))}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {
              region === '1' ?
                internationalModel.map(key => (<SelectItem value={key} key={key}>{key}</SelectItem>)) :
                domesticModel.map(key => (<SelectItem value={key} key={key}>{key}</SelectItem>))
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }, [chatModel, region])

  const RenderingPaintingModels = useMemo(() => {
    return (
      <Select value={paintingModel || 'flux-pro-v1.1'} onValueChange={(value) => useConfig((v) => ({ ...v, paintingModel: value }))}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {paintingModelList.map(key => (<SelectItem value={key} key={key}>{key}</SelectItem>))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }, [paintingModel])

  const RenderingImageResolution = useMemo(() => {
    return (
      <Select value={aspectRatio} onValueChange={(value: `${number}:${number}`) => useConfig((v) => ({ ...v, aspectRatio: value }))}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {['1:1', '3:4', '4:3', '9:16', '16:9'].map((key) => <SelectItem value={key} key={key}>{key}</SelectItem>)}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }, [aspectRatio, region])

  useEffect(() => {
    if (region === '0' && !domesticModel.includes(chatModel)) {
      useConfig((v) => ({ ...v, chatModel: 'deepseek-chat' }))
    }
    if (!chatModel) {
      if (region === '0') {
        useConfig((v) => ({ ...v, chatModel: 'deepseek-chat' }))
      } else {
        useConfig((v) => ({ ...v, chatModel: 'gpt-4o' }))
      }
    }
  }, [region])

  useEffect(() => {
    if (isTestPrompt) {
      if (window.innerWidth <= 1024 || !open) {
        setOpen(true)
      }
      setTimeout(() => {
        onSendChat('test');
      }, 0);
    }
  }, [isTestPrompt])

  useEffect(() => {
    if (width <= 1024) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  }, [width])

  return (
    <>
      <div className={`
      flex gap-2 flex-col h-full p-2 border
      lg:!static absolute right-0 top-0 
      bg-background z-10
      ${open ? 'lg:min-w-[27%] lg:w-[27%] w-[80%] !fixed' : 'w-auto z-[8]'}
    `}>
        <div className="flex justify-between items-center">
          <Button variant="icon" size="icon" onClick={() => setOpen(!open)} disabled={isChat}>
            {open ?
              <BsTextIndentLeft className="text-2xl cursor-pointer" /> :
              <BsTextIndentRight className="text-2xl cursor-pointer" />
            }
          </Button>
          {
            open &&
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip delayDuration={400}>
                  <TooltipTrigger asChild>
                    <Button size='icon' variant='icon' disabled={!chatData.length || isChat} onClick={onTryLastOneAgain}>
                      <IoReload className='text-[#7c3aed]' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-60">{t('retry')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip delayDuration={400}>
                  <TooltipTrigger asChild>
                    <Button variant="icon" size="icon" disabled={isChat} onClick={onClearAllChatData}>
                      <FaRegTrashAlt className='text-red-500' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-60">{t('clearChatHistory')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="icon" size="icon" disabled={isChat}><LuSlidersHorizontal className='text-[#7c3aed]' /></Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="grid gap-5">
                    <div className="grid grid-cols-1 gap-2">
                      <span>{t('model')}</span>
                      {promptScheme === "DRAW" ? RenderingPaintingModels : RenderingModels}
                    </div>
                    {
                      promptScheme === "DRAW" ?
                        <div className='grid gap-5'>
                          <div className="grid grid-cols-1 gap-2">
                            <span>{t('resolution')}</span>
                            {RenderingImageResolution}
                          </div>
                          <div className='grid grid-cols-1 gap-2'>
                            <span className='min-w-max'>{t('quantity')}</span>
                            <Select value={`${imageNumber}`} onValueChange={(value) => useConfig((v) => ({ ...v, imageNumber: +value }))} disabled={isChat}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {[1, 2, 3, 4].map(key => (<SelectItem value={`${key}`} key={key}>{key}</SelectItem>))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </div> :
                        chatConfigList.map(item => (
                          <div className="grid grid-cols-1 gap-2" key={item.key}>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                {item.name}
                                <TooltipProvider>
                                  <Tooltip delayDuration={400}>
                                    <TooltipTrigger>
                                      <IoMdHelpCircleOutline className='text-lg text-slate-500' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-60">{item.tip}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className='px-1'>{chatConfig?.[item.key]}</div>
                            </div>
                            <Slider
                              max={1}
                              min={0}
                              step={0.1}
                              value={[chatConfig?.[item.key]]}
                              onValueChange={(value) => (useConfig((v) => ({ ...v, chatConfig: { ...v.chatConfig, [item.key]: value[0] } })))}
                            />
                          </div>
                        ))
                    }
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          }
        </div>

        {open && <MessageListView onRetry={onRetryData} />}

        {
          (open && promptScheme !== "DRAW") &&
          <div className={`flex border justify-between bg-background relative ${promptScheme === "DRAW" ? 'items-center' : 'items-end'}`}>
            <Textarea
              value={inputValue}
              placeholder={t('enterMessage')}
              disabled={isChat}
              className='border-0 min-h-[60px]'
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div onClick={handleSendMessage} className='cursor-pointer m-0 p-1'>
              {isChat ? <Loader2 className="h-[20px] w-[20px] animate-spin" /> : <IoSendSharp className='text-[#7c3aed]' />}
            </div>
          </div>
        }
      </div >
      {open && <div onClick={() => setOpen(false)} className="w-full lg:hidden block h-full fixed right-0 top-0 z-[9] backdrop-blur-sm" />}
    </>
  );
}
