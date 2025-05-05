import { useState, useRef } from 'react';
import styles from './VoiceMessage.module.css';

const VoiceMessage = ({ audioUrl, time, isOwnMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div
      className={`${styles.audioMessage} ${
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      }`}
    >
      <button 
        className={styles.playButton} 
        onClick={togglePlay}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#825CDC" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#825CDC" d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
      <div className={styles.audioWaveform} />
      <span className={styles.time}>{time}</span>
      <audio 
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
      />
    </div>
  );
};

export default VoiceMessage;