export async function GetMessage() {
    // API 엔드포인트 URL
    const chat_id = "57edb576-abc5-4708-833d-8383f49c3948";
    const apiUrl = `https://api.thothy.ai/chat/${chat_id}/history`;
    const bearerToken = "f6f0f6f5e694bebc787d7b0fbe43b122";

    try {
        // GET 요청 보내기
        const response = await fetch(apiUrl, {
            method: "GET", // GET 요청 설정
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
            },
        });
        console.log("Get response ==> ", response);

        // API 응답을 JSON 형식으로 파싱하여 반환
        const data = await response.json();
        console.log("Get data ==> ", data);
        return data;
    } catch (error) {
        // API 호출 중 에러가 발생했을 때 예외 처리
        console.error("API 호출 에러:", error);
        throw error; // 에러를 상위로 던져서 처리하도록 함
    }
}
