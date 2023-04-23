
import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from 'zod';
const filterUserProperties = (user: User) => {
  return { username: user.username, id: user.id, profileImageUrl: user.profileImageUrl }
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{
        createdAt: "desc"
      }]
    });

    const users = (await clerkClient.users.getUserList({
      userId: posts.map(post => post.authorId),
      limit: 100,
    })).map(filterUserProperties);

    return posts.map(post => {
      const author = users.find(user => user.id == post.authorId);
      if (!author || !author.username) {
        throw new TRPCError(
          {
            code: "INTERNAL_SERVER_ERROR",
            message: "post with no author"
          }
        );
      }
      return {
        post,
        author: {
          ...author,
          username: author.username,
        }
      }
    });
  },
  ),
  createPost: privateProcedure.input(z.object({
    content: z.string().emoji().min(1).max(280)
  })).mutation(async ({ ctx, input }) => {
    const authorId = ctx.userId;
    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        content: input.content
      }
    })
    return post;
  }),
});