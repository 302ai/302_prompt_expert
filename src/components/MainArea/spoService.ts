import { ISpoResultData } from "@/stores";
import ky from "ky";

interface ISpoOptimize {
  qa: { question: string, answer: string, id: string }[],
  prompt: string,
  model: string,
  apiKey: string,
  max_rounds: number,
}
const baseURL = process.env.NEXT_PUBLIC_API_URL
export const onGetSpoOptimizeTask = async (
  task_id: string,
  apiKey: string,
  onTaskResult: (data: ISpoResultData & { task_id?: string }) => void,
) => {
  const taskResult = await getSpoOptimizeTask({ taskId: task_id, apiKey });
  if (['success', 'fail', 'apikeyFail'].indexOf(taskResult.status) === -1) {
    setTimeout(() => {
      onGetSpoOptimizeTask(task_id, apiKey, onTaskResult);
    }, 5000)
  }
  onTaskResult({ ...taskResult, task_id })
}

export async function spoOptimize(
  params: ISpoOptimize,
  onAction: {
    onTaskResult: (data: ISpoResultData & { task_id?: string }) => void,
    onResult: (data: { task_id?: string }) => void,
    onError: (error: any) => void,
  }
) {
  const { qa, prompt, model, apiKey, max_rounds } = params;
  const { onTaskResult, onResult, onError } = onAction
  try {
    const result: { task_id: string } = await ky.post(`${baseURL}/302/prompt/spo/submit`, {
      timeout: false,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        qa,
        model,
        prompt,
        max_rounds,
      })
    }).then(res => res.json())
    if (result?.task_id) {
      onResult({ task_id: result.task_id });
      onGetSpoOptimizeTask(result.task_id, apiKey, onTaskResult);
    }
  } catch (error: any) {
    try {
      if (error.response) {
        const errorData = await error.response.json();
        return onError({ ...errorData })
      }
      return onError({ error: 'Generation failed' })
    } catch (error) {
      return onError({ error: 'Generation failed' })
    }
  }
}

export async function getSpoOptimizeTask(params: { taskId: string, apiKey: string }): Promise<ISpoResultData> {
  const { taskId, apiKey } = params
  try {
    const result: ISpoResultData = await ky.get(`${baseURL}/302/prompt/spo/tasks/${taskId}`, {
      timeout: false,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }).then(res => res.json())
    return result;
  } catch (error: any) {
    try {
      if (error.response) {
        const errorData = await error.response.json();
        console.log(errorData);
        return { ...errorData, status: 'apikeyFail' };
      }
      return { error: 'Generation failed', status: 'apikeyFail' }
    } catch (error) {
      return { error: 'Generation failed', status: 'apikeyFail' }
    }
  }
}
