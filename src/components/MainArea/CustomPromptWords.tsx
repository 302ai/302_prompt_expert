import { useAtom } from "jotai"
import { userConfigAtom } from "@/stores"
import { Textarea } from "../ui/textarea"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function CustomPromptWords() {
    const t = useTranslations("promptList");

    const [open, setOpen] = useState(false)
    const [prompt, setPrompt] = useState('')
    const [{customPromptWords}, useConfig] = useAtom(userConfigAtom);

    const onSubmit = async () => {
        useConfig((v) => ({ ...v, customPromptWords: prompt }));
        setOpen(false)
    }

    useEffect(()=>{
        if(open){
            setPrompt(customPromptWords)
        }
    },[open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>{t('OptimizeInstructions')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t('PromptOptimizationInstruction')}</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <div className="flex flex-col gap-5">
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('OptimizeInstructionsPlaceholder')}
                        className='min-h-[200px] bg-transparent rounded-none'
                    />
                    <p className="text-xs text-slate-500">{t('placeholderDescription', { input: '{input}' })}</p>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={onSubmit}>{t('confirm')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
