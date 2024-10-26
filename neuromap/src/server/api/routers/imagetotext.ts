import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { PrismaClient } from '@prisma/client';
import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export const imageToTextRouter = createTRPCRouter({
  saveImageToText: protectedProcedure
    .input(z.object({ image: z.instanceof(Buffer) })) // Accepts an image file as a buffer
    .mutation(async ({ ctx, input }) => {
      const { image } = input;
      const userId = ctx.session.user.id;
      const tempFileName = `${randomUUID()}.png`;
      const tempFilePath = path.join('/tmp', tempFileName);

      try {
        // Save image buffer temporarily to the file system
        await fs.promises.writeFile(tempFilePath, image);

        // Perform OCR on the saved image
        const ocrResult = await Tesseract.recognize(tempFilePath, 'eng');
        const extractedText = ocrResult.data.text;

        // Save extracted text to the database
        const imageToText = await prisma.ImageToText.create({
          data: {
            userId: userId,
            text: extractedText,
          },
        });

        return imageToText;
      } catch (error) {
        console.error('Error processing image for OCR:', error);
        throw new Error('Error processing image for OCR');
      } finally {
        // Clean up the temporary file
        await fs.promises.unlink(tempFilePath);
      }
    }),
});
