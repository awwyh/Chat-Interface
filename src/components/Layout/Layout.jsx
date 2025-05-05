// src/components/Layout/Layout.jsx
import { useState } from 'react';
import styles from './Layout.module.css';
import Header from '../Header/Header';
import Message from '../Message/Message';
import InputPanel from '../InputPanel/InputPanel';
import VoiceMessage from '../VoiceMessage/VoiceMessage';

const Layout = () => {
  const [messages, setMessages] = useState([]);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const handleSendMessage = (text, time) => {
    setMessages([...messages, { 
      text, 
      isUser: true, 
      time,
      type: 'text' 
    }]);
  };

  const handleSendPhoto = ({ photos, caption }, time) => {
    photos.forEach(({ file }) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result; // Получаем изображение в формате Base64
  
        // Добавляем фото в сообщения
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            content: base64Image, // Сохраняем Base64 изображение
            caption, // Подпись к фото
            isUser: true,
            time,
            type: 'photo',
          },
        ]);
      };
      reader.readAsDataURL(file); // Читаем файл как Data URL
    });
  };

  const handleSendVoice = (audioBlob, time) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    setMessages(prev => [...prev, {
      content: audioUrl,
      isUser: true,
      time,
      type: 'voice'
    }]);
  };

  const openFullscreen = (imageSrc) => {
    setFullscreenImage(imageSrc);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  return (
    <div className={styles.layout}>
      <Header />
      
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => {
          switch(msg.type) {
            case 'text':
              return (
                <Message 
                  key={index} 
                  text={msg.text} 
                  isUser={msg.isUser} 
                  time={msg.time} 
                />
              );
              case 'photo':
                return (
                  <div key={index} className={`${styles.photoMessage} ${msg.isUser ? styles.userMessage : ''}`}>
                    <div className={styles.photoGroup}>
                      {msg.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo.url}
                          alt={`Фото ${i + 1}`}
                          className={styles.photo}
                          onClick={() => openFullscreen(photo.url)}
                        />
                      ))}
                    </div>
                    {msg.caption && <p className={styles.photoCaption}>{msg.caption}</p>}
                    <span className={styles.time}>{msg.time}</span>
                  </div>
                );
              case 'voice':
                return (
                  <VoiceMessage
                    key={index}
                    audioUrl={msg.content}
                    time={msg.time}
                    isOwnMessage={msg.isUser}
                  />
                );
            default:
              return null;
          }
        })}
      </div>
      
      <InputPanel 
        onSendMessage={handleSendMessage} 
        onSendPhoto={handleSendPhoto}
        onSendVoice={handleSendVoice}
      />

      {fullscreenImage && (
        <div className={styles.fullscreenOverlay} onClick={closeFullscreen}>
          <div className={styles.fullscreenContent}>
            <img 
              src={fullscreenImage} 
              alt="Полноэкранное фото" 
              className={styles.fullscreenImage}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;