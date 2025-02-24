'use server'

import ky from 'ky';
import { createOpenAI } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { streamText, TextStreamPart } from 'ai';
import { LanguageModelV1LogProbs } from '@ai-sdk/provider';

interface IPrames {
  type: string
  content: string
  customText: string
  apiKey: string;
  model: string;
  messages: { role: 'user' | 'assistant', content: string }[];
}

type AsyncIterableStream<T> = AsyncIterable<T> & ReadableStream<T>;


export async function chat(params: IPrames) {
  const { messages, type, content, customText, apiKey, model } = params;

  const stream = createStreamableValue<{
    type: string,
    textDelta?: string,
    logprobs?: LanguageModelV1LogProbs,
  }>({ type: 'text-delta', textDelta: '' })
  try {
    const openai = createOpenAI({
      apiKey,
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/v1`,
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input instanceof URL ? input : new URL(input.toString())
        try {
          return await ky(url, {
            ...init,
            retry: 0,
            timeout: false,
          })
        } catch (error: any) {
          if (error.response) {
            const errorData = await error.response.json();
            stream.error({ message: errorData })
          } else {
            stream.error({ message: error })
          }
          return error;
        }
      },
    });
    (async () => {
      try {
        const { fullStream } = streamText({
          model: openai(model),
          messages: messages,
        });
        const onGetResult = async (fullStream: AsyncIterableStream<TextStreamPart<any>>) => {
          for await (const chunk of fullStream) {
            if (chunk.type === 'text-delta') {
              stream.update({ type: 'text-delta', textDelta: chunk.textDelta })
            } else if (chunk.type === 'finish') {
              stream.update({ type: 'logprobs', logprobs: chunk.logprobs })
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