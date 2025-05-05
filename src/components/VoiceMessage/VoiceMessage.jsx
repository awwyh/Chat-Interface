// src/components/VoiceMessage/VoiceMessage.jsx
import { useState, useRef } from 'react';
import styles from './VoiceMessage.module.css';

const VoiceMessage = ({ audioUrl, time, isOwnMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className={`${styles.voiceMessage} ${isOwnMessage ? styles.ownMessage : ''}`}>
      <button className={styles.playButton} onClick={togglePlay}>
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#fff" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#fff" d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className={styles.waveform}>
        {/* Здесь можно добавить реальную аудиоволну */}
        <div className={styles.fakeWaveform}></div>
      </div>
      <span className={styles.duration}>{formatTime(currentTime)}</span>
      <span className={styles.time}>{time}</span>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default VoiceMessage;