import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import MusicRecommendations from './MusicRecommendations';
import { Camera, CameraOff, BrainCircuit, Type, AlertCircle } from 'lucide-react';

export default function WebcamEmotion() {
  const webcamRef = useRef(null);
  const [emotion, setEmotion] = useState(null);
  const [textSentiment, setTextSentiment] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [error, setError] = useState("");

  const captureAndDetect = useCallback(async () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const fetchRes = await fetch(imageSrc);
      const blob = await fetchRes.blob();

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      if (textInput.trim()) {
        formData.append('text', textInput.trim());
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/emotion/detect-emotion`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Log mood to analytics if changed
        if (data.dominant_emotion && data.dominant_emotion !== emotion) {
           fetch(`${apiUrl}/analytics/log-mood`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ user_id: 1, emotion: data.dominant_emotion })
           }).catch(e => console.error("Failed to log mood:", e));
        }

        setEmotion(data.dominant_emotion);
        if (data.text_sentiment) {
          setTextSentiment(data.text_sentiment);
        } else {
          setTextSentiment(null);
        }
        setError(""); // clear previous errors
      } else {
        // Backend didn't find a face or failed
        setError("Unable to detect face clearly. Please adjust lighting.");
      }
    } catch (err) {
      console.error('Emotion detection failed:', err);
      setError("Connection to detection server lost.");
      setIsDetecting(false);
    }
  }, [webcamRef, textInput, emotion]);

  // Capture frame every 1.5 seconds when detecting
  useEffect(() => {
    let interval;
    if (isDetecting) {
      interval = setInterval(() => {
        captureAndDetect();
      }, 1500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isDetecting, captureAndDetect]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
      
      {error && (
        <div className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Webcam Section */}
        <div className="flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-2xl aspect-[4/3] flex items-center justify-center">
            {isDetecting ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Scanning Overlay Effect */}
                <div className="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none border-[3px] border-indigo-500/50 z-10" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <CameraOff size={48} className="mb-2 opacity-50" />
                <p>Camera is off</p>
              </div>
            )}

            {/* Live Emotion Overlay */}
            {isDetecting && emotion && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-6 py-2 rounded-full border border-slate-700 shadow-xl z-20 flex items-center gap-2">
                <BrainCircuit size={18} className="text-indigo-400" />
                <span className="text-white font-bold tracking-wider uppercase">{emotion}</span>
              </div>
            )}
          </div>

          <button 
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
              isDetecting 
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 text-white' 
              : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20 text-white'
            }`}
            onClick={() => {
              setIsDetecting(!isDetecting);
              if (isDetecting) setEmotion(null); // Reset on stop
            }}
          >
            {isDetecting ? <><CameraOff size={20}/> Stop Detection</> : <><Camera size={20}/> Start Detection</>}
          </button>
        </div>

        {/* Text Input Section */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Type size={20} className="text-violet-400" /> Optional Text Context
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Type how you're feeling to improve the AI's accuracy (40% weight). The AI combines this with your facial expression.
            </p>
            <textarea
              className="w-full flex-grow bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none transition-all"
              placeholder="E.g., I'm having a really stressful day..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={!isDetecting}
            />
            
            {textSentiment && isDetecting && (
              <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-between">
                <span className="text-slate-300 text-sm">Detected Sentiment:</span>
                <span className={`font-bold ${textSentiment.label === 'POSITIVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {textSentiment.label} ({Math.round(textSentiment.score * 100)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {emotion && !isDetecting && (
        <div className="w-full mt-8 animate-fade-in-up">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8" />
          <MusicRecommendations emotion={emotion} />
        </div>
      )}
    </div>
  );
}
