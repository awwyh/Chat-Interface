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
  const [fullscreenType, setFullscreenType] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewPosition, setPreviewPosition] = useState(0);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const videoWrapperRef = useRef(null);
  const fullscreenWrapperRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentNode;
      container.scrollTo({ top: container.scrollHeight + 100, behavior: 'auto' });
    }
  };

  const handleSendMessage = (text, time) => {
    setMessages([...messages, { text, isUser: true, time, type: 'text' }]);
    scrollToBottom();
  };

  const handleSendPhoto = ({ photos, caption }, time) => {
    if (!Array.isArray(photos)) return;

    const newPhotos = photos.map(({ file }) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve({ url: e.target.result });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPhotos).then((photoUrls) => {
      setMessages((prevMessages) => [...prevMessages, {
        photos: photoUrls,
        caption,
        isUser: true,
        time,
        type: 'photo'
      }]);
      scrollToBottom();
    });
  };

  const handleSendVideo = ({ videos, caption }, time) => {
    if (!Array.isArray(videos)) return;

    const newVideos = videos.map(({ file }) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve({ url: e.target.result });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newVideos).then((videoUrls) => {
      setMessages((prevMessages) => [...prevMessages, {
        videos: videoUrls,
        caption,
        isUser: true,
        time,
        type: 'video'
      }]);
      scrollToBottom();
    });
  };

const handleSendVoice = ({ audioBlob, time, duration }) => {
  try {
    const audioUrl = URL.createObjectURL(audioBlob);
    const newMessage = {
      id: Date.now(),
      type: 'voice',
      audioUrl,
      time,
      duration,
      isOwnMessage: true
    };
    setMessages(prev => [...prev, newMessage]);
  } catch (error) {
    console.error('Error creating audio URL:', error);
  }
};

  const handleSendMedia = ({ media, caption }, time) => {
    if (!Array.isArray(media)) return;

    const newMedia = media.map(({ file, type }) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve({ url: e.target.result, type });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newMedia).then((mediaUrls) => {
      setMessages((prevMessages) => [...prevMessages, {
        media: mediaUrls,
        caption,
        isUser: true,
        time,
        type: 'media'
      }]);
      scrollToBottom();
    });
  };

  const openFullscreen = (url, type) => {
    setFullscreenImage(url);
    setFullscreenType(type);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
    setFullscreenType(null);
  };

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && fullscreenImage) {
        closeFullscreen();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [fullscreenImage]);

  const toggleFullscreen = async () => {
    try {
      if (!videoWrapperRef.current) return;

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await videoWrapperRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error('Failed to toggle fullscreen:', err);
    }
  };

  const handleSearchResults = (results) => {
    setFilteredMessages(results);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleTimelineClick = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };

  const handleTimelineHover = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      setPreviewTime(pos * duration);
      setPreviewPosition(pos * 100);
      setShowPreview(true);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    if (videoRef.current) {
      const newVolume = parseFloat(e.target.value);
      if (!isNaN(newVolume) && isFinite(newVolume)) {
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
      }
    }
  };

  const handlePlaybackRateChange = (value) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = value;
      setPlaybackRate(value);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    scrollToBottom();
    setFilteredMessages(messages);
  }, [messages]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement !== null;
      if (!isFullscreen) {
        setFullscreenImage(null);
        setFullscreenType(null);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className={styles.layout}>
      <Header onSearchClick={() => setShowSearch((prev) => !prev)} />
      {showSearch && (
        <SearchBar messages={messages} onSearchResults={handleSearchResults} />
      )}

      <div className={styles.messagesContainer}>
        {Array.isArray(filteredMessages) && filteredMessages.map((msg, index) => {
          switch (msg.type) {
            case 'text':
              return <Message key={index} text={msg.text} isUser={msg.isUser} time={msg.time} />;
            case 'photo':
              return (
                <div key={index} className={`${styles.photoMessage} ${msg.isUser ? styles.userMessage : ''}`}>
                  <div className={styles.photoGroup}>
                    {msg.photos?.map((photo, i) => (
                      <img 
                        key={i} 
                        src={photo.url} 
                        alt="" 
                        className={styles.photo} 
                        onClick={() => openFullscreen(photo.url, 'photo')}
                      />
                    ))}
                  </div>
                  {msg.caption && <p>{msg.caption}</p>}
                  <span>{msg.time}</span>
                </div>
              );
            case 'video':
              return (
                <div key={index} className={`${styles.videoMessage} ${msg.isUser ? styles.userMessage : ''}`}>
                  <div className={styles.videoGroup}>
                    {msg.videos?.map((video, i) => (
                      <video key={i} src={video.url} className={styles.video} onClick={() => openFullscreen(video.url, 'video')} />
                    ))}
                  </div>
                  {msg.caption && <p>{msg.caption}</p>}
                  <span>{msg.time}</span>
                </div>
              );
            case 'voice':
              return <VoiceMessage key={index} audioUrl={msg.content} time={msg.time} isOwnMessage={msg.isUser} duration={msg.duration} />;
            case 'media':
              return (
                <div key={index} className={`${styles.message} ${msg.isUser ? styles.userMessage : ''}`}>
                  <div className={styles.mediaGroup}>
                    {msg.media?.map((item, i) => item.type === 'photo'
                      ? <img key={i} src={item.url} className={styles.media} onClick={() => openFullscreen(item.url, 'photo')} />
                      : <video key={i} src={item.url} className={styles.media} onClick={() => openFullscreen(item.url, 'video')} />)}
                  </div>
                  {msg.caption && <p>{msg.caption}</p>}
                  <span>{msg.time}</span>
                </div>
              );
            default:
              return null;
          }
        })}
        <div ref={messagesEndRef} />
      </div>

      <InputPanel
        onSendMessage={handleSendMessage}
        onSendMedia={handleSendMedia}
        onSendVoice={handleSendVoice}
      />

      {fullscreenImage && (
        <div className={styles.fullscreenOverlay} onClick={closeFullscreen}>
          <div 
            className={styles.fullscreenContent} 
            onClick={e => e.stopPropagation()}
            ref={fullscreenWrapperRef}
          >
            {fullscreenType === 'photo' ? (
              <div className={styles.imageWrapper}>
                <img 
                  src={fullscreenImage} 
                  alt="" 
                  className={styles.fullscreenImage}
                />
                <button className={styles.closeButton} onClick={closeFullscreen} aria-label="Close">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className={styles.videoWrapper}>
                <div className={styles.videoWrapper}>
                  <video
                    src={fullscreenImage}
                    className={styles.fullscreenVideo}
                    ref={videoRef}
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={(e) => {
                      handleLoadedMetadata(e);
                      e.target.play().catch(err => console.log('Autoplay prevented:', err));
                      setIsPlaying(true);
                    }}
                    onProgress={() => {}}
                    onWaiting={() => setIsBuffering(true)}
                    onPlaying={() => setIsBuffering(false)}
                    controls={false}
                    autoPlay
                  />
                  
                  {isBuffering && (
                    <div className={styles.bufferingIndicator}>
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
                      </svg>
                      Загрузка...
                    </div>
                  )}

                  <div className={styles.videoControls}>
                    <button className={styles.controlButton} onClick={togglePlay}>
                      {isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>

                    <div className={styles.progressBar}>
                      <div 
                        className={styles.timelineContainer}
                        onMouseMove={handleTimelineHover}
                        onMouseLeave={() => setShowPreview(false)}
                        onClick={handleTimelineClick}
                      >
                        <div className={styles.timeline}>
                          <div className={styles.progress} style={{ width: `${(currentTime / duration) * 100}%` }} />
                        </div>
                        {showPreview && (
                          <div 
                            className={styles.previewContainer}
                            style={{ left: `${previewPosition}%` }}
                          >
                            <div className={styles.previewTime}>{formatTime(previewTime)}</div>
                          </div>
                        )}
                      </div>
                      <div className={styles.timeDisplay}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    <div className={styles.volumeControl}>
                      <button className={styles.controlButton} onClick={toggleMute}>
                        {volume === 0 ? (
                          <svg width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H3v6h4l5 5v-6.71l4.84 4.84c-.56.4-1.18.71-1.84.92v2.02c1.3-.37 2.47-1.04 3.45-1.93l2.12 2.12a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4v2.02c2.3 1.17 3.87 3.57 3.87 6.38zm-4-7.86v2.14l3.15 3.15c.18-1.16.85-2.14.85-3.43 0-1.89-1.55-3.41-4-3.86zM12 4L9.91 6.09 12 8.18V4z"/>
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                          </svg>
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className={styles.volumeSlider}
                      />
                    </div>

                    <select className={styles.speedSelect} value={playbackRate} onChange={handlePlaybackRateChange}>
                      <option value="0.5">0.5x</option>
                      <option value="1">1x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>

                    <button className={styles.controlButton} onClick={toggleFullscreen}>
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;