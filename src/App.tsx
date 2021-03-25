import React, { useState } from "react";
import "./App.css";
import zango from "zangodb";

interface Message {
    _id: string;

    /** Unix epoch timestamp, milliseconds */
    timestamp: number;

    /** If this is the user on the left side of the screen */
    left: boolean;

    /** The content of this message */
    text: string;
}

const getCollection = () => {
    const db = new zango.Db("textdb", 0, { messages: ["left"] });
    const messagesCollection = db.collection("messages");
    return messagesCollection;
};

const createId = (): string => {
    return "xxxxxxxxxxxxxx".replace(/x/ig, () => Math.floor(Math.random() * 36).toString(36));
};

const App: React.FC = () => {
    const [messagesCollection] = useState(getCollection());
    const [messages, setMessages] = useState<Required<Message[]>>([]);
    const [textBoxMessage, setTextBoxMessage] = useState<string>("");

    const addNewMessageToCollection = async (messageText: string): Promise<void> => {
        const newMessage: Message = {
            _id: createId(),
            timestamp: Date.now(),
            left: messages.length % 2 === 0,
            text: messageText
        };
        await messagesCollection.insert(newMessage);
        setMessages([...messages, newMessage]);
    };

    return (
        <div className="App">
            <div className="submitArea">
                {messages.map((message, i) => <p key={message._id} className={i % 2 === 0 ? "leftMessage" : "rightMessage"}>{message.text}</p>)}


                <textarea placeholder="What are you going to say to yourself?" onChange={event => setTextBoxMessage(event.target.value)}>

                </textarea>
                <button onClick={() => addNewMessageToCollection(textBoxMessage)}>Add Message</button>
            </div>
        </div>
    );
};

export default App;
