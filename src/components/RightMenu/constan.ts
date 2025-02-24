import { useTranslations } from "next-intl";
import { IconType } from "react-icons/lib";
import { RiCodeSSlashLine } from "react-icons/ri";
import { SlPencil } from "react-icons/sl";
import { SlSocialReddit } from "react-icons/sl";
import { SlPin } from "react-icons/sl";
import { SlList } from "react-icons/sl";
import { MdContentPaste } from "react-icons/md";
import { GiCharacter } from "react-icons/gi";
import { GrHost } from "react-icons/gr";
import { SlHourglass } from "react-icons/sl";
import { TbBrandStorybook } from "react-icons/tb";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { IoLanguage } from "react-icons/io5";
import { IoColorPaletteOutline } from "react-icons/io5";
import { GrAttachment } from "react-icons/gr";
import { SlDiamond } from "react-icons/sl";
import { SlAnchor } from "react-icons/sl";
import { SlSettings } from "react-icons/sl";
import { SlNote } from "react-icons/sl";
import { GrFlagFill } from "react-icons/gr";
import { SlMagicWand } from "react-icons/sl";
import { DiSqllite } from "react-icons/di";
import { MdQuestionMark } from "react-icons/md";
import { SlBriefcase } from "react-icons/sl";
import { SlBulb } from "react-icons/sl";
import { SlEnvolope } from "react-icons/sl";
import { SlBubbles } from "react-icons/sl";
import { SlBookOpen } from "react-icons/sl";
import { SlBadge } from "react-icons/sl";

export interface IPresetsPromptList {
    id: string,
    title: string,
    tip?: string,
    prompt: string,
    icon: IconType,
    createdAt?: string
}

export const useCreatePromptLists = () => {
    const t = useTranslations("promptList");

    const OPTIMIZATION_PLAN = [
        {
            value: 'CRISPE',
            lable: t('CRISPE.label'),
            tip: t('CRISPE.tip')
        },
        {
            value: 'CO-STAR',
            lable: t('CO-STAR.label'),
            tip: t('CO-STAR.tip')
        },
        {
            value: 'Meta Prompting',
            lable: t('MetaPrompting.label'),
            tip: t('MetaPrompting.tip')
        },
        {
            value: 'CoT',
            lable: t('CoT.label'),
            tip: t('CoT.tip')
        },
        {
            value: 'VARI',
            lable: t('VARI.label'),
            tip: t('VARI.tip')
        },
        {
            value: 'Q*',
            lable: t('QStar.label'),
            tip: t('QStar.tip')
        },
        {
            value: 'RISE',
            lable: t('RISE.label'),
            tip: t('RISE.tip')
        },
        {
            value: 'O1-STYLE',
            lable: t('O1STYLE.label'),
            tip: t('O1STYLE.tip')
        },
        {
            value: 'MicrOptimization',
            lable: t('MicrOptimization.label'),
            tip: t('MicrOptimization.tip')
        },
        {
            value: 'OpenAI',
            lable: t('OpenAI.label'),
            tip: t('OpenAI.tip')
        },
        {
            value: 'claude',
            lable: t('Claude.label'),
            tip: t('Claude.tip')
        },
        {
            value: 'DRAW',
            lable: t('DRAW.label'),
            tip: t('DRAW.tip')
        },
        {
            value: 'Complete Guide',
            lable: t('CompleteGuide.label'),
            tip: t('CompleteGuide.tip')
        },
        {
            value: 'Customize',
            lable: t('customize.label'),
            tip: t('customize.tip')
        }
    ];

    const PRESETS_PROMPT_LIST: IPresetsPromptList[] = [
        {
            id: 'Structured output',
            icon: RiCodeSSlashLine,
            title: t('StructuredOutput.label'),
            tip: t('StructuredOutput.tip'),
            prompt: t.raw('StructuredOutput.prompt'),
        },
        {
            id: 'CodeRewrite',
            icon: SlPencil,
            title: t('CodeRewrite.label'),
            tip: t('CodeRewrite.tip'),
            prompt: t.raw('CodeRewrite.prompt')
        },
        {
            id: 'CodeExplanation',
            icon: SlSocialReddit,
            title: t('CodeExplanation.label'),
            tip: t('CodeExplanation.tip'),
            prompt: t.raw('CodeExplanation.prompt')
        },
        {
            id: 'PromotionalSlogan',
            icon: SlPin,
            title: t('PromotionalSlogan.label'),
            tip: t('PromotionalSlogan.tip'),
            prompt: t.raw('PromotionalSlogan.prompt')
        },
        {
            id: 'ContentOutline',
            icon: SlList,
            title: t('ContentOutline.label'),
            tip: t('ContentOutline.tip'),
            prompt: t.raw('ContentOutline.prompt')
        },
        {
            id: 'ContentClassification',
            icon: MdContentPaste,
            title: t('ContentClassification.label'),
            tip: t('ContentClassification.tip'),
            prompt: t.raw('ContentClassification.prompt')
        },
        {
            id: 'RolePlay',
            icon: GiCharacter,
            title: t('RolePlay.label'),
            tip: t('RolePlay.tip'),
            prompt: t.raw('RolePlay.prompt')
        },
        {
            id: 'PromptGeneration',
            icon: GrHost,
            title: t('PromptGeneration.label'),
            tip: t('PromptGeneration.tip'),
            prompt: t.raw('PromptGeneration.prompt')
        },
        {
            id: 'timeTravelConsultant',
            icon: SlHourglass,
            title: t('timeTravelConsultant.title'),
            tip: t('timeTravelConsultant.tip'),
            prompt: t.raw('timeTravelConsultant.prompt')
        },
        {
            id: 'storyCreationAssistant',
            icon: TbBrandStorybook,
            title: t('storyCreationAssistant.title'),
            tip: t('storyCreationAssistant.tip'),
            prompt: t.raw('storyCreationAssistant.prompt')
        },
        {
            id: 'excelFormulaExpert',
            icon: PiMicrosoftExcelLogo,
            title: t('excelFormulaExpert.title'),
            tip: t('excelFormulaExpert.tip'),
            prompt: t.raw('excelFormulaExpert.prompt')
        },
        {
            id: 'SQLLanguageTranslator',
            icon: IoLanguage,
            title: t('SQLLanguageTranslator.title'),
            tip: t('SQLLanguageTranslator.tip'),
            prompt: t.raw('SQLLanguageTranslator.prompt')
        },
        {
            id: 'emotionalColorConverter',
            icon: IoColorPaletteOutline,
            title: t('emotionalColorConverter.title'),
            tip: t('emotionalColorConverter.tip'),
            prompt: t.raw('emotionalColorConverter.prompt')
        },
        {
            id: 'metaphoricalMaster',
            icon: GrAttachment,
            title: t('metaphoricalMaster.title'),
            tip: t('metaphoricalMaster.tip'),
            prompt: t.raw('metaphoricalMaster.prompt')
        },
        {
            id: 'guessingRiddles',
            icon: SlDiamond,
            title: t('guessingRiddles.title'),
            tip: t('guessingRiddles.tip'),
            prompt: t('guessingRiddles.prompt')
        },
        {
            id: 'scienceFictionSceneSimulator',
            icon: SlAnchor,
            title: t('scienceFictionSceneSimulator.title'),
            tip: t('scienceFictionSceneSimulator.tip'),
            prompt: t.raw('scienceFictionSceneSimulator.prompt')
        },
        {
            id: 'adaptiveEditor',
            icon: SlSettings,
            title: t('adaptiveEditor.title'),
            tip: t('adaptiveEditor.tip'),
            prompt: t.raw('adaptiveEditor.prompt')
        },
        {
            id: 'productTweetGeneration',
            icon: SlNote,
            title: t('productTweetGeneration.title'),
            tip: t('productTweetGeneration.tip'),
            prompt: t.raw('productTweetGeneration.prompt')
        },
        {
            id: 'idiomInterpreter',
            icon: GrFlagFill,
            title: t('idiomInterpreter.title'),
            tip: t('idiomInterpreter.tip'),
            prompt: t.raw('idiomInterpreter.promot')
        },
        {
            id: 'dreamInterpretationExpert',
            icon: SlMagicWand,
            title: t('dreamInterpretationExpert.title'),
            tip: t('dreamInterpretationExpert.tip'),
            prompt: t.raw('dreamInterpretationExpert.prompt')
        },
        {
            id: 'ArticlePolisher',
            icon: DiSqllite,
            title: t('ArticlePolisher.title'),
            tip: t('ArticlePolisher.tip'),
            prompt: t.raw('ArticlePolisher.prompt')
        },
        {
            id: 'PhilosophicalReflection',
            icon: MdQuestionMark,
            title: t('PhilosophicalReflection.title'),
            tip: t('PhilosophicalReflection.tip'),
            prompt: t.raw('PhilosophicalReflection.prompt')
        },
        {
            id: 'InterviewQuestionGenerator',
            icon: SlBriefcase,
            title: t('InterviewQuestionGenerator.title'),
            tip: t('InterviewQuestionGenerator.tip'),
            prompt: t.raw('InterviewQuestionGenerator.prompt')
        },
        {
            id: 'MultilingualSuperpower',
            icon: SlBulb,
            title: t('MultilingualSuperpower.title'),
            tip: t('MultilingualSuperpower.tip'),
            prompt: t.raw('MultilingualSuperpower.prompt')
        },
        {
            id: 'EmailExtractor',
            icon: SlEnvolope,
            title: t('EmailExtractor.title'),
            tip: t('EmailExtractor.tip'),
            prompt: t.raw('EmailExtractor.prompt')
        },
        {
            id: 'FunQAGenerator',
            icon: SlBubbles,
            title: t('FunQAGenerator.title'),
            tip: t('FunQAGenerator.tip'),
            prompt: t.raw('FunQAGenerator.prompt')
        },
        {
            id: 'DataOrganizer',
            icon: SlBookOpen,
            title: t('DataOrganizer.title'),
            tip: t('DataOrganizer.tip'),
            prompt: t.raw('DataOrganizer.prompt')
        },
        {
            id: 'RatingExperts',
            icon: SlBadge,
            title: t('RatingExperts.title'),
            tip: t('RatingExperts.tip'),
            prompt: t.raw('RatingExperts.prompt')
        },
    ];

    return { OPTIMIZATION_PLAN, PRESETS_PROMPT_LIST };
};

