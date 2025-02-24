"use server"

import { createAI302 } from '@302ai/ai-sdk';
import { experimental_generateImage as generateImage, CoreMessage, streamText, TextStreamPart, FinishReason } from 'ai';
import { createStreamableValue, StreamableValue } from 'ai/rsc';
import ky from 'ky';
import path from 'path';


export interface IStreamableValue {
    output: StreamableValue<{
        type: string;
        textDelta?: string;
        logprobs?: FinishReason;
    }, any>;
}

interface IPrames {
    type: 'chat' | 'painting'
    chatModel: string
    paintingModel: string;
    apiKey: string
    paintingPrompt: string
    messages?: Array<CoreMessage>;
    imageNumber: number,
    aspectRatio: `${number}:${number}`;
    chatConfig: {
        topP: number;
        temperature: number;
        presencePenalty: number;
        frequencyPenalty: number;
    }
}

type AsyncIterableStream<T> = AsyncIterable<T> & ReadableStream<T>;

const baseURL = process.env.NEXT_PUBLIC_API_URL

export async function onChat(params: IPrames) {
    const { type } = params;
    if (type === 'chat') {
        return await onGenerateText(params)
    } else {
        return await onTestingPainting(params)
    }
}

// 生成文本
const onGenerateText = async (params: IPrames) => {
    const { messages, apiKey, chatModel, chatConfig } = params;
    const stream = createStreamableValue<{
        type: string,
        textDelta?: string,
        logprobs?: FinishReason,
    }>({ type: 'text-delta', textDelta: '' })

    try {
        const model = createAI302({ baseURL, apiKey });
        (async () => {
            try {
                const { fullStream } = streamText({
                    model: model.chatModel(chatModel),
                    messages,
                    ...chatConfig,
                });
                const onGetResult = async (fullStream: AsyncIterableStream<TextStreamPart<any>>) => {
                    for await (const chunk of fullStream) {
                        if (chunk.type === 'text-delta') {
                            stream.update({ type: 'text-delta', textDelta: chunk.textDelta })
                        } else if (chunk.type === 'finish') {
                            stream.update({ type: 'logprobs', logprobs: chunk.finishReason })
                        } else if (chunk.type === 'error') {
                            try {
                                // @ts-expect-error This is expected to fail due to type mismatch.
                                if (chunk?.error?.responseBody) {
                                    // @ts-expect-error This is expected to fail due to type mismatch.
                                    const errorData = JSON.parse(chunk?.error?.responseBody);
                                    stream.error({ message: { ...errorData } });
                                }
                                stream.error({ message: 'Generation failed' });
                            } catch (error) {
                                stream.error({ message: 'Generation failed' });
                            }
                        }
                    }
                }
                await onGetResult(fullStream)
                stream.done()
            } catch (error) {
                stream.done()
                stream.error({ message: 'Initialization error' })
            }
        })();
    } catch (error) {
        stream.done()
        stream.error({ message: 'Initialization error' })
    }
    return { output: stream.value }
}

// // 绘画
const onTestingPainting = async (params: IPrames) => {
    const { apiKey, paintingPrompt, imageNumber, aspectRatio, paintingModel } = params;
    const TEST_PROMPT = 'A burrito launched through a tunnel';
    const imagesToUpload: Array<{ data: Uint8Array; filename: string }> = [];
    const resultImage = [];

    try {
        const model = createAI302({ baseURL, apiKey });

        const result = await generateImage({
            // @ts-expect-error type mismatch
            model: model.image(paintingModel || 'flux-pro-v1.1'),
            prompt: paintingPrompt || TEST_PROMPT,
            aspectRatio,
            seed: 0,
            n: imageNumber,
        });
        for (const [index, image] of result.images.entries()) {
            const filename = path.join('flux-pro-v1.1', `image-${index}.png`);
            imagesToUpload.push({ data: image.uint8Array, filename });
            console.log(`Image saved to ${filename}`);
        }
        // Upload each image
        for (const { data, filename } of imagesToUpload) {
            const formData = new FormData();
            formData.append('file', new Blob([data]), path.basename(filename));
            const uploadedUrl = await onUploadImage(formData);
            resultImage.push(uploadedUrl)
        }
        return { resultImage };
    } catch (error: any) {
        try {
            if (error.responseBody) {
                const errorData = JSON.parse(error.responseBody);
                return { ...errorData }
            }
            return { error: 'Generation failed' }
        } catch (error) {
            return { error: 'Generation failed' }
        }
    }
}

const onUploadImage = async (formData: FormData) => {
    try {
        const imageResult: any = await ky(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/gpt/api/upload/gpt/image`, {
            method: 'POST',
            body: formData,
            timeout: false,
        }).then(res => res.json());
        if (imageResult?.data?.url) {
            return imageResult?.data?.url;
        } else {
            return '';
        }
    } catch (error) {
        return '';
    }
};