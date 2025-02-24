import { useAtom } from "jotai";
import { ICustomPrompt, userConfigAtom } from "@/stores";

const useDataSynchronization = () => {
    const [{ customPromptList }, setConfig] = useAtom(userConfigAtom);

    const onSynchronizeOffline = async (params: { customPromptData?: ICustomPrompt, isDelete?: boolean }) => {
        const { customPromptData, isDelete } = params
        let newCustomPromptList = customPromptList;
        if (customPromptData) {
            if (isDelete) {
                newCustomPromptList = newCustomPromptList.filter(f => f.id !== customPromptData.id)
            } else {
                newCustomPromptList.unshift(customPromptData)
            }
        }

        setConfig((v) => ({
            ...v,
            customPromptList: newCustomPromptList,
        }))
    }

    return { onSynchronizeOffline }
}

export default useDataSynchronization;