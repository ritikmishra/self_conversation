import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import zango from "zangodb";
import { compareAsc, compareDesc, formatDistanceToNow } from "date-fns";

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

const MessageComponent: React.FC<{ message: Message }> = (props: { message: Message }) => {
    const { text, timestamp, left } = props.message;
    const [timestampText, setTimestampText] = useState<string>(formatDistanceToNow(timestamp));

    useEffect(() => {
        setInterval(
            () => setTimestampText(formatDistanceToNow(timestamp)),
            1000
        );
    }, []);
    return (
        <>
            <p className={"message " + (left ? "left leftMessage" : "right rightMessage")}>{text}</p>
            <span className={"timestamp " + (left ? "left" : "right")}>{timestampText} ago</span>
        </>
    );
};

const App: React.FC = () => {
    const [messagesCollection] = useState(getCollection());
    const [messages, setMessages] = useState<Required<Message[]>>([]);
    const [textBoxMessage, setTextBoxMessage] = useState<string>("");

    /** Reference to a div that is below all of the messages */
    const bottomRef = useRef<null | HTMLDivElement>(null);
    const textareaRef = useRef<null | HTMLTextAreaElement>(null);


    // On page load: load in all the messages from the database initially
    useEffect(() => {
        messagesCollection.find({}).toArray().then(msgs => {
            const sortedMsgs = (msgs as unknown) as Message[];
            sortedMsgs.sort(({timestamp: a}, {timestamp: b}) => compareAsc(a, b));
            setMessages((msgs as unknown) as Message[]);
        });
    }, []);
    
    // On page load: click the messages button
    useEffect(() => textareaRef.current?.focus(), []);

    // Every time the messages change, scroll to the bottom of the page
    useEffect(() => bottomRef.current?.scrollIntoView(), [messages]);

    const addNewMessageToCollection = async (messageText: string): Promise<void> => {
        messageText = messageText.trim();
        if (!messageText) {
            return;
        }
        const newMessage: Message = {
            _id: createId(),
            timestamp: Date.now(),
            left: messages.length % 2 === 0,
            text: messageText
        };
        await messagesCollection.insert(newMessage);
        setMessages([...messages, newMessage]);
    };

    const addMessageEventHandler = () => {
        addNewMessageToCollection(textBoxMessage);
        setTimeout(() => setTextBoxMessage(""));
    };

    return (
        <div className="App">
            <div className="messages">
                {messages.map((message, i) => <MessageComponent key={message._id} message={message} />)}
                <div ref={bottomRef}></div> {/* dummy div used to scroll to the bottom */}
            </div>
            <div className="footer">
                <div className="submitArea">
                    <textarea className="submitTextArea" ref={textareaRef} value={textBoxMessage} placeholder="What are you going to say to yourself?" onChange={event => setTextBoxMessage(event.target.value)} onKeyPress={(e) => e.key === "Enter" && addMessageEventHandler()}>

                    </textarea>
                    <button className="submitButton" onClick={addMessageEventHandler}>Add Message</button>
                </div>
            </div>
        </div>
    );
};

export default App;
