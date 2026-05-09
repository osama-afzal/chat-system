export type ClientToServerEvents =
    | {
        type: "messages.send",
        payload: {
            roomId: string;
            content: string;
        };
    }
    | {
        type: "room.join";
        payload: {
            roomId: string;
        };
    };