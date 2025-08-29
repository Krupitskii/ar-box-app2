import React, { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  videoId: string;
  isMobile: boolean;
}

export default function BackgroundVideo({ videoId, isMobile }: BackgroundVideoProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Автоматическое воспроизведение с параметрами для фонового видео
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      // Дополнительные параметры для мобильных устройств
      const mobileParams = isMobile ? '&playsinline=1&autoplay=1&mute=1' : '&autoplay=1&mute=1';
      const src = `https://www.youtube.com/embed/${videoId}?${mobileParams}&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}&vq=medium`;
      iframe.src = src;
    }
  }, [videoId, isMobile]);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      <iframe
        ref={iframeRef}
        style={{
          position: 'absolute',
          top: isMobile ? '-20%' : '-50%',
          left: isMobile ? '-20%' : '-50%',
          width: isMobile ? '140%' : '200%',
          height: isMobile ? '140%' : '200%',
          border: 'none',
          filter: isMobile ? 'brightness(0.4) contrast(1.1)' : 'brightness(0.3) contrast(1.2)',
          transform: 'scale(1)',
          pointerEvents: 'none',
          zIndex: 0
        }}
        title="Background Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
      {/* Затемняющий оверлей для лучшей читаемости текста */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isMobile 
            ? 'radial-gradient(ellipse at 50% 50%, rgba(2, 6, 23, 0.6) 0%, rgba(0, 0, 0, 0.8) 60%)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(2, 6, 23, 0.7) 0%, rgba(0, 0, 0, 0.9) 60%)',
          zIndex: 1
        }}
      />
    </div>
  );
}
