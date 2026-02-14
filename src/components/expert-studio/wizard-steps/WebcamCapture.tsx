import { useRef, useState, useCallback, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Camera, Video, Square, RotateCcw, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type CaptureMode = "photo" | "video";

interface WebcamCaptureProps {
  mode: CaptureMode;
  onCapture: (file: File) => void;
  onClose: () => void;
}

const WebcamCapture = ({ mode, onCapture, onClose }: WebcamCaptureProps) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: mode === "video",
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          if (playErr.name !== 'AbortError') throw playErr;
        }
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError") {
        setError(t("program_creator.webcam_permission_denied") || "Kamera hozzáférés megtagadva. Engedélyezd a böngésző beállításaiban.");
      } else if (err.name === "NotFoundError") {
        setError(t("program_creator.webcam_not_found") || "Nem található kamera ezen az eszközön.");
      } else {
        setError(t("program_creator.webcam_error") || "Hiba a kamera indításakor.");
      }
    }
  }, [mode, t]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    };
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setCapturedBlob(blob);
        setCapturedUrl(url);
        stopCamera();
      }
    }, "image/jpeg", 0.92);
  }, [stopCamera]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setCapturedBlob(blob);
        setCapturedUrl(url);
        stopCamera();
      };

      recorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      toast.error(t("program_creator.recording_error") || "Hiba a felvétel indításakor.");
    }
  }, [stopCamera, t]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const retake = useCallback(() => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedBlob(null);
    setCapturedUrl(null);
    setRecordingTime(0);
    startCamera();
  }, [capturedUrl, startCamera]);

  const confirmCapture = useCallback(() => {
    if (!capturedBlob) return;

    const ext = mode === "photo" ? "jpg" : "webm";
    const timestamp = Date.now();
    const file = new File(
      [capturedBlob],
      `webcam-${mode}-${timestamp}.${ext}`,
      { type: capturedBlob.type }
    );
    onCapture(file);
  }, [capturedBlob, mode, onCapture]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {mode === "photo" ? (
            <><Camera className="w-5 h-5 text-blue-500" /> {t("program_creator.take_photo") || "Fotó készítése"}</>
          ) : (
            <><Video className="w-5 h-5 text-red-500" /> {t("program_creator.record_video") || "Videó felvétele"}</>
          )}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {error ? (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-8 text-center">
          <Camera className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-sm text-destructive font-medium mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel") || "Mégse"}
            </Button>
            <Button onClick={startCamera}>
              {t("common.retry") || "Újrapróbálás"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            {/* Live camera feed */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${capturedUrl ? "hidden" : ""}`}
              autoPlay
              playsInline
              muted
            />

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Captured photo preview */}
            {capturedUrl && mode === "photo" && (
              <img src={capturedUrl} alt="Captured" className="w-full h-full object-cover" />
            )}

            {/* Captured video preview */}
            {capturedUrl && mode === "video" && (
              <video src={capturedUrl} className="w-full h-full object-cover" controls />
            )}

            {/* Loading overlay */}
            {!isStreaming && !capturedUrl && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}

            {/* Recording indicator */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full"
                >
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!capturedUrl ? (
              <>
                {mode === "photo" ? (
                  <Button
                    onClick={takePhoto}
                    disabled={!isStreaming}
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white border-4 border-blue-500 hover:bg-blue-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500" />
                  </Button>
                ) : (
                  <>
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        disabled={!isStreaming}
                        size="lg"
                        className="rounded-full w-16 h-16 bg-white border-4 border-red-500 hover:bg-red-50"
                      >
                        <div className="w-10 h-10 rounded-full bg-red-500" />
                      </Button>
                    ) : (
                      <Button
                        onClick={stopRecording}
                        size="lg"
                        className="rounded-full w-16 h-16 bg-white border-4 border-red-500 hover:bg-red-50"
                      >
                        <Square className="w-6 h-6 text-red-500 fill-red-500" />
                      </Button>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={retake} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  {t("program_creator.retake") || "Újra"}
                </Button>
                <Button onClick={confirmCapture} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Check className="w-4 h-4" />
                  {t("program_creator.use_capture") || "Használat"}
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default WebcamCapture;
