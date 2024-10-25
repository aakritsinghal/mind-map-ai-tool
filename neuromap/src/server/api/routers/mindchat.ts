import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createMindchatAgent } from "@/lib/mindchatAgent";
import { observable } from '@trpc/server/observable';

export const mindchatRouter = createTRPCRouter({
  chat: protectedProcedure
    .input(z.object({
      message: z.string(),
      history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { message, history } = input;

      const agent = await createMindchatAgent(userId);
      
      const response = await agent.call({
        input: message,
        chat_history: history.map(msg => `${msg.role}: ${msg.content}`).join('\n')
      });

      return response;
    }),

  streamChat: protectedProcedure
    .input(z.object({
      message: z.string(),
      history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string()
      }))
    }))
    .subscription(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { message, history } = input;

      const agent = await createMindchatAgent(userId);

      return observable<string>((emit) => {
        (async () => {
          const response = await agent.call({
            input: message,
            chat_history: history.map(msg => `${msg.role}: ${msg.content}`).join('\n')
          });

          // Simulate streaming by splitting the response into words
          const words = response.split(' ');
          for (const word of words) {
            emit.next(word + ' ');
            await new Promise(resolve => setTimeout(resolve, 50)); // Delay between words
          }
          emit.complete();
        })();

        return () => {
          // Cleanup if needed
        };
      });
    }),
});
