import dayjs from "dayjs"
import { toast } from "sonner"
import { useAtom } from "jotai"
import { v4 as uuidV4 } from 'uuid'
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { IoReload } from "react-icons/io5"
import { useTranslations } from 'next-intl'
import { ErrorToast } from "../ui/errorToast"
import CodeMirror from '@uiw/react-codemirror'
import { GeneratePop } from "./GeneratePop/page"
import { clearAllChatData } from "../Chat/indexDB"
import { GeneratePromptWordTitle } from "./service"
import { useEffect, useMemo, useState } from "react"
import { languages } from "@codemirror/language-data"
import { CustomPromptWords } from "./CustomPromptWords"
import { appConfigAtom, userConfigAtom } from "@/stores"
import { EditorView, ViewPlugin } from "@codemirror/view"
import useWindowSize from "@/hooks/global/use-window-size"
import { useCreatePromptLists } from "../RightMenu/constan"
import useDataSynchronization from "@/hooks/dataSynchronization"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const internationalModel = [
    'gpt-4o',
    'chatgpt-4o-latest',
    'claude-3-5-sonnet-20241022',
    'deepseek-chat',
    'gemini-2.0-pro-exp-02-05',
    'llama3.3-70b',
    'qwen-max-latest',
]
const domesticModel = ['deepseek-chat', 'qwen-max-latest']

export const MainArea = () => {
    const t = useTranslations('mainArea');
    const { width } = useWindowSize()

    const { OPTIMIZATION_PLAN } = useCreatePromptLists()
    const { onSynchronizeOffline } = useDataSynchronization();

    const [{ region, apiKey = '' }] = useAtom(appConfigAtom);
    const [{ promptScheme, modifyRecord, currentRecord, isGenerate, promptModel, isChat, modifyValue }, useConfig] = useAtom(userConfigAtom);

    const [tab, setTab] = useState(0)
    const [isSave, setIsSave] = useState(false)

    const scrollBottom = ViewPlugin.fromClass(
        class {
            update(update: any) {
                if (update.docChanged) {
                    update.view.scrollDOM.scrollTop = update.view.scrollDOM.scrollHeight;
                }
            }
        }
    );

    const onCopyPrompt = () => {
        navigator.clipboard.writeText(currentRecord.value).then(() => {
            toast(t('CopyTextOk'), { position: "top-right" })
        }, (err) => {
            toast(t('CopyTextError'), { position: "top-right" })
        });
    }

    const onTestPrompt = async () => {
        await clearAllChatData();
        useConfig((v) => ({ ...v, isTestPrompt: true, chatData: [] }))
    }

    const onSavePrompt = async () => {
        if (!currentRecord?.value?.trim().length) {
            return toast(t('PleaseEnterthePrompt'), { position: "top-right" })
        }
        setIsSave(true)
        try {
            const result = await GeneratePromptWordTitle({ apiKey, prompt: currentRecord.value, promptModel });
            if (result?.title) {
                await onSynchronizeOffline({
                    customPromptData: {
                        id: uuidV4(),
                        title: result.title,
                        prompt: currentRecord.value,
                        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
                    }
                })
                toast(t('saveSuccess'), { position: "top-right" })
                useConfig((v) => ({ ...v, templateTab: 1 }))
            } else if (result?.error?.err_code) {
                toast(() => (ErrorToast(result.error.err_code)), { position: "top-right" })
            } else {
                toast(t('saveError'), { position: "top-right" })
            }
        } catch (error) {
            toast(t('saveError'), { position: "top-right" })
        }
        setIsSave(false)
    }

    const onChangeTaskContent = (content: string) => {
        useConfig(v => ({
            ...v,
            currentRecord: { ...currentRecord, value: content },
            modifyRecord: modifyRecord.map(item => {
                if (item.id === currentRecord.id) {
                    return { ...item, value: content }
                }
                return item
            })
        }))
    }

    const RenderingModels = useMemo(() => {
        return (
            <Select value={promptModel} onValueChange={(value) => useConfig((v) => ({ ...v, promptModel: value }))}>
                <SelectTrigger className="w-[180px]">
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
    }, [promptModel, region])

    const RenderingRecord = useMemo(() => {
        return (
            <Select
                disabled={isGenerate}
                value={`${currentRecord.id}`}
                onValueChange={(value: string) => {
                    const data = modifyRecord.find(f => f.id === +value);
                    if (data) {
                        useConfig((v) => ({ ...v, currentRecord: { ...data } }))
                    }
                }}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {
                            modifyRecord?.map((item, index) => (
                                <SelectItem value={`${item.id}`} key={item.id}>
                                    {item?.isOriginalEdition ? t('originalVersion') : t('modificationVersion', { index })}
                                </SelectItem>
                            ))
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
        )
    }, [modifyRecord, currentRecord, isGenerate])

    const RenderingOptimizationPlan = useMemo(() => {
        return (
            <Select value={promptScheme} onValueChange={(value) => useConfig((v) => ({ ...v, promptScheme: value }))}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {OPTIMIZATION_PLAN?.map(item => (<SelectItem value={item.value} key={item.value}>{item.lable}</SelectItem>))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        )
    }, [promptScheme])

    useEffect(() => {
        if (region === '0' && !domesticModel.includes(promptModel)) {
            useConfig((v) => ({ ...v, promptModel: 'deepseek-chat' }))
        }
        if (!promptModel) {
            if (region === '0') {
                useConfig((v) => ({ ...v, promptModel: 'deepseek-chat' }))
            } else {
                useConfig((v) => ({ ...v, promptModel: 'gpt-4o' }))
            }
        }
    }, [region])

    return (
        <div className="flex flex-col justify-between gap-3 h-full">
            <div className="h-full overflow-y-auto">
                <CodeMirror
                    value={currentRecord?.value}
                    placeholder={promptScheme === 'DRAW' ? t('taskInputPlaceholderDRAW') : t('taskInputPlaceholder')}
                    extensions={[
                        markdown({ base: markdownLanguage, codeLanguages: languages }),
                        scrollBottom,
                        EditorView.lineWrapping,
                    ]}
                    onChange={onChangeTaskContent}
                    className="code-mirror h-full w-full text-sm border-0 rounded-none"
                    theme='dark'
                    basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                        highlightActiveLine: false,
                    }}
                    readOnly={isGenerate}
                />
            </div>

            <div className="border p-3 flex flex-col gap-5 bg-background">
                <div className="flex items-center text-base gap-5">
                    {[t('AutomaticOptimization'), t('ManualOptimization')].map((key, index) => (
                        <div
                            key={key}
                            onClick={() => setTab(index)}
                            className={`border-b-2 border-transparent pb-1 cursor-pointer ${tab === index && '!border-[#7c3aed] text-[#7c3aed]'}`}
                        >
                            {key}
                        </div>
                    ))}
                </div>
                {
                    tab === 0 &&
                    <div className="flex flex-col gap-2 px-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            {RenderingOptimizationPlan}
                            {RenderingModels}
                            {promptScheme === 'Customize' && <CustomPromptWords />}
                            {promptScheme === 'DRAW' && <GeneratePop type='painting' />}
                        </div>
                        <p className="text-xs text-slate-500 break-words">
                            <strong className="text-sm text-slate-700">{t('promptSchemeTip')}：</strong>
                            {OPTIMIZATION_PLAN?.find(f => f.value === promptScheme)?.tip || ''}
                        </p>
                    </div>
                }
                {
                    tab === 1 &&
                    <Textarea
                        value={modifyValue}
                        disabled={isGenerate}
                        placeholder={t('modificationInputPlaceholder')}
                        className='min-h-[120px] bg-transparent rounded-none'
                        onChange={(e) => useConfig((v) => ({ ...v, modifyValue: e.target.value }))}
                    />
                }
                <div className="w-full flex justify-end">
                    <GeneratePop type={tab === 1 ? 'modify' : 'generate'} />
                </div>
            </div>
            <div className={`flex items-center bg-background flex-wrap gap-2 border px-4 py-3 ${width <= 550 ? 'justify-center' : 'justify-between'}`}>
                {RenderingRecord}
                <div className="flex items-center flex-wrap gap-3">
                    <Button
                        onClick={onSavePrompt}
                        className='bg-black'
                        disabled={!currentRecord?.value.trim().length}
                    >
                        {isSave ? <IoReload className="animate-spin" /> : t('savePrompt')}
                    </Button>
                    <Button
                        onClick={onCopyPrompt}
                        className='bg-green-700'
                        disabled={!currentRecord?.value.trim().length}
                    >
                        {t('copyPrompt')}
                    </Button>
                    <Button
                        className='bg-blue-700'
                        onClick={onTestPrompt}
                        disabled={isGenerate || isChat || !currentRecord?.value.trim().length}
                    >
                        {t('testPrompt')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
