
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, CameraOff, CheckCircle, XCircle as CircleXIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUri: string) => void;
}

export function CameraCaptureDialog({ isOpen, onClose, onCapture }: CameraCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let currentStream: MediaStream | null = null; // Local variable to track the stream for this effect instance

    const startCamera = async () => {
      if (videoRef.current) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          currentStream = mediaStream; // Assign to local var for cleanup
          setStream(mediaStream); // Set to component state
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => {
                console.error("Video play failed:",err);
                toast({
                    variant: 'destructive',
                    title: 'Erro ao Iniciar Vídeo',
                    description: 'Não foi possível reproduzir o feed da câmera.',
                });
            });
          };
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Erro ao acessar a câmera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Acesso à Câmera Negado',
            description: 'Por favor, habilite a permissão da câmera nas configurações do seu navegador.',
          });
        }
      }
    };

    const stopComponentStream = () => { // Stops the stream currently in the component's state
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
       if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
    };

    if (isOpen) {
      setHasCameraPermission(null); // Reset permission status on open
      startCamera();
    } else {
      stopComponentStream(); // Stop the component's state stream if dialog is closed
    }

    // Cleanup function for this specific effect instance
    return () => {
      // This stops the stream that THIS particular effect instance started.
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      // If this effect was the one that set the video source, and it was this currentStream,
      // clear it to avoid the video element holding onto a stopped stream.
      if (videoRef.current && videoRef.current.srcObject === currentStream) {
         videoRef.current.srcObject = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // `toast` is stable from useToast hook.

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast({ variant: "destructive", title: "Erro ao Capturar", description: "Dimensões do vídeo não disponíveis. Tente novamente." });
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        onCapture(dataUri);
        onClose(); 
      } else {
         toast({ variant: "destructive", title: "Erro ao Capturar", description: "Não foi possível obter o contexto do canvas." });
      }
    } else {
         toast({ variant: "destructive", title: "Erro ao Capturar", description: "Câmera não está pronta ou referência não encontrada." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => { if (!openState) onClose(); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Capturar Foto do Terno</DialogTitle>
          <DialogDescription>
            Posicione o terno em frente à câmera e clique em "Capturar Foto".
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          {hasCameraPermission === null && <p className="text-center text-muted-foreground">Solicitando permissão da câmera...</p>}
          {hasCameraPermission === false && (
            <Alert variant="destructive">
              <CameraOff className="h-4 w-4" />
              <AlertTitle>Sem Acesso à Câmera</AlertTitle>
              <AlertDescription>
                Não foi possível acessar a câmera. Verifique as permissões no seu navegador e tente novamente.
              </AlertDescription>
            </Alert>
          )}
          {hasCameraPermission === true && (
            <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline 
                muted 
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <DialogClose asChild>
             <Button type="button" variant="outline" onClick={onClose}>
                <CircleXIcon className="mr-2 h-4 w-4" /> Cancelar
             </Button>
          </DialogClose>
          <Button type="button" onClick={handleCapture} disabled={!hasCameraPermission || !stream}>
            <CheckCircle className="mr-2 h-4 w-4" /> Capturar Foto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
