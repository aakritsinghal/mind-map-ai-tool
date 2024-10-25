import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

export const MINDCHAT_TEMPLATE = `
You are an AI assistant named Mindchat, designed to help users interact with their memories and notes. Your responses should be helpful, empathetic, and tailored to the user's context.

Analyze the following user input and provide a response.

Chat History:
{chat_history}

User input: {input}

Your Response:
`;

export async function createMindchatAgent(userId: string) {
  const model = new ChatOpenAI({ 
    modelName: "gpt-3.5-turbo",
    streaming: true
  });

  const prompt = new PromptTemplate({
    template: MINDCHAT_TEMPLATE,
    inputVariables: ["input", "chat_history"],
  });

  const chain = new LLMChain({ llm: model, prompt });

  return {
    call: async ({ input, chat_history }: { input: string; chat_history: string }) => {
      const response = await chain.call({ input, chat_history });
      return response.text;
    }
  };
}

// ... rest of the file ...
