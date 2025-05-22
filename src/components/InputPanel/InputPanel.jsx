// InputPanel.jsx
import { useState, useRef, useEffect } from 'react';
import styles from './InputPanel.module.css';

const CANCEL_THRESHOLD = 60;

const InputPanel = ({ onSendMessage, onSendMedia, onSendVoice }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachedMedia, setAttachedMedia] = useState([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputWrapperRef = useRef(null);
  const startXRef = useRef(null);

  const handleSend = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (attachedMedia.length > 0) {
      onSendMedia(
        {
          media: attachedMedia.map((media) => ({
            file: media.file,
            url: media.url,
            type: media.type,
          })),
          caption: message,
        },
        time
      );
      setAttachedMedia([]);
      setIsPreviewVisible(false);
      setMessage('');
      return;
    }

    if (message.trim()) {
      onSendMessage(message, time);
      setMessage('');
    }
  };

  const handlePhotoClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newMedia = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'photo',
      }));
      setAttachedMedia((prev) => [...prev, ...newMedia]);
      setIsPreviewVisible(true);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const images = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        images.push({
          file,
          url: URL.createObjectURL(file),
          type: 'photo',
        });
      }
    }
    if (images.length > 0) {
      setAttachedMedia((prev) => [...prev, ...images]);
      setIsPreviewVisible(true);
    }
  };

  const handleRemoveMedia = (index) => {
    setAttachedMedia((prev) => prev.filter((_, i) => i !== index));
    if (attachedMedia.length === 1) setIsPreviewVisible(false);
  };

// InputPanel.jsx (исправленная часть)
const startRecording = async (e) => {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  startXRef.current = clientX;
  setIsCancelled(false);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    const audioChunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (isCancelled) {
        setRecordingTime(0);
        return;
      }
      
      try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        onSendVoice({
          audioBlob,
          time,
          duration: recordingTime
        });
      } catch (error) {
        console.error('Error handling audio stop:', error);
      } finally {
        setRecordingTime(0);
      }
    };

    mediaRecorder.start(100); // Записываем данные каждые 100 мс
    setIsRecording(true);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleRelease);
    window.addEventListener('touchend', handleRelease);
  } catch (error) {
    console.error('Microphone access error:', error);
    alert('Could not access microphone');
  }
};

  const handleMove = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const inputRect = inputWrapperRef.current.getBoundingClientRect();
    if (clientX < inputRect.left + CANCEL_THRESHOLD) {
      setIsCancelled(true);
      stopRecording(true);
      removeListeners();
    }
  };

  const handleRelease = () => {
    removeListeners();
    if (!isCancelled) stopRecording(false);
  };

  const removeListeners = () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('mouseup', handleRelease);
    window.removeEventListener('touchend', handleRelease);
  };

  const stopRecording = (cancel = false) => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    if (cancel) return;
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

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
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
      />

      {isPreviewVisible && (
        <div className={styles.photoPreview}>
          {attachedMedia.map((media, index) => (
            <div key={index} className={styles.photoContainer}>
              {media.type === 'photo' ? (
                <img src={media.url} alt={`Медиа ${index + 1}`} className={styles.photo} />
              ) : (
                <video src={media.url} className={styles.photo} controls style={{ maxHeight: 80 }} />
              )}
              <button className={styles.removePhotoButton} onClick={() => handleRemoveMedia(index)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.inputWrapper} ref={inputWrapperRef}>
        <div className={styles.inputFieldWrapper}>
          {(!isRecording || isCancelled) && (
            <>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Сообщение..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                className={`${styles.sendButton} ${message || attachedMedia.length > 0 ? styles.visible : ''}`}
                onClick={handleSend}
                tabIndex={0}
                type="button"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#825CDC" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </>
          )}
        </div>

        {(!isRecording || isCancelled) && (
          <button className={`${styles.photoButton}`} onClick={handlePhotoClick}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#ededed" d="M4 7h2.586l1.707-2.293A1 1 0 0 1 9.586 4h4.828a1 1 0 0 1 .707.293L16.414 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
            </svg>
          </button>
        )}

        {isRecording && !isCancelled && (
          <>
            <span className={styles.timer}>{formatRecordingTime(recordingTime)}</span>
            <span className={styles.swipeHint}>Смахните влево для отмены</span>

            <button
              className={`${styles.voiceButton} ${styles.recording}`}
              onMouseDown={startRecording}
              onTouchStart={startRecording}
              style={{ marginLeft: 12 }}
            >
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path
                  fill="#ff5252"
                  d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"
                />
              </svg>
            </button>
          </>
        )}

        {(!isRecording || isCancelled) && (
          <button
            className={styles.voiceButton}
            onMouseDown={startRecording}
            onTouchStart={startRecording}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#ededed"
                d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default InputPanel;