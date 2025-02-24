'use server'

import { createAI302 } from '@302ai/ai-sdk';
import { createStreamableValue } from 'ai/rsc';
import { AnalyzeImagesPrompt, generateTitle, getPrompt } from './prompt';
import { CoreMessage, streamText, TextStreamPart, generateText, FinishReason } from 'ai';

const baseURL = process.env.NEXT_PUBLIC_API_URL

type AsyncIterableStream<T> = AsyncIterable<T> & ReadableStream<T>;

export async function optimizePrompt(formData: FormData) {

  const file = formData.get("file") as File;
  const type = formData.get("type") as string;
  const apiKey = formData.get("apiKey") as string;
  const content = formData.get("content") as string;
  const promptModel = formData.get("promptModel") as string;
  const modifyValue = formData.get("modifyValue") as string;
  const customPromptWords = formData.get("customPromptWords") as string;
  const messageRecordFormData = formData.get("messageRecord") as string;

  let messageRecord: Array<CoreMessage> = [];
  let messages: Array<CoreMessage> = []

  const stream = createStreamableValue<{
    type: string,
    textDelta?: string,
    logprobs?: FinishReason,
  }>({ type: 'text-delta', textDelta: '' })

  if (['RISE', 'O1-STYLE'].includes(type)) {
    const textDelta = getPrompt(type, content)[0].content as string;
    stream.update({ type: 'text-delta', textDelta });
    setTimeout(() => {
      stream.update({ type: 'logprobs', logprobs: 'stop' });
      stream.done()
    }, 0)
    return { output: stream.value };
  }

  if (messageRecordFormData) {
    messageRecord = JSON.parse(messageRecordFormData);
  }

  if (file) {
    messages = await AnalyzeImagesPrompt(file);
  } else {
    messages = getPrompt(type, content, customPromptWords, modifyValue);
  }
  console.log(messages);


  if (messageRecord.length) {
    messages = [
      ...messages,
      ...messageRecord,
    ]
  }
  console.log('======messages', messages);

  try {
    const model = createAI302({ baseURL, apiKey });
    (async () => {
      try {
        const { fullStream } = streamText({
          model: model.chatModel(promptModel),
          messages,
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

export const GeneratePromptWordTitle = async (params: { prompt: string, apiKey: string, promptModel: string }) => {
  const { prompt, apiKey, promptModel } = params
  try {
    const model = createAI302({ baseURL, apiKey });
    const { text } = await generateText({
      model: model.chatModel(promptModel),
      messages: generateTitle(prompt),
    });
    return { title: text };
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
