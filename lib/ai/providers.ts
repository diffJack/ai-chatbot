import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openai('deepseek/deepseek-v3-0324'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openai('deepseek/deepseek-v3-0324'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openai('deepseek/deepseek-v3-0324'),
        'artifact-model': openai('deepseek/deepseek-v3-0324'),
      },
      imageModels: {
        'small-model': openai.image('deepseek/deepseek-v3-0324'),
      },
    });
