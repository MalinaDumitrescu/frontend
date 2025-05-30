import { useChat } from './ChatContext';

const KudosButton = ({ friendId }) => {
    const { sendMessage } = useChat();

    const handleClick = () => {
        const text = prompt("Trimite un mesaj cu kudos:");
        if (text) {
            sendMessage(friendId, text);
        }
    };

    return <button onClick={handleClick}>👏 Kudos</button>;
};

export default KudosButton;