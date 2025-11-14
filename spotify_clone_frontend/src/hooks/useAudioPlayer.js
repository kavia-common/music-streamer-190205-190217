/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * useAudioPlayer provides controls and state for an audio playlist using HTMLAudioElement.
 */
export function useAudioPlayer(initialTracks = [], initialIndex = 0) {
  /** Hook managing audio playback: load, play/pause, seek, next/prev, volume/mute, and time updates. */
  const [tracks, setTracks] = useState(initialTracks);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8); // 0..1
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef(null);

  // Create audio element lazily
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const onTimeUpdate = () => setCurrentTime(Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
    const onEnded = () => {
      next();
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeAttribute("src");
      audio.load();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentTrack = useMemo(() => tracks[currentIndex], [tracks, currentIndex]);

  const loadIndex = useCallback(
    async (index, autoPlay = false) => {
      if (!audioRef.current || !tracks[index]) return;
      const audio = audioRef.current;
      setIsLoading(true);
      setCurrentIndex(index);
      setCurrentTime(0);
      setDuration(0);
      audio.autoplay = autoPlay;
      audio.src = tracks[index].audioUrl;
      audio.muted = muted;
      audio.volume = volume;
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Autoplay might be blocked; keep paused state
        if (!autoPlay) audio.pause();
      } finally {
        setIsLoading(false);
      }
    },
    [tracks, muted, volume]
  );

  const loadTracks = useCallback(
    (newTracks, startIndex = 0, autoPlay = false) => {
      setTracks(newTracks);
      if (newTracks.length) {
        loadIndex(Math.min(Math.max(0, startIndex), newTracks.length - 1), autoPlay);
      }
    },
    [loadIndex]
  );

  const play = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      // ignored
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const seek = useCallback(
    (time) => {
      if (!audioRef.current || !Number.isFinite(time)) return;
      const next = Math.min(Math.max(0, time), duration || 0);
      audioRef.current.currentTime = next;
      setCurrentTime(next);
    },
    [duration]
  );

  const setVolumePercent = useCallback((v) => {
    // v in 0..1
    const clamped = Math.min(Math.max(v, 0), 1);
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      if (clamped > 0 && audioRef.current.muted) {
        audioRef.current.muted = false;
        setMuted(false);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const nextMuted = !audioRef.current.muted;
    audioRef.current.muted = nextMuted;
    setMuted(nextMuted);
  }, []);

  const prev = useCallback(() => {
    if (!tracks.length) return;
    const nextIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    loadIndex(nextIndex, isPlaying);
  }, [tracks, currentIndex, isPlaying, loadIndex]);

  const next = useCallback(() => {
    if (!tracks.length) return;
    const nextIndex = (currentIndex + 1) % tracks.length;
    loadIndex(nextIndex, isPlaying);
  }, [tracks, currentIndex, isPlaying, loadIndex]);

  // Keep element volume/mute in sync with state
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
  }, [muted]);

  return {
    // state
    tracks,
    currentIndex,
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    muted,

    // controls
    loadTracks,
    loadIndex,
    play,
    pause,
    togglePlay,
    seek,
    prev,
    next,
    setVolumePercent,
    toggleMute,
  };
}
