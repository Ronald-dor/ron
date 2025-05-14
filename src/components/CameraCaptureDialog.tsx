
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, CameraOff, CheckCircle, XCircle as CircleXIcon } from 'lucide-react'; // Renomeado CircleX para CircleXIcon para evitar conflito
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
  const [stream, setStream] = useState<MediaStream | null>(null); // Store stream in state to manage it
  const { toast } = useToast();

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      if (videoRef.current) {
        try {
          currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(currentStream); // Set stream to state
          videoRef.current.srcObject = currentStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => console.error("Video play failed:",err));
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

    const stopCamera = () => {
      if (stream) { // Use stream from state for cleanup
        stream.getTracks().forEach(track => track.stop());
      }
       if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null); // Clear stream state
    };

    if (isOpen) {
      setHasCameraPermission(null); // Reset permission status on open
      startCamera();
    } else {
      stopCamera();
    }

    // Cleanup function to stop camera when dialog closes or component unmounts
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [isOpen]); // Only re-run when isOpen changes. `toast` is stable.

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure video dimensions are available
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
                playsInline // Important for iOS
                muted // Important for autoplay in some browsers
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
