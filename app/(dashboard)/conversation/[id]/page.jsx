//app/(dashboard)/conversation/[id]/route.js

import React from "react";
import { getConversationById } from "@/lib/actions";
import SingleConversationPageCopy from "@/components/conversation/SingleConversationPage-copy";
import { auth } from "@clerk/nextjs/server";
import { getUserAvatarImage } from "@/lib/actions";

export default async function page({ params }) {
  const conversation = await getConversationById(params.id);
  const id = await params.id;
  const { userId } = auth();
  const avatarUrl = await getUserAvatarImage(userId);

  return (
    <>
      <SingleConversationPageCopy
        conversation={conversation}
        id={id}
        avatarUrl={avatarUrl}
      />
    </>
  );
}
