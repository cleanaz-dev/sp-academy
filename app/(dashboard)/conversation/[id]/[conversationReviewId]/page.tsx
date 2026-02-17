
interface Params {
    params: Promise<{
        id: string;
        conversationRecordId:string;
    }>
}

export default async function ConversationReviewWrapper({params}: Params) {
    return <div>Conversation Review</div>
}