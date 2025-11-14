import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { getTracks } from '../services/tracksService';
import { formatTime } from '../utils/formatTime';

/**
 * PUBLIC_INTERFACE
 * SpotifyClone component renders the extracted Figma screen markup for the Spotify UI.
 * It injects the precise HTML structure while loading CSS and JS from /assets to ensure
 * pixel-perfect rendering and correct behavior of interactions defined in the plain JS file.
 * It also wires a bottom playback bar to an actual audio player while preserving all classes.
 */
function SpotifyClone() {
  // Inject the required CSS via link tags in the document head and ensure cleanup on unmount
  useEffect(() => {
    const commonCss = document.createElement('link');
    commonCss.rel = 'stylesheet';
    commonCss.href = '/assets/common.css';
    commonCss.dataset.__spotifyAsset = 'true';

    const screenCss = document.createElement('link');
    screenCss.rel = 'stylesheet';
    screenCss.href = '/assets/spotify-1-0-3.css';
    screenCss.dataset.__spotifyAsset = 'true';

    document.head.appendChild(commonCss);
    document.head.appendChild(screenCss);

    // Load the interactions script (non-module) and run it after DOM is ready
    const script = document.createElement('script');
    script.src = '/assets/spotify-1-0-3.js';
    script.defer = true;
    script.dataset.__spotifyAsset = 'true';
    document.body.appendChild(script);

    return () => {
      // Cleanup injected assets to avoid duplicates if navigating away/back
      [commonCss, screenCss, script].forEach((el) => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    };
  }, []);

  // Audio player state & data load
  const player = useAudioPlayer([], 0);
  const { currentTrack, isPlaying, currentTime, duration, volume, muted } = player;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const tracks = await getTracks();
      if (!mounted) return;
      player.loadTracks(tracks, 0, false);
    })();
    return () => { mounted = false; };
  }, [player]);

  // Keyboard handlers for play/pause (Space/Enter), mute (m), next/prev (ArrowRight/ArrowLeft)
  const onKeyControls = useCallback((e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      player.togglePlay();
    } else if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      player.toggleMute();
    } else if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      player.next();
    } else if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      player.prev();
    }
  }, [player]);

  const progressPercent = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const volumePercent = useMemo(() => Math.round((volume || 0) * 100), [volume]);

  // Note: We keep figmaimages/ paths exactly as they appear in the design
  // by serving them under /assets/figmaimages from public.
  return (
    <div id="screen" className="screen" role="document" aria-label="Spotify 1 mockup">
      <h1 className="sr-only">Spotify UI Preview</h1>

      {/* Sidebar (root: 0:141) */}
      <aside
        id="sidebar"
        className="sidebar"
        style={{ left: '0px', top: '0px', width: '241px', height: '832.21875px', position: 'absolute' }}
        aria-label="Sidebar navigation"
      >
        {/* Logo block 0:143/0:145 */}
        <div
          className="sb-logo"
          style={{ position: 'absolute', left: '24px', top: '24px', width: '131px', height: '40px', zIndex: 2 }}
        >
          {/* Authentic Spotify wordmark from Figma (vector). Accessible with descriptive alt. */}
          <svg
            className="logo-svg"
            role="img"
            aria-label="Spotify"
            focusable="false"
            viewBox="0 0 168 48"
            width="131"
            height="40"
            preserveAspectRatio="xMinYMid meet"
          >
            <title>Spotify</title>
            <g fill="#FFFFFF">
              <path d="M31.53 21.5c-6.22-3.7-16.42-4.04-22.35-2.24-.49.15-1.01-.13-1.16-.62-.15-.49.13-1.01.62-1.16 6.42-1.95 17.35-1.58 24.18 2.46.44.26.59.82.33 1.26-.26.44-.82.59-1.26.33zm-.3 6.07c-5.48-3.34-13.78-4.11-20.25-2.25-.54.15-1.1-.16-1.25-.69-.15-.54.16-1.1.69-1.25 6.99-1.96 15.9-1.13 22.02 2.56.47.29.62.91.33 1.38-.29.47-.91.62-1.38.33zm-.36 6.27c-4.89-2.9-11.97-3.55-17.58-1.94-.58.17-1.19-.16-1.36-.74-.17-.58.16-1.19.74-1.36 6.2-1.8 13.88-1.08 19.27 2.11.53.31.71 0.99.4 1.52-.31.53-.99.71-1.52.4z"/>
              <path d="M65.4 20.5c0-2.3-1.88-3.76-5.08-3.76-2.13 0-4.07.64-5.42 1.5l.9 2.37c1.12-.68 2.59-1.2 4.1-1.2 1.45 0 2.21.55 2.21 1.42 0 .8-.59 1.28-2.58 1.83-3.41.93-5.48 2.33-5.48 5.11 0 2.91 2.36 4.76 5.61 4.76 1.87 0 3.6-.46 4.86-1.26l-.86-2.35c-1.2.68-2.5 1.08-3.9 1.08-1.42 0-2.29-.59-2.29-1.45 0-.86.69-1.3 2.76-1.9 3.45-.93 5.16-2.35 5.16-5.15zm6.26-3.53h-2.98v17.22h2.98V16.97zm13.67 0h-2.88v1.67c-.98-1.28-2.46-1.9-4.19-1.9-3.45 0-6.1 2.93-6.1 7.09 0 4.19 2.59 7.11 6.1 7.11 1.8 0 3.23-.69 4.19-1.94v1.69h2.88V16.97zm-6.7 12.64c-2.05 0-3.61-1.76-3.61-4.12 0-2.34 1.56-4.09 3.61-4.09 2.01 0 3.59 1.76 3.59 4.09 0 2.36-1.58 4.12-3.59 4.12zm20.77-6.17c0-4.26-3.36-7.59-7.71-7.59-4.38 0-7.8 3.33-7.8 7.59 0 4.24 3.42 7.57 7.8 7.57 4.35 0 7.71-3.33 7.71-7.57zm-12.51 0c0-2.56 1.88-4.32 4.8-4.32 2.88 0 4.73 1.76 4.73 4.32 0 2.54-1.85 4.3-4.73 4.3-2.92 0-4.8-1.76-4.8-4.3zm24.72-2.88c-.98-1.9-2.83-3.03-5.22-3.03-4 0-6.98 3.29-6.98 7.57 0 4.28 3.01 7.59 7.06 7.59 2.29 0 4.12-.98 5.09-2.7v2.31c0 2.68-1.47 4.26-4.12 4.26-1.74 0-3.35-.57-4.82-1.76l-1.18 2.48c1.78 1.35 3.9 2 6.32 2 4.62 0 7.3-2.53 7.3-7.13V16.97h-2.44v3.59zm-4.77 10.17c-2.64 0-4.48-1.99-4.48-4.8 0-2.82 1.9-4.77 4.48-4.77 2.61 0 4.5 1.95 4.5 4.77 0 2.81-1.89 4.8-4.5 4.8zm20.63-10.52c-1.08-.89-2.48-1.42-3.93-1.42-3.98 0-6.91 3.3-6.91 7.59 0 4.26 2.85 7.57 6.93 7.57 1.47 0 2.82-.48 3.91-1.39v1.02c0 2.73-1.57 4.28-4.3 4.28-1.69 0-3.23-.55-4.74-1.71l-1.2 2.48c1.83 1.3 3.93 1.94 6.34 1.94 4.75 0 7.43-2.5 7.43-7.11V16.97h-2.53v2.28h-.01zm-3.59 10.35c-2.56 0-4.43-1.96-4.43-4.77 0-2.81 1.87-4.77 4.43-4.77 2.56 0 4.43 1.96 4.43 4.77 0 2.81-1.87 4.77-4.43 4.77z"/>
            </g>
          </svg>
          {/* If a raster asset is required instead of SVG, uncomment below and ensure the exact path: */}
          {/* <img className="logo-img" src="/assets/figmaimages/<exact_logo_filename>.png" width="131" height="40" alt="Spotify" /> */}
        </div>

        {/* Primary nav stack 0:146 */}
        <nav className="sb-nav" aria-label="Primary" style={{ position: 'absolute', left: '0px', top: '89.59375px', width: '241px' }}>
          {/* Home row */}
          <a
            href="#"
            className="sb-row sb-row-btn active"
            style={{ width: '225px', height: '40px', position: 'relative', left: '8px' }}
            aria-current="page"
          >
            <img
              className="icon"
              src="/assets/figmaimages/figma_image_0_150.svg"
              width="20"
              height="20"
              alt=""
              role="img"
              aria-label="Home"
              style={{ position: 'absolute', left: '24px', top: '8px' }}
            />
            <span className="sb-text sb-text-strong" style={{ left: '64px', top: '8px', position: 'absolute' }}>
              Home
            </span>
          </a>
          {/* Search row */}
          <a href="#" className="sb-row sb-row-btn" style={{ width: '225px', height: '40px', position: 'relative', left: '8px' }}>
            <img
              className="icon"
              src="/assets/figmaimages/figma_image_0_156.svg"
              width="21"
              height="21"
              alt=""
              role="img"
              aria-label="Search"
              style={{ position: 'absolute', left: '24px', top: '8px', width: '21.386px', height: '21.159px' }}
            />
            <span className="sb-text" style={{ left: '64px', top: '8px', position: 'absolute' }}>
              Search
            </span>
          </a>
          {/* Your Library row */}
          <a href="#" className="sb-row sb-row-btn" style={{ width: '225px', height: '40px', position: 'relative', left: '8px' }}>
            <div aria-hidden="true" className="icon" style={{ position: 'absolute', left: '24px', top: '8px', width: '20px', height: '20px' }}></div>
            <span className="sb-text" style={{ left: '64px', top: '8px', position: 'absolute' }}>
              Your Library
            </span>
          </a>
        </nav>

        {/* Secondary actions 0:165 */}
        <div className="sb-ctas" style={{ position: 'absolute', left: '0px', top: '233.59375px', width: '241px' }}>
          <button className="sb-row sb-row-btn sb-ghost" type="button" style={{ width: '241px', height: '40px', position: 'relative' }}>
            <img
              className="icon"
              src="/assets/figmaimages/figma_image_0_172.svg"
              width="12"
              height="12"
              alt=""
              role="img"
              aria-label="Create Playlist"
              style={{ position: 'absolute', left: '24px', top: '8px', width: '12px', height: '12px' }}
            />
            <span className="sb-text sb-text-strong" style={{ left: '64px', top: '10px', position: 'absolute' }}>
              Create Playlist
            </span>
          </button>
          <button className="sb-row sb-row-btn sb-ghost" type="button" style={{ width: '241px', height: '40px', position: 'relative' }}>
            <img
              className="icon"
              src="/assets/figmaimages/figma_image_0_179.svg"
              width="12"
              height="12"
              alt=""
              role="img"
              aria-label="Liked Songs"
              style={{ position: 'absolute', left: '24px', top: '8px', width: '11.712px', height: '10.881px' }}
            />
            <span className="sb-text sb-text-strong" style={{ left: '64px', top: '8px', position: 'absolute' }}>
              Liked Songs
            </span>
          </button>
        </div>

        {/* Footer links + language */}
        <div className="sb-footer" style={{ position: 'absolute', left: '0px', top: '584.34375px', width: '241px' }}>
          <div className="sb-links" style={{ position: 'relative', left: '24px' }}>
            <a href="#" className="sb-link">Legal</a>
            <a href="#" className="sb-link">Privacy Center</a>
            <a href="#" className="sb-link">Privacy Policy</a>
            <a href="#" className="sb-link">Cookies</a>
            <a href="#" className="sb-link">About Ads</a>
          </div>

          <button
            className="sb-language"
            type="button"
            aria-label="Change language (English)"
            style={{
              position: 'relative',
              left: '24px',
              marginTop: '16px',
              width: '95.859375px',
              height: '32px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--color-border)',
              borderRadius: '999px',
              padding: '0 10px',
              background: 'transparent',
            }}
          >
            <img className="icon" src="/assets/figmaimages/figma_image_0_198.svg" width="16" height="16" alt="" role="img" aria-label="Globe" />
            <span className="sb-text" style={{ position: 'static' }}>English</span>
          </button>
        </div>
      </aside>

      {/* Top bar */}
      <header id="topbar" className="topbar" style={{ left: '241px', top: '0px', width: '1199px', height: '64px', position: 'absolute' }} aria-label="Top bar">
        <div className="top-controls" style={{ left: '32px', top: '16px', width: '80px', height: '32px' }}>
          <button className="circle-btn" type="button" aria-label="Go back" style={{ left: '0px', top: '0px', position: 'absolute' }}>
            <img
              className="icon"
              src="/assets/figmaimages/figma_image_0_9.svg"
              alt=""
              role="img"
              aria-label="Back"
              style={{ position: 'absolute', left: '7.44px', top: '0.25px', width: '8.8287px', height: '15.518px' }}
            />
          </button>
          <button className="circle-btn" type="button" aria-label="Go forward" style={{ left: '48px', top: '0px', position: 'absolute' }}></button>
        </div>

        <div
          className="top-auth"
          style={{
            position: 'absolute',
            left: '961.71875px',
            top: '8px',
            width: '205.28125px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '16px',
          }}
        >
          <a href="#" className="auth-link">Sign up</a>
          <button type="button" className="btn-login">Log in</button>
        </div>
      </header>

      {/* Bottom promo bar - enhanced to include a playback bar without changing existing classes or layout */}
      <section
        id="bottombar"
        className="bottombar"
        style={{ left: '0px', top: '832.21875px', width: '1440px', height: '67.78125px', position: 'absolute' }}
        aria-label="Preview banner and player controls"
        onKeyDown={onKeyControls}
      >
        <div className="progress" style={{ left: '1327px', top: '898px', width: '93px', height: '4px', position: 'absolute' }} aria-hidden="true"></div>

        <div
          className="bottom-content"
          style={{
            position: 'absolute',
            left: '15px',
            top: '12px',
            width: '1410px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Track metadata (artwork, title, artist) - keep classnames to avoid CSS shifts */}
          <div className="bottom-texts" style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '636.125px' }}>
            <span className="bt-title">
              {currentTrack ? currentTrack.title : 'Preview of Spotify'}
            </span>
            <span className="bt-sub">
              {currentTrack ? currentTrack.artist : 'Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed.'}
            </span>
          </div>

          {/* Center: Controls and progress */}
          <div
            className="player-center"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flex: '1',
              margin: '0 24px'
            }}
          >
            <div className="controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                className="circle-btn"
                aria-label="Previous track"
                onClick={player.prev}
              >
                <span aria-hidden="true">⏮</span>
              </button>
              <button
                type="button"
                className="circle-btn"
                onClick={player.togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                aria-pressed={isPlaying}
              >
                <span aria-hidden="true">{isPlaying ? '⏸' : '▶️'}</span>
              </button>
              <button
                type="button"
                className="circle-btn"
                aria-label="Next track"
                onClick={player.next}
              >
                <span aria-hidden="true">⏭</span>
              </button>
            </div>

            <div
              className="progress-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '420px',
                maxWidth: '640px',
                width: '40vw'
              }}
            >
              <span className="bt-sub" aria-label="Elapsed time">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(1, Math.floor(duration || 0))}
                value={Math.floor(currentTime || 0)}
                onChange={(e) => player.seek(Number(e.target.value))}
                className="progress-input"
                role="slider"
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={Math.max(1, Math.floor(duration || 0))}
                aria-valuenow={Math.floor(currentTime || 0)}
                style={{ width: '100%' }}
              />
              <span className="bt-sub" aria-label="Remaining time">
                {formatTime(Math.max(0, Math.floor((duration || 0) - (currentTime || 0))))}
              </span>
            </div>
          </div>

          {/* Right: Volume and CTA preserved */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="circle-btn"
              aria-label={muted ? 'Unmute' : 'Mute'}
              aria-pressed={muted}
              onClick={player.toggleMute}
              title={muted ? 'Unmute (M)' : 'Mute (M)'}
            >
              <span aria-hidden="true">{muted || volume === 0 ? '🔇' : volumePercent < 50 ? '🔈' : '🔊'}</span>
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volumePercent}
              onChange={(e) => player.setVolumePercent(Number(e.target.value) / 100)}
              className="volume-input"
              role="slider"
              aria-label="Volume"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={muted ? 0 : volumePercent}
              style={{ width: '120px' }}
            />
            <button type="button" className="btn-accent btn-cta" style={{ height: '48px' }}>
              Sign up free
            </button>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main id="content" className="content" style={{ left: '241px', top: '0px', width: '1199px', height: '832.375px', position: 'absolute' }}>
        <div className="banner" style={{ position: 'absolute', left: '0px', top: '0px', width: '1199px', height: '332px' }}></div>

        {/* Section: Focus */}
        <section className="section" aria-labelledby="sec-focus" style={{ position: 'absolute', left: '32px', top: '88px', width: '1135px' }}>
          <div className="section-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '30px' }}>
            <h2 id="sec-focus" className="sec-title" style={{ margin: 0 }}>
              Focus
            </h2>
            <a href="#" className="sec-link">
              Show all
            </a>
          </div>

          <div className="card-row" style={{ display: 'flex', flexDirection: 'row', gap: '31px', marginTop: '16px' }}>
            <article className="card" style={{ width: '207.796875px' }}>
              <img
                className="card-img"
                src="/assets/figmaimages/figma_image_0_48.png"
                width="175"
                height="175"
                alt="Peaceful Piano cover"
                style={{ width: '175.796875px', height: '175.796875px' }}
              />
              <h3 className="card-title" style={{ margin: '12px 0 0 0' }}>
                Peaceful Piano
              </h3>
              <p className="card-desc" style={{ margin: '8px 0 0 0' }}>
                Relax and indulge with beautiful piano pieces
              </p>
            </article>

            <article className="card" style={{ width: '207.796875px' }}>
              <img
                className="card-img"
                src="/assets/figmaimages/figma_image_0_57.png"
                width="175"
                height="175"
                alt="Deep Focus cover"
                style={{ width: '175.796875px', height: '175.796875px' }}
              />
              <h3 className="card-title" style={{ margin: '12px 0 0 0' }}>
                Deep Focus
              </h3>
              <p className="card-desc" style={{ margin: '8px 0 0 0' }}>
                Keep calm and focus with ambient and post-rock music.
              </p>
            </article>

            <article className="card" style={{ width: '207.796875px' }}>
              <img
                className="card-img"
                src="/assets/figmaimages/figma_image_0_66.png"
                width="175"
                height="175"
                alt="Instrumental Study cover"
                style={{ width: '175.796875px', height: '175.796875px' }}
              />
              <h3 className="card-title" style={{ margin: '12px 0 0 0' }}>
                Instrumental Study
              </h3>
              <p className="card-desc" style={{ margin: '8px 0 0 0' }}>
                Focus with soft study music in the background.
              </p>
            </article>

            <article className="card" style={{ width: '207.796875px' }}>
              <img
                className="card-img"
                src="/assets/figmaimages/figma_image_0_75.png"
                width="175"
                height="175"
                alt="Jazz Vibes cover"
                style={{ width: '175.796875px', height: '175.796875px' }}
              />
              <h3 className="card-title" style={{ margin: '12px 0 0 0' }}>
                Jazz Vibes
              </h3>
              <p className="card-desc" style={{ margin: '8px 0 0 0' }}>
                The original chill instrumental beats playlist.
              </p>
            </article>

            <article className="card" style={{ width: '207.8125px' }}>
              <img
                className="card-img"
                src="/assets/figmaimages/figma_image_0_84.png"
                width="176"
                height="176"
                alt="Focus Flow cover"
                style={{ width: '175.8125px', height: '175.8125px' }}
              />
              <h3 className="card-title" style={{ margin: '12px 0 0 0' }}>
                Focus Flow
              </h3>
              <p className="card-desc" style={{ margin: '8px 0 0 0' }}>
                Uptempo instrumental hip hop beats.
              </p>
            </article>
          </div>
        </section>

        {/* Section: Spotify Playlists */}
        <section className="section" aria-labelledby="sec-spotify" style={{ position: 'absolute', left: '32px', top: '472.1875px', width: '1135px' }}>
          <div className="section-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '30px' }}>
            <h2 id="sec-spotify" className="sec-title" style={{ margin: 0 }}>
              Spotify Playlists
            </h2>
            <a href="#" className="sec-link">
              Show all
            </a>
          </div>

          <div className="card-row" style={{ display: 'flex', flexDirection: 'row', gap: '31px', marginTop: '16px' }}>
            <article className="card" style={{ width: '207.796875px' }}>
              <img
                className="card-img"
                src="/assets/figmaimages/figma_image_0_99.png"
                width="175"
                height="175"
                alt="Today's Top Hits cover"
                style={{ width: '175.796875px', height: '175.796875px' }}
              />
              <h3 className="card-title" style={{ margin: '12px 0 0 0' }}>
                Today&apos;s Top Hits
              </h3>
              <p className="card-desc" style={{ margin: '8px 0 0 0' }}>
                Ed Sheeran is on top of the Hottest 50!
              </p>
            </article>

            <article className="card" style={{ width: '207.796875px' }}>
              <img
                className="card-img"
                src="/assets/figmaimages/figma_image_0_108.png"
                width="175"
                height="175"
                alt="RapCaviar cover"
                style={{ width: '175.796875px', height: '175.796875px' }}
              />
              <h3 className="card-title" style={{ margin: '12px 0 0 0' }}>
                RapCaviar
              </h3>
              <p className="card-desc" style={{ margin: '8px 0 0 0' }}>
                New music from Roddy Ricch, Kodak Black, NLE Choppa and BIA.
              </p>
            </article>

            <article className="card" style={{ width: '207.796875px' }}>
              <img
                className="card-img"
                src="/assets/figmaimages/figma_image_0_117.png"
                width="175"
                height="175"
                alt="All Out 2010s cover"
                style={{ width: '175.796875px', height: '175.796875px' }}
              />
              <h3 className="card-title" style={{ margin: '12px 0 0 0' }}>
                All Out 2010s
              </h3>
              <p className="card-desc" style={{ margin: '8px 0 0 0' }}>
                The biggest songs of the 2010s.
              </p>
            </article>

            <article className="card" style={{ width: '207.796875px' }}>
              <img
                className="card-img"
                src="/assets/figmaimages/figma_image_0_126.png"
                width="175"
                height="175"
                alt="Rock Classics cover"
                style={{ width: '175.796875px', height: '175.796875px' }}
              />
              <h3 className="card-title" style={{ margin: '12px 0 0 0' }}>
                Rock Classics
              </h3>
              <p className="card-desc" style={{ margin: '8px 0 0 0' }}>
                Rock legends &amp; epic songs that continue to inspire generations. Cover: Foo Fighters
              </p>
            </article>

            <article className="card" style={{ width: '207.8125px' }}>
              <img
                className="card-img"
                src="/assets/figmaimages/figma_image_0_135.png"
                width="176"
                height="176"
                alt="Chill Hits cover"
                style={{ width: '175.8125px', height: '175.8125px' }}
              />
              <h3 className="card-title" style={{ margin: '12px 0 0 0' }}>
                Chill Hits
              </h3>
              <p className="card-desc" style={{ margin: '8px 0 0 0' }}>
                Kick back to the best new and recent chill hits.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SpotifyClone;
