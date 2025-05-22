// src/components/Message/Message.jsx
import styles from './Message.module.css';

const Message = ({ text, photos, isUser, time }) => {
  return (
    <div className={`${styles.message} ${isUser ? styles.userMessage : ''}`}>
      <div className={styles.content}>
        {text && <p>{text}</p>}
        {photos && photos.length > 0 && (
          <div className={styles.photoGroup}>
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo.url}
                alt={`Фото ${index + 1}`}
                className={styles.photo}
              />
            ))}
          </div>
        )}
        <span className={styles.time}>{time}</span>
      </div>
    </div>
  );
};

export default Message;