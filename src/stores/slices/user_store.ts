import { IChat } from "@/components/Chat/indexDB";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export type ICustomPrompt = {
    id: string
    title: string;
    prompt: string;
    createdAt: string
}

export interface IModifyRecord {
    id: number;
    value: string;
    taskId?: string;
    isOriginalEdition?: boolean;
    status?: "fail" | "processing" | "queue" | "success" | "apikeyFail";
}

export interface ISpoResultData {
    best_prompt?: string;
    best_round?: number;
    error?: any;
    round_data_list?: {
        round: number,
        prompt: string,
        sample: [],
        success: boolean
    }[]
    status: "fail" | "processing" | "queue" | "success" | "apikeyFail";
}

export type UserConfigState = {
    // 选择的提示词
    promptScheme: string;
    // 提示词模型
    promptModel: string;
    // 聊天模型
    chatModel: string
    // 绘画模型
    paintingModel: string;
    // 自定义提示词
    customPromptList: ICustomPrompt[];
    // 提示词生成中
    isGenerate: boolean;
    // 聊天对话中
    isChat: boolean;
    // 聊天配置
    chatConfig: {
        topP: number;
        temperature: number;
        presencePenalty: number;
        frequencyPenalty: number;
    }
    // 修改记录
    modifyRecord: IModifyRecord[]
    // 当前记录
    currentRecord: IModifyRecord,
    // AI聊天记录
    chatData: IChat[],
    chatScroll: number,
    // 测试提示词
    isTestPrompt: boolean,
    // 生成图片数量
    imageNumber: number;
    // 图片分辨率
    aspectRatio: `${number}:${number}`
    // 自定义优化提示词
    customPromptWords: string;
    // 手动修改
    modifyValue: string;
    // 切换模板
    templateTab: number;
    // spo问答示例
    qaExample: {
        id: string;
        answer: string;
        question: string;
    }[];
    spoResultData: ISpoResultData | null;
    max_rounds: string;
};

export const userConfigAtom = atomWithStorage<UserConfigState>(
    "userConfig",
    {
        promptScheme: 'CRISPE',
        customPromptList: [],
        chatConfig: {
            topP: 1,
            temperature: 1,
            presencePenalty: 0,
            frequencyPenalty: 0,
        },
        modifyRecord: [{
            id: 1,
            value: '',
            isOriginalEdition: true,
        }],
        currentRecord: {
            id: 1,
            value: '',
            isOriginalEdition: true,
        },
        isGenerate: false,
        chatData: [],
        chatScroll: 0,
        promptModel: '',
        chatModel: '',
        isTestPrompt: false,
        imageNumber: 1,
        aspectRatio: '1:1',
        isChat: false,
        customPromptWords: '',
        modifyValue: '',
        templateTab: 0,
        paintingModel: 'flux-pro-v1.1',
        qaExample: [],
        spoResultData: null,
        max_rounds: '5',
    },
    createJSONStorage(() =>
        typeof window !== "undefined"
            ? sessionStorage
            : {
                getItem: () => null,
                setItem: () => null,
                removeItem: () => null,
            }
    ),
    {
        getOnInit: true,
    }
);
