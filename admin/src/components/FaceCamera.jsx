import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = '/models/face-api';

const FaceCamera = ({ onDescriptorCaptured, onError }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [status, setStatus] = useState('Loading face detection models...');
  const [capturing, setCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  // Load face-api models
  useEffect(() => {
    let cancelled = false;

    const loadModels = async () => {
      try {
        // Ensure TF backend is ready
        await faceapi.tf.setBackend('webgl');
        await faceapi.tf.ready();

        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        if (!cancelled) {
          setModelsLoaded(true);
          setStatus('Starting camera...');
        }
      } catch (err) {
        console.error('Face-api model loading error:', err);
        if (!cancelled) {
          setStatus('Failed to load face detection models.');
          onError?.('Failed to load face detection models: ' + (err.message || 'Unknown error'));
        }
      }
    };

    loadModels();
    return () => { cancelled = true; };
  }, []);

  // Start camera after models are loaded
  useEffect(() => {
    if (!modelsLoaded) return;

    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('Camera access denied.');
          onError?.('Camera access denied. Please allow camera access and try again.');
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [modelsLoaded]);

  const handleVideoPlay = useCallback(() => {
    setCameraReady(true);
    setStatus('Position your face in the frame');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const detectFaces = async () => {
      if (!video || video.paused || video.ended) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      const resized = faceapi.resizeResults(detections, displaySize);

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (resized.length === 1) {
        const box = resized[0].detection.box;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        setFaceDetected(true);
        setStatus('Face detected! Click "Capture" to register.');
      } else if (resized.length > 1) {
        setFaceDetected(false);
        setStatus('Multiple faces detected. Please ensure only one face is visible.');
      } else {
        setFaceDetected(false);
        setStatus('No face detected. Position your face in the frame.');
      }

      animationRef.current = requestAnimationFrame(detectFaces);
    };

    detectFaces();
  }, []);

  const captureDescriptor = useCallback(async () => {
    if (!videoRef.current || capturing) return;

    setCapturing(true);
    setStatus('Scanning face...');

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus('No face detected. Please try again.');
        setCapturing(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      onDescriptorCaptured?.(descriptor);
    } catch (err) {
      setStatus('Failed to capture face. Please try again.');
      onError?.('Failed to capture face data.');
    } finally {
      setCapturing(false);
    }
  }, [capturing, onDescriptorCaptured, onError]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md aspect-[4/3] bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onPlay={handleVideoPlay}
          className="w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Overlay guide */}
        {cameraReady && !faceDetected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-60 border-2 border-dashed border-white/40 rounded-full" />
          </div>
        )}

        {/* Loading overlay */}
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-3"></div>
              <p className="text-white text-sm">{status}</p>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <p className={`text-sm text-center ${faceDetected ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
        {cameraReady ? status : ''}
      </p>

      {/* Capture button */}
      {cameraReady && (
        <button
          onClick={captureDescriptor}
          disabled={!faceDetected || capturing}
          className={`px-8 py-3 rounded-full text-white font-medium transition-all ${
            faceDetected && !capturing
              ? 'bg-primary-600 hover:bg-primary-700 cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {capturing ? 'Scanning...' : 'Capture Face'}
        </button>
      )}
    </div>
  );
};

export default FaceCamera;
