export type ServerToClientEvents =
    | {
        type: "message.new";
        payload: {
            messageId: string;
            roomId: string;
            userId: string;
            content: string;
            createdAt: string;
        };
    }
    | {
        type: "room.joined";
        payload: {
            roomId: string;
        };
    };