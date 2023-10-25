import React, { Component } from "react";
import "./App.css";
import Message from "./Message";

class ChatApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [], // 메시지 배열
      newMessage: "",
      botInfo: {},
    };
  }

  // Bearer Token을 상태로 추가
  bearerToken = "f6f0f6f5e694bebc787d7b0fbe43b122";

  handleInputChange = (e) => {
    this.setState({ newMessage: e.target.value });
  };

  // 스트리밍된 메시지를 업데이트하는 함수
  updateStreamingMessage = (message) => {
    this.setState((prevState) => ({
      messages: [...prevState.messages, message],
    }));
  };

  // 새로운 API 호출을 수행하여 bot 정보를 가져옴
  fetchBotInfo = () => {
    const botApiUrl = "https://api.thothy.ai/bots";
    const botRequestOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.bearerToken}`,
      },
    };

    fetch(botApiUrl, botRequestOptions)
      .then((response) => response.json())
      .then((data) => {
        // API 응답 데이터를 상태에 저장
        this.setState({ botInfo: data });
        console.log(data);
        // 이제 "Hello" 위치에 bot 정보를 표시할 수 있습니다.
      })
      .catch((error) => {
        console.error("Bot API 오류:", error);
      });
  };

  handleSendMessage = () => {
    const { newMessage } = this.state;
    if (newMessage.trim() === "") return;

    // 새로운 메시지를 추가
    this.updateStreamingMessage({ text: newMessage, type: "input" });
    // API 요청을 보내기 위한 설정
    const apiUrl = `https://api.thothy.ai/chat/57edb576-abc5-4708-833d-8383f49c3948/question/stream?bot_id=3f834c07-53e5-488a-841a-dfe20bb99102`;
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${this.bearerToken}`,
      },
      body: JSON.stringify({
        question: newMessage,
        model: "gpt-3.5-turbo",
        temperature: 255,
        max_tokens: 0.7,
        bot_id: "3f834c07-53e5-488a-841a-dfe20bb99102",
        prompt_id: "4772e25b-4a2a-4f27-815d-ac8ecf2f4469",
      }),
    };

    // API 요청 보내고 응답 처리
    fetch(apiUrl, requestOptions)
      .then((response) => {
        response.json();
        console.log(response);
      })
      .then((data) => {
        // API 응답 메시지를 추가
        this.updateStreamingMessage({ text: data.response, type: "received" });

        // 입력 메시지 입력란을 초기화
        this.setState({ newMessage: "" });
      })
      .catch((error) => {
        console.error("API 오류:", error);
      });
  };

  handleInputKeyPress = (e) => {
    if (e.key === "Enter") {
      this.fetchBotInfo();
      this.handleSendMessage();
    }
  };
  render() {
    const { messages, newMessage, botInfo } = this.state;

    return (
      <div className="chat-app">
        <div className="chat-container">
          <div className="chat-display">
            {messages.map((message, index) => (
              <Message key={index} text={message.text} type={message.type} />
            ))}
          </div>
          <div className="chat-display-right">
            {botInfo ? (
              <div>{botInfo.bot_name}</div>
            ) : (
              <div>Loading bot info...</div>
            )}
          </div>
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="메시지를 입력하세요"
            value={newMessage}
            onChange={this.handleInputChange}
            onKeyPress={this.handleInputKeyPress}
          />
          <button onClick={this.handleSendMessage}>보내기</button>
        </div>
      </div>
    );
  }
}

export default ChatApp;