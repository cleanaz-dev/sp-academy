//app/(dashboard)/conversation/[id]/page.jsx

import React from "react";
import { getConversationById } from "@/lib/actions";
import SingleConversationPageCopy from "@/components/conversation/SingleConversationPage-copy";
import { auth } from "@clerk/nextjs/server";
import { getUserAvatarImage } from "@/lib/actions";

export default async function page({ params }) {
  const { id } = await params
  console.log("id", id)
  const conversation = await getConversationById(id);

  const { userId } = await auth();
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
