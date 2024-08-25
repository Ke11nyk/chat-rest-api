export interface TextMessageBody {
    content: string;
}

export interface MessageListQuery {
    page?: number;
    limit?: number;
}

export interface MessageContentParams {
    id: number;
}