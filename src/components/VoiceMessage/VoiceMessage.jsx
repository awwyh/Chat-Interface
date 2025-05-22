import { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import styles from './VoiceMessage.module.css';

const VoiceMessage = ({ audioUrl, time, isOwnMessage, duration = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(duration);
  const waveRef = useRef(null);
  const wavesurfer = useRef(null);
  const containerRef = useRef(null);

  // Инициализация WaveSurfer
  useEffect(() => {
    if (!waveRef.current || !audioUrl) return;

    const ws = WaveSurfer.create({
      container: waveRef.current,
      waveColor: isOwnMessage ? '#b399e6' : '#4b206b',
      progressColor: isOwnMessage ? '#825cdc' : '#6a3d9a',
      barWidth: 2,
      barGap: 1,
      barRadius: 3,
      height: 32,
      cursorWidth: 0,
      backend: 'WebAudio',
      responsive: true,
      normalize: true,
      fillParent: true
    });

    wavesurfer.current = ws;

    const loadAudio = async () => {
      try {
        await ws.load(audioUrl);
        ws.seekTo(1);
        
        if (!duration) {
          const audioDuration = ws.getDuration();
          setCurrentTime(audioDuration);
        }
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };

    loadAudio();

    ws.on('audioprocess', () => {
      setCurrentTime(duration - ws.getCurrentTime());
    });

    ws.on('finish', () => {
      setIsPlaying(false);
      ws.seekTo(1);
    });

    return () => {
      ws.destroy();
    };
  }, [audioUrl, duration, isOwnMessage]);

  const togglePlay = () => {
    if (!wavesurfer.current) return;
    
    if (isPlaying) {
      wavesurfer.current.pause();
      wavesurfer.current.seekTo(1);
    } else {
      wavesurfer.current.play();
      wavesurfer.current.seekTo(0);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`${styles.voiceMessage} ${isOwnMessage ? styles.ownMessage : ''}`}
      style={{
        marginLeft: isOwnMessage ? 'auto' : '0',
        backgroundColor: isOwnMessage ? '#ece6f6' : '#ffffff'
      }}
    >
      <button className={styles.playButton} onClick={togglePlay}>
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#fff" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#fff" d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
      
      <div className={styles.messageInfo}>
        <span className={styles.currentTime}>
          {formatTime(isPlaying ? currentTime : duration)}
        </span>
      </div>
      
      <div className={styles.waveformWrapper}>
        <div className={styles.waveform} ref={waveRef} />
      </div>
      
      <span className={styles.sendTime}>{time}</span>
    </div>
  );
};

export default VoiceMessage;