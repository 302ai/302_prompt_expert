import { useTranslations } from "next-intl";

export const useChatConfiguration = () => {
    const t = useTranslations("chat");
    const chatConfigList: {
        key: 'topP' | 'temperature' | 'presencePenalty' | 'frequencyPenalty',
        name: string;
        tip: string
    }[] = [
            {
                key: 'topP',
                name: t('topP'),
                tip: t('topPTip'),
            },
            {
                key: 'temperature',
                name: t('temperature'),
                tip: t('temperatureTip'),
            },
            {
                key: 'presencePenalty',
                name: t('presencePenalty'),
                tip: t('presencePenaltyTip'),
            },
            {
                key: 'frequencyPenalty',
                name: t('frequencyPenalty'),
                tip: t('frequencyPenaltyTip'),
            }
        ]
    return { chatConfigList }
}
