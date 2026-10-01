import React from "react";
import { db } from "@/db";
import { comments, videos, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  ManageCommentsClient,
  AdminCommentItem,
} from "@/components/admin/ManageCommentsClient";

export const dynamic = "force-dynamic";

export default async function ManageCommentsPage() {
  const rawComments = await db
    .select({
      id: comments.id,
      text: comments.text,
      createdAt: comments.createdAt,
      video: {
        id: videos.id,
        videoId: videos.videoId,
        title: videos.title,
      },
      user: {
        id: users.id,
        username: users.username,
        avatar: users.avatar,
      },
    })
    .from(comments)
    .leftJoin(videos, eq(comments.videoId, videos.id))
    .leftJoin(users, eq(comments.userId, users.id))
    .orderBy(desc(comments.createdAt))
    .limit(500);

  const initialComments: AdminCommentItem[] = rawComments.map((c) => ({
    id: c.id,
    text: c.text,
    createdAt: c.createdAt,
    video: c.video?.id
      ? {
          id: c.video.id,
          videoId: c.video.videoId,
          title: c.video.title,
        }
      : null,
    user: c.user?.id
      ? {
          id: c.user.id,
          username: c.user.username,
          avatar: c.user.avatar,
        }
      : null,
  }));

  return <ManageCommentsClient initialComments={initialComments} />;
}
