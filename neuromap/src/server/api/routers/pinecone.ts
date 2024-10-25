import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { PineconeClient } from "@pinecone-database/pinecone";

export const pineconeRouter = createTRPCRouter({
  upsertTranscript: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const pinecone = new PineconeClient();
      await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT!,
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

      // Here you would implement the logic to upsert the transcript to Pinecone
      // This is a placeholder implementation
      await index.upsert({
        upsertRequest: {
          vectors: [
            {
              id: Date.now().toString(), // Use a unique ID
              values: [], // You need to convert your text to a vector here
              metadata: { text: input.text, userId: ctx.session.user.id },
            },
          ],
        },
      });

      return { success: true };
    }),
});