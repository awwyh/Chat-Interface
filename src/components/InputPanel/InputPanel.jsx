import { useState, useRef, useEffect } from 'react';
import styles from './InputPanel.module.css';

const InputPanel = ({ onSendMessage, onSendPhoto, onSendVoice }) => {
  const [message, setMessage] = useState(''); // Добавлено состояние
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachedPhotos, setAttachedPhotos] = useState([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Обработка отправки текстового сообщения или фото с подписью
  const handleSend = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
    if (attachedPhotos.length > 0) {
      onSendPhoto(
        {
          photos: attachedPhotos.map((photo) => ({
            file: photo.file,
            url: photo.url,
          })),
          caption: message, // Подпись из поля ввода
        },
        time
      );
      setAttachedPhotos([]);
      setIsPreviewVisible(false);
    } else if (message.trim()) {
      onSendMessage(message, time);
    }
  
    setMessage('');
  };

  // Обработка выбора фото
  const handlePhotoClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPhotos = files.map((file) => ({
        file, // Сохраняем оригинальный файл
        url: URL.createObjectURL(file), // Генерируем URL для предпросмотра
      }));
      setAttachedPhotos((prev) => [...prev, ...newPhotos]);
      setIsPreviewVisible(true);
    }
  };

  // Обработка вставки фото из буфера обмена
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const images = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        images.push({
          file, // Сохраняем оригинальный файл
          url: URL.createObjectURL(file), // Генерируем URL для предпросмотра
        });
      }
    }
    if (images.length > 0) {
      setAttachedPhotos((prev) => [...prev, ...images]);
      setIsPreviewVisible(true);
    }
  };

  // Удаление прикрепленного фото
  const handleRemovePhoto = (index) => {
    setAttachedPhotos((prev) => prev.filter((_, i) => i !== index));
    if (attachedPhotos.length === 1) {
      setIsPreviewVisible(false);
    }
  };

  // Запуск записи голоса
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        onSendVoice(audioBlob, time);
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Таймер для отображения длительности записи
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
      alert('Не удалось получить доступ к микрофону');
    }
  };

  // Остановка записи
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  // Форматирование времени записи (мм:сс)
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
      }
      clearInterval(timerRef.current);
    };
  }, []);

  return (
<div className={styles.container} onPaste={handlePaste}>
  <input
    type="file"
    ref={fileInputRef}
    onChange={handleFileChange}
    accept="image/*"
    multiple
    style={{ display: 'none' }}
  />

  {isPreviewVisible && (
    <div className={styles.photoPreview}>
      {attachedPhotos.map((photo, index) => (
        <div key={index} className={styles.photoContainer}>
          <img src={photo.url} alt={`Фото ${index + 1}`} className={styles.photo} />
          <button className={styles.removePhotoButton} onClick={() => handleRemovePhoto(index)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  )}

  <div className={styles.inputWrapper}>
    <button className={styles.photoButton} onClick={handlePhotoClick}>
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path
          fill="#825CDC"
          d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5-5-2.24 5-5 5z"
        />
        <circle cx="12" cy="12" r="3" fill="#825CDC" />
      </svg>
    </button>

    <input
  type="text"
  className={styles.inputField}
  placeholder="Сообщение..."
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
/>

    <button
      className={`${styles.sendButton} ${message || attachedPhotos.length > 0 ? styles.visible : ''}`}
      onClick={handleSend}
    >
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#825CDC" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    </button>

    <button
      className={`${styles.voiceButton} ${isRecording ? styles.recording : ''}`}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      onMouseLeave={stopRecording}
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path
          fill={isRecording ? '#ff5252' : '#825CDC'}
          d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"
        />
      </svg>
    </button>
  </div>
</div>
  );
};

export default InputPanel;