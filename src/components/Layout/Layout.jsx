// src/components/Layout/Layout.jsx
import { useState, useRef, useEffect } from 'react';
import styles from './Layout.module.css';
import Header from '../Header/Header';
import Message from '../Message/Message';
import InputPanel from '../InputPanel/InputPanel';
import VoiceMessage from '../VoiceMessage/VoiceMessage';
import SearchBar from '../SearchBar/SearchBar';

const Layout = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showSearch, setShowSearch] = useState(false); // состояние для поиска
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentNode;
      container.scrollTo({
        top: container.scrollHeight + 100, 
        behavior: 'auto'
      });
    }
  };

  const handleSendMessage = (text, time) => {
    setMessages([...messages, { 
      text, 
      isUser: true, 
      time,
      type: 'text' 
    }]);
    scrollToBottom(); // Прокрутка вниз после отправки сообщения
  };

  const handleSendPhoto = ({ photos, caption }, time) => {
    if (!Array.isArray(photos)) return; // Проверяем, что photos — массив

    const newPhotos = photos.map(({ file }) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve({
            url: e.target.result, // Base64 изображение
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPhotos).then((photoUrls) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          photos: photoUrls,
          caption,
          isUser: true,
          time,
          type: 'photo',
        },
      ]);
      scrollToBottom(); // Прокрутка вниз после отправки фото
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
    scrollToBottom(); // Прокрутка вниз после отправки голосового сообщения
  };

  const openFullscreen = (imageSrc) => {
    setFullscreenImage(imageSrc);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const handleSearchResults = (results) => {
    setFilteredMessages(results);
  };

  useEffect(() => {
    scrollToBottom(); // Прокрутка вниз при первой загрузке
    setFilteredMessages(messages); // Изначально показываем все сообщения
  }, [messages]);

  return (
    <div className={styles.layout}>
<Header onSearchClick={() => setShowSearch((prev) => !prev)} />
      {/* Поиск появляется только при showSearch */}
      {showSearch && (
        <SearchBar messages={messages} onSearchResults={handleSearchResults} />
      )}

      <div className={styles.messagesContainer}>
        {Array.isArray(filteredMessages) && filteredMessages.map((msg, index) => {
          switch (msg.type) {
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
                <div
                  key={index}
                  className={`${styles.photoMessage} ${msg.isUser ? styles.userMessage : ''}`}
                >
                  <div className={styles.photoGroup}>
                    {Array.isArray(msg.photos) &&
                      msg.photos.map((photo, i) => (
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
        {/* Элемент для прокрутки вниз */}
        <div ref={messagesEndRef} />
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