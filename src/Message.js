import React from "react";

const Message = ({ text, type }) => {
    const messageClass = type === "input-message" ? "input-message" : "received-message";

    return <div className={messageClass}>{text}</div>;
};

export default Message;