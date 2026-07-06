"use client";

import { useRef, useState, useCallback } from "react";

type PODCameraProps = {
  onCapture: (imageData: string) => void;
  onError?: (error: string) => void;
};

export function PODCamera({ onCapture, onError }: PODCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Camera access denied";
      onError?.(message);
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
    stopCamera();
  }, [stopCamera]);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", background: "#000" }}>
        {capturedImage ? (
          <img src={capturedImage} alt="Captured POD" style={{ width: "100%", display: "block" }} />
        ) : (
          <video ref={videoRef} style={{ width: "100%", display: isStreaming ? "block" : "none" }} playsInline muted />
        )}
        <canvas ref={canvasRef} style={{ display: "none" }} />
        {!isStreaming && !capturedImage && (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="2" style={{ margin: "0 auto 16px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>Tap to start camera</p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        {!isStreaming && !capturedImage && (
          <button onClick={startCamera} className="btn btn-primary" style={{ flex: 1 }}>
            Start Camera
          </button>
        )}
        {isStreaming && (
          <>
            <button onClick={capturePhoto} className="btn btn-primary" style={{ flex: 1 }}>
              Capture Photo
            </button>
            <button onClick={stopCamera} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
          </>
        )}
        {capturedImage && (
          <>
            <button onClick={confirmCapture} className="btn btn-primary" style={{ flex: 1 }}>
              Confirm & Upload
            </button>
            <button onClick={retake} className="btn btn-secondary" style={{ flex: 1 }}>
              Retake
            </button>
          </>
        )}
      </div>
    </div>
  );
}
