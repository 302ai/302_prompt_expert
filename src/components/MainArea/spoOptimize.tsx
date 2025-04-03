import { toast } from "sonner"
import { useAtom } from "jotai"
import { Loader2 } from "lucide-react"
import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { ErrorToast } from "../ui/errorToast"
import { EditorView } from "@codemirror/view"
import CodeMirror from '@uiw/react-codemirror'
import { Button } from "@/components/ui/button"
import { languages } from "@codemirror/language-data"
import { onGetSpoOptimizeTask, spoOptimize } from "./spoService"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { appConfigAtom, IModifyRecord, ISpoResultData, userConfigAtom } from "@/stores"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function SpoOptimize() {
  const t = useTranslations('spoOptimize');

  const [{ apiKey }] = useAtom(appConfigAtom);
  const [{ currentRecord, promptModel, modifyRecord, qaExample, isGenerate, spoResultData, max_rounds }, setConfig] = useAtom(userConfigAtom);

  const [open, setOpen] = useState(false);
  const [isLoad, setIsLoad] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const onSpoOptimize = async () => {
    if (!qaExample || !qaExample.length) {
      return toast.warning(t('configureAtLeastOne'))
    }
    const recordId = modifyRecord.length + 1;
    await spoOptimize({
      qa: qaExample,
      model: promptModel,
      apiKey: apiKey || '',
      max_rounds: +max_rounds || 5,
      prompt: currentRecord.value,
    }, {
      onResult: ((result) => {
        if (result?.task_id) {
          const data: IModifyRecord = {
            id: recordId,
            status: 'processing',
            taskId: result.task_id,
            value: '',
          }
          setConfig((v) => ({
            ...v,
            modifyRecord: [...v.modifyRecord, { ...data }],
            currentRecord: { ...data },
          }))
        }
      }),
      onTaskResult: ((result) => onTaskResult(result, recordId)),
      onError: ((error) => {
        if (error?.error?.err_code) {
          toast(() => (ErrorToast(error?.error?.err_code)), { position: "top-right" })
        } else {
          toast(t('GenerationFailed'), { position: "top-right" })
        }
        if (currentRecord.id === recordId) {
          setConfig((v) => ({
            ...v,
            isGenerate: false,
            currentRecord: v.modifyRecord[v.modifyRecord.length - 1],
            modifyRecord: v.modifyRecord.filter(f => f.id !== recordId),
          }))
        } else {
          setConfig((v) => ({
            ...v,
            isGenerate: false,
          }))
        }
        setIsLoad(false)
      })
    });
  }

  const onGetAction = async () => {
    if (!spoResultData || (spoResultData?.status && ['processing', 'queue'].indexOf(spoResultData?.status) !== -1)) {
      setIsLoad(true)
      setConfig((v) => ({ ...v, isGenerate: true }));
    }
    if (currentRecord?.taskId && currentRecord?.status === 'processing') {
      if (spoResultData && ['processing', 'queue'].indexOf(spoResultData?.status) !== -1 || !spoResultData) {
        await onGetSpoOptimizeTask(currentRecord.taskId, apiKey || '', onTaskResult)
      } else if (spoResultData?.status === 'success') {
        setOpen(true);
      }
    } else {
      await onSpoOptimize();
    }
  }

  const onTaskResult = (result: ISpoResultData & { task_id?: string }, id?: number) => {
    if (result?.error) {
      if (result?.error?.err_code) {
        toast(() => (ErrorToast(result?.error?.err_code)), { position: "top-right" })
      } else {
        toast(t('GenerationFailed'), { position: "top-right" })
      }
      setConfig((v) => ({ ...v, isGenerate: false }));
      setIsLoad(false)
      const recordId = id || currentRecord.id;
      setConfig((v) => ({
        ...v,
        isGenerate: false,
        spoResultData: null,
        currentRecord: v.modifyRecord[v.modifyRecord.length - 2],
        modifyRecord: v.modifyRecord.filter(f => f.id !== recordId),
      }))
      return;
    }
    setOpen(true);
    setConfig((v) => ({ ...v, spoResultData: result }));
    if (['fail', 'success'].indexOf(result?.status) !== -1) {
      setConfig((v) => ({ ...v, isGenerate: false }));
      setIsLoad(false)
      scrollToBottom('start', result?.best_round || 1);
    } else {
      scrollToBottom('end');
    }
  }

  const onUsePrompt = (prompt?: string) => {
    const data: IModifyRecord = {
      ...currentRecord,
      status: 'success',
      value: prompt || '',
    }
    setConfig((v) => ({
      ...v,
      spoResultData: null,
      currentRecord: { ...data },
      modifyRecord: v.modifyRecord.map(f => {
        if (f.id === data.id) {
          console.log(data);
          return { ...data }
        }
        return { ...f }
      }),
    }));
    setOpen(false)
  }

  const butDisabled = () => {
    if ((currentRecord?.taskId && currentRecord?.status === 'processing' && !isLoad)) {
      return false;
    }
    if (isGenerate || !currentRecord.value?.trim()?.length || isLoad) {
      return true;
    }
  }

  const scrollToBottom = (block: ScrollLogicalPosition, round?: number) => {
    setTimeout(() => {
      const scrollableDiv = messagesEndRef.current;
      if (scrollableDiv) {
        let targetElement = scrollableDiv.lastElementChild;
        if (round) {
          targetElement = scrollableDiv.querySelector(`[data-round="${round}"]`);
        }
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block });
        }
      }
    }, 100)
  };

  const onOpenChange = (o: boolean) => {
    if (!o && spoResultData?.status === 'success' && !isLoad) {
      setOpen(false)
    }
  }

  const onCancelTask = () => {
    setConfig((v) => ({
      ...v,
      isGenerate: false,
      spoResultData: null,
      currentRecord: v.modifyRecord[v.modifyRecord.length - 2],
      modifyRecord: v.modifyRecord.filter(f => f.id !== currentRecord.id),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center p-0" variant='ghost' disabled={butDisabled()}>
          <div className="flex items-center gap-5">
            <div className='cursor-pointer bg-[#7c3aed] rounded-md px-4 py-2 text-white hover:bg-[#9056f4] flex items-center' onClick={onGetAction}>
              {(currentRecord?.taskId && currentRecord?.status === 'processing' && !open) ? t('ObtainResults') : t('optimize')}
              {isLoad && <Loader2 className="h-[20px] w-[20px] animate-spin" />}
            </div>
            {
              (currentRecord?.taskId && currentRecord?.status === 'processing' && !open) &&
              <div className='cursor-pointer bg-[#7c3aed] rounded-md px-5 py-2 text-white hover:bg-[#9056f4]' onClick={onCancelTask}>
                {t('cancel')}
              </div>
            }
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle />
          <DialogDescription className="text-[#7c3aed] flex items-center">
            {
              spoResultData?.status === 'success' ? t('optimize_tips_success') :
                t('optimize_tips')
            }
            {spoResultData?.status === 'processing' && <Loader2 className="h-[20px] w-[20px] animate-spin" />}
          </DialogDescription>
        </DialogHeader>
        <div className='overflow-y-auto max-h-[70vh] flex flex-col items-center gap-5 w-full p-3' ref={messagesEndRef}>
          {
            spoResultData?.round_data_list?.map((item, index) => (
              item?.sample.length > 0 ?
                <div className={`border rounded-lg w-full p-3 ${item.round === spoResultData?.best_round && 'border-[#7c3aed]'}`} key={item?.round || index}>
                  <div className="grid grid-cols-1 justify-items-end gap-3 w-full">
                    <div className="grid grid-cols-1 gap-3 w-full">
                      {item.round === spoResultData?.best_round && <span className="text-sm text-[#7c3aed]">{t('best_prompt')}</span>}
                      <CodeMirror
                        value={item.prompt}
                        extensions={[
                          markdown({ base: markdownLanguage, codeLanguages: languages }),
                          EditorView.lineWrapping,
                        ]}
                        className="code-mirror w-full text-sm border-0 rounded-none max-h-[210px]"
                        theme='light'
                        basicSetup={{
                          lineNumbers: false,
                          foldGutter: false,
                          highlightActiveLine: false,
                        }}
                        readOnly={true}
                      />
                    </div>
                    {
                      spoResultData.status === 'success' &&
                      <Button size='sm' className="w-fit" onClick={() => onUsePrompt(item?.prompt)}>{t('use_prompt')}</Button>
                    }
                  </div>
                </div> : <></>
            ))
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}
