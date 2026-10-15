import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  RotateCw,
  Upload,
  Mic,
  MicOff,
  Send,
  AlertTriangle,
  CheckCircle,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Info,
  Compass,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BoundingBoxOverlay } from './components/BoundingBoxOverlay';
import { ModeSelector } from './components/ModeSelector';
import { LanguageModal } from './components/LanguageModal';
import { PresetScenariosModal } from './components/PresetScenariosModal';
import { AudioVisualizer } from './components/AudioVisualizer';
import { SUPPORTED_LANGUAGES, AVAILABLE_VOICES, LanguageConfig } from './languages';
import { PRESET_SCENES } from './presetScenes';
import { Obstacle, VisionAnalysisResult, ChatMessage, VisionTask, PresetScene } from './types';
import { SpeechRecognizer, speakText, stopSpeaking } from './speechService';
import { soundFX } from './audioEffects';

export default function App() {
  // Languages & Voice Settings
  const [currentLanguage, setCurrentLanguage] = useState<LanguageConfig>(SUPPORTED_LANGUAGES[0]);
  const [voiceName, setVoiceName] = useState<string>('Zephyr');
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);

  // Vision Mode / Task
  const [currentTask, setCurrentTask] = useState<VisionTask>('obstacle_safety');

  // Camera & Image Stream State
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activePresetScene, setActivePresetScene] = useState<PresetScene | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);

  // Scanning & Analysis State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isAutoScan, setIsAutoScan] = useState<boolean>(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [selectedObstacle, setSelectedObstacle] = useState<Obstacle | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResult | null>(null);
  const [activeAlertText, setActiveAlertText] = useState<string>(
    'Drishti Voice AI active. Point your camera to detect obstacles or tap the microphone to ask questions.'
  );

  // Chat & Speech State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Check backend health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setBackendOnline(data.status === 'ok');
      })
      .catch(() => {
        setBackendOnline(false);
      });
  }, []);

  // Initialize Camera Stream
  const startCamera = useCallback(async (facing: 'environment' | 'user' = 'environment') => {
    try {
      setCameraError(null);
      setIsCameraActive(true);

      // Stop previous stream if active
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraError(
        'Camera stream unavailable or permission denied. Choose a demo environment below or upload an image.'
      );
      setIsCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Initialize on mount
  useEffect(() => {
    startCamera(cameraFacing);
    recognizerRef.current = new SpeechRecognizer();

    // Welcome greeting
    const initialMsg: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am Drishti Voice AI. Show me your surroundings via camera or choose a demo scene, and I will detect obstacles with bounding boxes and speak safety guidance in ${currentLanguage.name}.`,
      spokenSummary: `Drishti Voice AI ready in ${currentLanguage.name}. Tap scan or speak to begin.`,
      timestamp: new Date(),
    };
    setMessages([initialMsg]);

    return () => {
      stopCamera();
      stopSpeaking();
      recognizerRef.current?.stop();
    };
  }, [startCamera, cameraFacing, stopCamera, currentLanguage.name]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript, isThinking]);

  // Capture current camera video frame as base64 JPEG
  const captureFrame = useCallback((): string | null => {
    if (activeImage) return activeImage;

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    }
    return null;
  }, [activeImage]);

  // Trigger speech readout
  const speakSpokenAlert = useCallback(
    (textToSpeak: string) => {
      if (isVoiceMuted || !textToSpeak) return;

      setIsSpeaking(true);
      speakText(textToSpeak, {
        voiceName,
        languageCode: currentLanguage.code,
        speechLang: currentLanguage.speechLang,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    },
    [isVoiceMuted, voiceName, currentLanguage]
  );

  // Vision Scan Function
  const runVisionScan = useCallback(
    async (imageOverride?: string, customQuery?: string) => {
      const frameData = imageOverride || captureFrame();
      if (!frameData) {
        setActiveAlertText('Please activate camera or choose a demo scene to scan.');
        return;
      }

      setIsScanning(true);
      soundFX.playCue('scan');

      try {
        const response = await fetch('/api/vision-assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: frameData,
            language: currentLanguage.code,
            task: currentTask,
            query: customQuery,
          }),
        });

        const result = await response.json();
        setIsScanning(false);

        if (result.success && result.data) {
          const data: VisionAnalysisResult = result.data;
          setAnalysisResult(data);

          const formattedObstacles: Obstacle[] = (data.obstacles || []).map((obs, idx) => ({
            id: obs.id || `obs_${idx + 1}`,
            label: obs.label || 'Obstacle',
            isHazard: Boolean(obs.isHazard || obs.severity === 'high' || obs.severity === 'critical'),
            severity: obs.severity || 'medium',
            distance: obs.distance || 'nearby',
            location: obs.location || 'center',
            box2d:
              Array.isArray(obs.box2d) && obs.box2d.length === 4
                ? (obs.box2d as [number, number, number, number])
                : [300, 250, 700, 750],
          }));

          setObstacles(formattedObstacles);

          const alert = data.audioAlert || data.navigationAdvice || data.summary;
          setActiveAlertText(alert);

          // Audio cues based on safety
          if (data.urgentHazards && data.urgentHazards.length > 0) {
            soundFX.playCue('hazard');
          } else {
            soundFX.playCue('success');
          }

          // Spoken output
          speakSpokenAlert(alert);

          // Add to transcript log
          const newMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            text: data.summary,
            spokenSummary: alert,
            timestamp: new Date(),
            hazardWarning: data.urgentHazards?.length ? data.urgentHazards.join(' • ') : undefined,
            obstacles: formattedObstacles,
            taskType: currentTask,
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      } catch (err) {
        console.error('Vision assist scan failed:', err);
        setIsScanning(false);
        setActiveAlertText('Scan failed. Please verify connection and try again.');
      }
    },
    [captureFrame, currentLanguage.code, currentTask, speakSpokenAlert]
  );

  // Auto-Scan interval effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoScan && !isScanning) {
      timer = setTimeout(() => {
        runVisionScan();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isAutoScan, isScanning, runVisionScan]);

  // Handle User Chat / Question Submission
  const handleSendMessage = async (msgText: string) => {
    if (!msgText.trim()) return;

    soundFX.playCue('click');
    setTextInput('');
    setInterimTranscript('');
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: msgText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    const frameData = captureFrame();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          imageBase64: frameData,
          language: currentLanguage.code,
          history: messages.slice(-5).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      setIsThinking(false);

      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.reply,
          spokenSummary: data.spokenSummary,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setActiveAlertText(data.spokenSummary || data.reply);
        speakSpokenAlert(data.spokenSummary || data.reply);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setIsThinking(false);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I encountered an issue processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Toggle Voice Listening (Mic)
  const toggleListening = () => {
    if (isListening) {
      soundFX.playCue('listen-stop');
      recognizerRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      soundFX.playCue('listen-start');
      setIsListening(true);
      setInterimTranscript('');

      recognizerRef.current?.start(
        currentLanguage.speechLang || 'en-US',
        (res) => {
          setInterimTranscript(res.transcript);
          if (res.isFinal && res.transcript.trim()) {
            setIsListening(false);
            soundFX.playCue('listen-stop');
            handleSendMessage(res.transcript);
          }
        },
        (err) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  // Switch between front & back camera
  const handleToggleCameraFacing = () => {
    soundFX.playCue('click');
    const newFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(newFacing);
    setActiveImage(null);
    setActivePresetScene(null);
    startCamera(newFacing);
  };

  // File Upload Frame
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setActiveImage(base64);
        setActivePresetScene(null);
        stopCamera();
        runVisionScan(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select Preset Scene
  const handleSelectPresetScene = (scene: PresetScene) => {
    soundFX.playCue('click');
    setActivePresetScene(scene);
    stopCamera();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 640, 480);
          const jpegBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setActiveImage(jpegBase64);
          runVisionScan(jpegBase64);
          return;
        }
      }
      setActiveImage(scene.url);
      runVisionScan(scene.url);
    };
    img.onerror = () => {
      setActiveImage(scene.url);
      runVisionScan(scene.url);
    };
    img.src = scene.url;
  };

  // Reset to live camera
  const handleResetToLiveCamera = () => {
    soundFX.playCue('click');
    setActiveImage(null);
    setActivePresetScene(null);
    startCamera(cameraFacing);
  };

  // Obstacle selection for detail focus
  const handleSelectObstacle = (obs: Obstacle) => {
    soundFX.playCue('click');
    setSelectedObstacle(obs);
    const text = `${obs.label} located ${obs.location}, approximately ${obs.distance}. ${
      obs.isHazard ? 'Warning: potential hazard.' : 'Safe obstacle.'
    }`;
    setActiveAlertText(text);
    speakSpokenAlert(text);
  };

  const suggestedReplies = [
    'Is the path clear?',
    'Describe all obstacles',
    'Read any signs',
    'Where is the door or exit?',
    'Guide me forward',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Hidden processing canvas & file input */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Navigation Bar */}
      <Navbar
        currentLanguage={currentLanguage}
        onOpenLanguageModal={() => setIsLangModalOpen(true)}
        voiceName={voiceName}
        onChangeVoiceName={setVoiceName}
        isAutoScan={isAutoScan}
        onToggleAutoScan={() => {
          soundFX.playCue('click');
          setIsAutoScan(!isAutoScan);
        }}
        isVoiceMuted={isVoiceMuted}
        onToggleVoiceMute={() => {
          soundFX.playCue('click');
          if (!isVoiceMuted) stopSpeaking();
          setIsVoiceMuted(!isVoiceMuted);
        }}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Assistive Mode Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <ModeSelector currentTask={currentTask} onChangeTask={(task) => {
            soundFX.playCue('click');
            setCurrentTask(task);
            runVisionScan(undefined, `Focus on task: ${task}`);
          }} />

          {/* Preset Scenes & Voice selector quick bar */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsPresetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
              title="Select a demo environment"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Demo Scenes</span>
            </button>

            <select
              value={voiceName}
              onChange={(e) => {
                soundFX.playCue('click');
                setVoiceName(e.target.value);
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              title="Voice tone"
            >
              {AVAILABLE_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2-Column Responsive View: Left Viewfinder, Right Assistive Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start">
          {/* LEFT: Live Camera / Scene Viewfinder (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative w-full aspect-[4/3] sm:aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              {/* Live Video or Snapshot Image */}
              {activeImage ? (
                <img
                  src={activeImage}
                  alt="Current Scene"
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-cover bg-black"
                />
              )}

              {/* Bounding Box Visualizer Overlay */}
              <BoundingBoxOverlay
                obstacles={obstacles}
                isScanning={isScanning}
                onSelectObstacle={handleSelectObstacle}
                selectedObstacleId={selectedObstacle?.id}
              />

              {/* Top Status Banner: Safety & Hazard alert */}
              <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md shadow-lg transition-all ${
                    obstacles.some((o) => o.isHazard)
                      ? 'bg-rose-600/95 text-white animate-bounce'
                      : analysisResult?.pathClear
                      ? 'bg-emerald-600/90 text-white'
                      : 'bg-amber-600/90 text-white'
                  }`}
                >
                  {obstacles.some((o) => o.isHazard) ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>OBSTACLE AHEAD ({obstacles.filter((o) => o.isHazard).length})</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>PATH CLEAR ({obstacles.length} items)</span>
                    </>
                  )}
                </div>

                {activePresetScene && (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 text-cyan-300 border border-slate-800 text-xs font-semibold backdrop-blur-md">
                    Demo: {activePresetScene.title}
                  </span>
                )}
              </div>

              {/* Error fallback overlay if camera permission is denied */}
              {cameraError && !activeImage && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center">
                  <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Camera Stream Unavailable</h3>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">{cameraError}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setIsPresetModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Try Demo Environments
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Viewfinder Controls Toolbar */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                {/* Main Action: Scan Now */}
                <button
                  onClick={() => runVisionScan()}
                  disabled={isScanning}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold tracking-wide uppercase shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scanning...' : 'Scan Obstacles Now'}</span>
                </button>

                {/* Upload Photo Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                  title="Upload image frame"
                >
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">Upload</span>
                </button>

                {/* Switch Facing Camera */}
                <button
                  onClick={handleToggleCameraFacing}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                  title="Switch Front/Rear Camera"
                >
                  <RotateCw className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">Flip Cam</span>
                </button>
              </div>

              {/* Reset to Camera if viewing snapshot */}
              {activeImage && (
                <button
                  onClick={handleResetToLiveCamera}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Reset to Live</span>
                </button>
              )}
            </div>

            {/* Quick Demo Environment Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 text-[11px] font-medium shrink-0 flex items-center gap-1">
                <Compass className="w-3 h-3" /> Quick Scenes:
              </span>
              {PRESET_SCENES.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSelectPresetScene(scene)}
                  className={`shrink-0 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    activePresetScene?.id === scene.id
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {scene.title}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Voice Guidance, Speech Transcript & Obstacle Insights (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Live Spoken Audio Alert Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider font-bold text-indigo-400">
                      Live Voice Guidance ({currentLanguage.name})
                    </div>
                    <p className="text-sm font-semibold text-slate-100 mt-0.5 leading-snug">
                      {activeAlertText}
                    </p>
                  </div>
                </div>

                {/* Speak again button */}
                <button
                  onClick={() => speakSpokenAlert(activeAlertText)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                  title="Re-speak alert"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Detected Text / OCR snippet if present */}
              {analysisResult?.detectedText && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="font-bold text-cyan-400 uppercase tracking-wide text-[10px] block mb-1">
                    Detected Text / Signs
                  </span>
                  <p className="text-slate-200 font-mono text-[11px]">
                    "{analysisResult.detectedText}"
                  </p>
                </div>
              )}
            </div>

            {/* Conversation Transcript Log */}
            <div className="flex-1 flex flex-col rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden min-h-[280px] max-h-[400px]">
              <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  Assistant Transcript
                </span>
                <span className="text-[11px] text-slate-500">
                  {messages.length} interaction{messages.length === 1 ? '' : 's'}
                </span>
              </div>

              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 text-xs"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1.5 p-3 rounded-xl border transition-all ${
                      msg.role === 'user'
                        ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-100 ml-6'
                        : 'bg-slate-950/70 border-slate-800 text-slate-200 mr-2'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold uppercase tracking-wider">
                        {msg.role === 'user' ? 'You' : 'Drishti AI'}
                      </span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* Hazard Warning Pill */}
                    {msg.hazardWarning && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-semibold">
                        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{msg.hazardWarning}</span>
                      </div>
                    )}

                    {/* Obstacle tags */}
                    {msg.obstacles && msg.obstacles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {msg.obstacles.map((obs) => (
                          <button
                            key={obs.id}
                            onClick={() => handleSelectObstacle(obs)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                              obs.isHazard
                                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {obs.label} ({obs.location})
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Spoken replay button on assistant message */}
                    {msg.role === 'assistant' && msg.spokenSummary && (
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={() => speakSpokenAlert(msg.spokenSummary || msg.text)}
                          className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Replay Audio</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Interim Speech Preview */}
                {interimTranscript && (
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs italic ml-6 animate-pulse">
                    "{interimTranscript}..."
                  </div>
                )}

                {/* AI Thinking Animation */}
                {isThinking && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Analyzing scene and formulating response in {currentLanguage.name}...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Wave Visualizer & Status */}
            <div className="flex items-center justify-between gap-3 px-1">
              <AudioVisualizer
                isListening={isListening}
                isSpeaking={isSpeaking}
                isThinking={isThinking}
              />
              <span className="text-[11px] text-slate-400">
                {isListening
                  ? 'Listening to speech...'
                  : isSpeaking
                  ? 'Speaking guidance...'
                  : isThinking
                  ? 'Processing visual reasoning...'
                  : 'Tap microphone or ask below'}
              </span>
            </div>

            {/* Suggested Question Chips */}
            <div className="flex flex-wrap gap-1.5">
              {suggestedReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(reply)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Voice & Text Input Bar */}
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-indigo-500 transition-all shadow-lg">
              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(textInput);
                  }
                }}
                placeholder={`Ask Drishti in ${currentLanguage.name}...`}
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage(textInput)}
                disabled={!textInput.trim()}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={(lang) => {
          soundFX.playCue('click');
          setCurrentLanguage(lang);
          speakSpokenAlert(`Language set to ${lang.name}.`);
        }}
      />

      {/* Preset Demo Scenarios Modal */}
      <PresetScenariosModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectScene={handleSelectPresetScene}
        activeSceneId={activePresetScene?.id}
      />
    </div>
  );
}
