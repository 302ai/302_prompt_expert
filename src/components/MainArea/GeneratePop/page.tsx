import { toast } from "sonner"
import { useAtom } from "jotai"
import { CoreMessage } from "ai"
import { Loader2 } from "lucide-react"
import { IoMdClose } from "react-icons/io"
import { useTranslations } from "next-intl"
import { optimizePrompt } from "../service"
import { readStreamableValue } from "ai/rsc"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { extractCodeBlocksContent } from "@/lib/utils"
import { ErrorToast } from "@/components/ui/errorToast"
import { appConfigAtom, userConfigAtom } from "@/stores"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface ITask {
  id: number;
  current: string;
  topic: string;
  options: string[];
  progress: number;
  selectOptions: string[];
  assistant: string;
}

export function GeneratePop(props: { type: 'painting' | 'generate' | 'modify', modifyValue?: string }) {
  const t = useTranslations('promptList');

  const [{ apiKey }] = useAtom(appConfigAtom);
  const [{ promptScheme, isGenerate, currentRecord, modifyRecord, promptModel, customPromptWords, modifyValue }, setConfig] = useAtom(userConfigAtom);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [task, setTask] = useState<Partial<ITask>>({});
  const [isLoad, setIsLoad] = useState({ modify: false, painting: false, generate: false, next: false });

  // 接口请求
  const onGenerate = async (actionType: 'generate' | 'modify' | 'painting' | 'next', file?: File) => {
    const taskId = tasks.length + 1;
    const recordId = modifyRecord.length + 1;
    
    let chatValue = '';
    let content = currentRecord.value;
    let messageRecord: Array<CoreMessage> = [];

    if (promptScheme === 'Customize' && !customPromptWords?.trim()?.length) {
      toast.warning(t('OptimizeInstructionsTip'), { position: "top-right" });
      return;
    }

    if (actionType === 'modify' && !modifyValue?.trim().length) {
      toast.warning(t('modificationInputPlaceholder'), { position: "top-right" });
      return;
    }

    try {
      setConfig((v) => ({ ...v, isGenerate: true }));
      setIsLoad((v) => ({ ...v, [actionType]: true }));

      // 下一步继续优化
      if (actionType === 'next') {
        if (!task?.selectOptions?.length) {
          toast.warning(t('OptimizationDirection'), { position: "top-right" });
          return;
        }
        content = currentRecord.value;
        messageRecord = tasks.map(item => {
          return [
            { role: "assistant", content: item.assistant },
            { role: "user", content: item.selectOptions.join('、') },
          ]
        }).flat() as Array<CoreMessage>;
      }

      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', actionType === 'modify' ? actionType : promptScheme);
      formData.append('promptModel', promptModel);
      formData.append('messageRecord', JSON.stringify(messageRecord));

      if (file) { formData.append('file', file) }
      if (apiKey) { formData.append('apiKey', apiKey) }

      if (promptScheme === 'Customize') {
        formData.append('customPromptWords', customPromptWords);
      }
      if (actionType === 'modify') {
        formData.append('modifyValue', modifyValue);

      }
      const result = await optimizePrompt(formData);

      if (result?.output) {
        let textDelta = ''
        for await (const delta of readStreamableValue(result.output)) {
          if (delta?.type === 'text-delta') {
            textDelta += delta?.textDelta;
            const translateContent = extractCodeBlocksContent(textDelta)[0]
            if (promptScheme !== 'Complete Guide') {
              if (translateContent?.length) {
                setConfig((v) => ({
                  ...v,
                  currentRecord: {
                    id: recordId,
                    value: translateContent,
                  },
                }))
              }
            }
          } else if (delta?.type === 'logprobs') {
            chatValue = extractCodeBlocksContent(textDelta)[0] || textDelta;
            if (promptScheme === 'Complete Guide') {
              const data = extractJson(chatValue)
              if (!data) {
                toast.error(t('GenerationFailed'), { position: "top-right" })
              } else {
                const taskData = { ...data, assistant: chatValue, selectOptions: [], id: taskId }
                setTask({ ...taskData });
                setTasks((v) => ([...v, { ...taskData }]))
                setOpen(true);
              }
            } else {
              setConfig((v) => ({
                ...v, modifyRecord: [...v.modifyRecord, {
                  id: recordId,
                  value: chatValue,
                }],
                currentRecord: {
                  id: recordId,
                  value: chatValue,
                },
              }))
            }
          }
        }
      }
    } catch (error: any) {
      if (error?.message?.error?.err_code) {
        toast(() => (ErrorToast(error.message.error.err_code)), { position: "top-right" })
      } else {
        toast(t('GenerationFailed'), { position: "top-right" })
      }
    }
    setConfig((v) => ({ ...v, isGenerate: false }))
    setIsLoad((v) => ({ ...v, [actionType]: false }))
  }

  // 渲染按钮
  const onRenderingButton = () => {

    const handleChooseImageClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const onGeneratePromptImageFunc = async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      const noNotSupportedType = ['svg', 'ico', 'x-icon', 'icon'];
      if (file) {
        if (noNotSupportedType.some(s => file.type.indexOf(s) > -1)) {
          toast.warning('暂不支持当前图片格式', { position: "top-right" });
        } else {
          onGenerate('painting', file)
        }
      }
      if (fileInputRef?.current) {
        fileInputRef.current.value = '';
      }
    }

    switch (props.type) {
      case 'painting':
        return <Button disabled={isGenerate} onClick={handleChooseImageClick}>
          <input type="file" id="fileInput" accept="image/*" ref={fileInputRef} className='hidden' onChange={onGeneratePromptImageFunc} />
          {t('selectImage')}
          {isLoad.painting && <Loader2 className="h-[20px] w-[20px] animate-spin" />}
        </Button>
      default:
        return <Button onClick={() => onGenerate(props.type)} disabled={isGenerate || !currentRecord.value?.trim()?.length}>
          {t('optimize')}
          {(isLoad.generate || isLoad.modify) && <Loader2 className="h-[20px] w-[20px] animate-spin" />}
        </Button>
    }
  }

  // 上一步任务结果
  const onPreviousStep = () => {
    const currentTask = tasks[tasks.length - 2];
    setTask({ ...currentTask })
    setTasks((v) => v.filter((f, index) => index < tasks.length - 1))
  }

  // 完成任务
  const onOutputResult = () => {
    const id = modifyRecord.length ? modifyRecord.length + 1 : 1;
    setConfig((v) => ({
      ...v,
      modifyRecord: modifyRecord.length ? [...v.modifyRecord, {
        id,
        value: task?.current || '',
        isOriginalEdition: false
      }] : [{
        id: 1,
        value: task?.current || '',
        isOriginalEdition: true,
      }],
      currentRecord: {
        id,
        value: task?.current || '',
        isOriginalEdition: true,
      },
    }))
    setOpen(false)
  }

  // 选择优化方向
  const onSelectOptions = (key: string) => {
    let selectOptions = [];
    if (!task?.selectOptions?.includes(key)) {
      if (task.selectOptions) {
        selectOptions = [...task?.selectOptions, key]
      } else {
        selectOptions = [key]
      }
    } else {
      selectOptions = task.selectOptions.filter(f => f !== key)
    }
    setTask(v => ({ ...v, selectOptions }))
    setTasks((v) => v.map(f => {
      if (f.id === task?.id) {
        return { ...f, selectOptions }
      }
      return f
    }))
  }

  // 解析字符串获取任务数据字段
  const extractJson = (input: string): ITask | null => {
    const jsonMatch = input.match(/{[\s\S]*}/); // 使用正则匹配JSON部分
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]); // 解析JSON字符串为对象
      } catch (error) {
        console.error("JSON解析失败:", error);
      }
    } else {
      console.error("未找到JSON部分");
    }
    return null;
  };

  useEffect(() => {
    if (!open) {
      setTask(() => ({}));
      setTasks(() => ([]));
      setConfig((v) => ({ ...v, isGenerate: false }))
      setIsLoad({ modify: false, painting: false, generate: false, next: false });
    }
  }, [open])

  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger asChild>
        {onRenderingButton()}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="hidden">
          <AlertDialogTitle />
          <AlertDialogDescription />
        </AlertDialogHeader>
        <div className='absolute right-1 top-1 cursor-pointer' onClick={() => setOpen(false)}>
          <IoMdClose className="text-2xl" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {
            task.progress !== 100 ?
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="font-bold">{t('currentVersionPrompt')}：</span>
                  <div className="text-sm text-slate-600 max-h-[150px] overflow-y-auto px-2 py-1">{task.current}</div>
                </div>
                <div>
                  <span className="font-bold">{t('currentOptimizationTheme')}：</span>
                  <span className="text-sm text-slate-600">{task.topic}</span>
                </div>
                <div className="border rounded-[6px] border-dashed p-2 border-[#7c3aed]">
                  <p className="mb-1"><span className="text-red-600">*</span>{t('selectOptimizationDirection')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {
                      tasks.find(f => f.id === task.id)?.options.map((key, index) => (
                        <div
                          key={`${key}-${index}`}
                          onClick={() => onSelectOptions(key)}
                          className={`
                            hover:border-[#7c3aed] hover:text-[#7c3aed] 
                              cursor-pointer border rounded-[6px] text-center py-2
                              ${task?.selectOptions?.includes(key) && 'border-[#7c3aed] text-[#7c3aed]'}
                          `}
                        >
                          {key}
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div className="flex items-center gap-5 justify-between">
                  <div className="min-w-fit">{t('taskProgress')}</div>
                  <Slider value={task?.progress ? [+task?.progress] : []} max={100} />
                </div>
              </div> :
              <div>
                <span className="font-bold">{t('finalVersionPrompt')}：</span>
                <div className="text-sm text-slate-600 max-h-[150px] overflow-y-auto px-2 py-1">{task.current}</div>
              </div>
          }
        </div>
        <AlertDialogFooter>
          {
            tasks.length > 1 &&
            <Button disabled={isGenerate} onClick={onPreviousStep}>{t('previousStep')}</Button>
          }
          {
            task.progress !== 100 &&
            <Button disabled={isGenerate} onClick={() => onGenerate('next')}>
              {t('nextStep')}
              {isLoad.next && <Loader2 className="h-[20px] w-[20px] animate-spin" />}
            </Button>
          }
          <Button onClick={onOutputResult}>
            {task?.progress === 100 ? t('outputFinalPrompt') : t('complete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
