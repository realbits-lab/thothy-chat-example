import { mutate } from 'swr';
// message 보내는 api

const updateStreamingHistory = (chatId, streamedChat) => {
    const CONVERSATION_URL = `https://api.thothy.ai/chat/${chatId}/history`;

    // mutate(
    //     CONVERSATION_URL,
    //     (currentData) => {
    //         let changedData = currentData;

    //         const message = find(currentData, (item) => item.message_id === streamedChat.message_id);

    //         if (message !== undefined) {
    //             changedData = currentData.map((item) => {
    //                 if (item.message_id === streamedChat.message_id) {
    //                     return { ...item, assistant: item.assistant + streamedChat.assistant };
    //                 }
    //                 return item;
    //             });
    //         } else {
    //             changedData.push(streamedChat);
    //         }
    //         return changedData;
    //     },
    //     false
    // );
    mutate(
        CONVERSATION_URL,
        (currentData) => {
            let updatedData;

            if (Array.isArray(currentData)) {
                const existingMessageIndex = currentData.findIndex((item) => item.message_id === streamedChat.message_id);

                if (existingMessageIndex !== -1) {
                    // 메시지가 이미 존재하는 경우 업데이트
                    updatedData = currentData.map((item, index) => {
                        if (index === existingMessageIndex) {
                            return { ...item, assistant: item.assistant + streamedChat.assistant };
                        }
                        return item;
                    });
                } else {
                    // 메시지가 없는 경우 새로 추가
                    updatedData = [...currentData, streamedChat];
                }
            } else {
                // currentData가 배열이 아닌 경우 새 배열로 초기화
                updatedData = [streamedChat];
            }

            return updatedData;
        },
        false
    );

};

const handleStream = async (chatId, reader) => {
    const decoder = new TextDecoder('utf-8');

    const handleStreamRecursively = async (chatId) => {
        const { done, value } = await reader.read();

        if (done) {
            return;
        }

        const dataStrings = decoder.decode(value).trim().split('data: ').filter(Boolean);

        console.log("dataStrings ===> ", dataStrings);

        dataStrings.forEach((data) => {
            try {
                const parsedData = JSON.parse(data);
                updateStreamingHistory(chatId, parsedData);
            } catch (error) {
                console.error('errorParsingData', error);
            }
        });

        await handleStreamRecursively(chatId);
    };

    await handleStreamRecursively(chatId);
};

export async function sendMessage(message) {
    /// chat/${chatId}/question?brain_id=${brainId}
    // const accessToken = sessionStorage.getItem('accessToken');
    const chat_id = "57edb576-abc5-4708-833d-8383f49c3948"
    const bearerToken = "f6f0f6f5e694bebc787d7b0fbe43b122"

    const URL = `https://api.thothy.ai/chat/${chat_id}/question/stream?bot_id=3f834c07-53e5-488a-841a-dfe20bb99102`;

    /**
     * Work on server
     */
    const headers = {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
    };

    const response = await fetch(URL, {
        method: 'POST',
        body: JSON.stringify({
            question: message,  // 사용자가 보낸 메시지
            model: 'gpt-3.5-turbo',
            temperature: 255,
            max_tokens: 0.7,
            bot_id: '3f834c07-53e5-488a-841a-dfe20bb99102',
            prompt_id: '4772e25b-4a2a-4f27-815d-ac8ecf2f4469'
        }),
        headers,
    });

    if (response.body === null) {
        throw new Error('responseBodyNull', { ns: 'chat' });
    }
    console.log('receivedResponse', response);
    await handleStream(chat_id, response.body.getReader());
}