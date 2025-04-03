import { useAtom } from "jotai"
import {  useEffect } from "react"
import { v4 as uuidV4 } from 'uuid'
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { userConfigAtom } from "@/stores"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { MdOutlineDelete } from "react-icons/md"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function QAExample() {
  const t = useTranslations('qaExample');
  const [{ qaExample, max_rounds }, useConfig] = useAtom(userConfigAtom);

  useEffect(() => {
    if (!qaExample || !qaExample.length) {
      const id = uuidV4();
      const data = { question: '', answer: '', id }
      useConfig((v) => ({ ...v, qaExample: [{ ...data }] }))
    }
  }, [])

  const onAddExample = () => {
    const id = uuidV4();
    const data = { question: '', answer: '', id }
    if (!qaExample || !qaExample.length) {
      useConfig((v) => ({ ...v, qaExample: [{ ...data }] }))
    } else {
      useConfig((v) => ({ ...v, qaExample: [...v.qaExample, { ...data }] }))
    }
  }

  const onDelExample = (id: string) => {
    if (qaExample.length > 1) {
      useConfig((v) => ({ ...v, qaExample: v.qaExample.filter(f => f.id !== id) }))
    }
  }

  const onSaveExample = (id: string, type: 'question' | 'answer', value: string) => {
    useConfig((v) => ({
      ...v,
      qaExample: v.qaExample.map(item => {
        if (item.id === id) {
          return { ...item, [type]: value }
        }
        return item;
      })
    }))
  }

  const onSaveMaxRounds = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || !isNaN(+value)) {
      useConfig((v) => ({ ...v, max_rounds: value }))
    }
  };

  const handleBlur = () => {
    if (+max_rounds < 2) {
      useConfig((v) => ({ ...v, max_rounds: '2' }))
    } else if (+max_rounds > 99) {
      useConfig((v) => ({ ...v, max_rounds: '99' }))
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{t('optimizationParameter')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle />
          <DialogDescription/>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3  max-h-[70vh]">
          <div className="w-full px-3 grid grid-cols-1 gap-2 border rounded-lg p-3">
            <span className="text-sm text-[#7c3aed] min-w-fit">{t('max_rounds')}</span>
            <Input value={max_rounds ||5} placeholder={t('max_rounds_tips')} onChange={onSaveMaxRounds} onBlur={handleBlur} />
          </div>
          <div className="w-full px-3 grid grid-cols-1 gap-3 border rounded-lg p-3 h-[calc(100%-102px)]">
            <span className="text-sm text-[#7c3aed] min-w-fit">{t('setQAExample')}({t('configureAtLeastOne')})</span>
            <div className='overflow-y-auto h-full flex flex-col items-center gap-3 w-full p-3'>
              {
                qaExample?.map(item => (
                  <div className="border rounded-lg w-full flex items-center gap-3 p-3" key={item.id}>
                    <div className=" grid grid-cols-1 gap-3 w-full">
                      <div className="flex items-center">
                        <span className="min-w-fit">{t('question')}</span>
                        <Textarea value={item.question} onChange={(e) => onSaveExample(item.id, 'question', e.target.value)} />
                      </div>
                      <div className="flex items-center">
                        <span className="min-w-fit">{t('answer')}</span>
                        <Textarea value={item.answer} onChange={(e) => onSaveExample(item.id, 'answer', e.target.value)} />
                      </div>
                    </div>
                    {
                      qaExample.length > 1 &&
                      <MdOutlineDelete onClick={() => onDelExample(item.id)} className="text-red-600 text-2xl cursor-pointer" />
                    }
                  </div>
                ))
              }
            </div>
            <Button className="w-full" onClick={onAddExample}>{t('addItem')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
