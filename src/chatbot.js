import React, { useState, useEffect, useCallback } from 'react';
import './Chatbot.css';
import Message from './Message';
import { sendMessage } from './SendMessage';
import { GetMessage } from './GetMessage';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [botInfo, setBotInfo] = useState({});

    const fetchMessages = useCallback(async () => {
        try {
            // GetMessage를 통해 데이터 가져오기
            const data = await GetMessage();
            // 데이터를 messages 상태에 업데이트
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, []);

    const fetchBotInfo = useCallback(async () => {
        try {
            const botApiUrl = 'https://api.thothy.ai/bots';
            const bearerToken = "f6f0f6f5e694bebc787d7b0fbe43b122";
            const botRequestOptions = {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${bearerToken}`, // 여기에 Bearer Token을 추가해주세요
                },
            };

            const response = await fetch(botApiUrl, botRequestOptions);
            const data = await response.json();

            if (data.bots && data.bots[2]) {
                setBotInfo(data.bots[2]);
            } else {
                console.error('Bot 정보를 찾을 수 없음');
            }
        } catch (error) {
            console.error('Bot API 오류:', error);
        }
    }, []);

    // 컴포넌트가 마운트될 때 데이터 불러오기
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        fetchBotInfo();
    }, [fetchBotInfo]);

    const handleChangeMessage = (e) => {
        setNewMessage(e.target.value);
    };

    const handleSendMessage = useCallback(async () => {
        try {
            if (newMessage.trim() !== '') {
                // sendMessage를 통해 사용자의 메세지 전송
                await sendMessage(newMessage);
                // 메세지 전송 후 데이터 다시 불러오기
                fetchMessages();
                // 입력 필드 초기화
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, [newMessage, fetchMessages]);

    const handleInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-app">
            <div className="chat-container">
                <div className="chat-display">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.type}`}>
                            <Message text={message.user_message} type="input-message" />
                            {message.assistant && <Message text={message.assistant} type="received-message" />}
                        </div>
                    ))}
                </div>
                <div className="chat-display-right" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    {botInfo.name ? (
                        <div>
                            <p>Name: {botInfo.name}</p>
                            <p>Description: <br /> {botInfo.description.slice(3,-4)}</p>
                        </div>
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
                    onChange={handleChangeMessage}
                    onKeyPress={handleInputKeyPress}
                />
                <button onClick={handleSendMessage}>보내기</button>
            </div>
        </div>
    );
};

export default Chatbot;
