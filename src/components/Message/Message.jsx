// src/components/Message/Message.jsx
import styles from './Message.module.css';

const Message = ({ text, isUser, time }) => {
  return (
    <div className={`${styles.message} ${isUser ? styles.userMessage : ''}`}>
      <div className={styles.content}>
        <p>{text}</p>
        <span className={styles.time}>{time}</span>
      </div>
    </div>
  );
};

export default Message;