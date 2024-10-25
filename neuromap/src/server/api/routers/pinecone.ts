import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

export const pineconeRouter = createTRPCRouter({
  upsertTranscript: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

      // Initialize OpenAI client
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Split the text into sentences
      const sentences = input.text.match(/[^.!?]+[.!?]+/g) || [input.text];

      // Embed each sentence
      const embeddings = await Promise.all(
        sentences.map(async (sentence) => {
          const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: sentence.trim(),
          });
          return response.data[0]?.embedding ?? [];
        })
      );

      // Prepare vectors for upsert
      const vectors = sentences.map((sentence, index) => ({
        id: `${ctx.session.user.id}-${Date.now()}-${index}`,
        values: embeddings[index] ?? [],
        metadata: { text: sentence.trim(), userId: ctx.session.user.id },
      })).filter(vector => vector.values.length > 0);

      // Upsert vectors to Pinecone
      await index.upsert(vectors);

      return { success: true };
    }),
});
