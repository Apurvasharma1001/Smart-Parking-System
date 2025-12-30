import { useState, useRef, useEffect } from 'react';

const LiveCameraSlotSelector = ({ onSlotsSelected, onClose }) => {
  const [stream, setStream] = useState(null);
  const [slots, setSlots] = useState([]);
  const [currentSlot, setCurrentSlot] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Set streaming immediately to start the draw loop
        setIsStreaming(true);
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded:', videoRef.current.videoWidth, videoRef.current.videoHeight);
        };
        videoRef.current.onloadeddata = () => {
          console.log('Video data loaded');
        };
        videoRef.current.onplaying = () => {
          console.log('Video is playing');
        };
      } else {
        setIsStreaming(true);
      }
    } catch (error) {
      alert('Could not access camera. Please ensure camera permissions are granted.');
      console.error('Camera error:', error);
    }
  };

  // Draw slots on live feed
  useEffect(() => {
    if (!isStreaming || !videoRef.current || !canvasRef.current) {
      console.log('Draw not ready:', { isStreaming, video: !!videoRef.current, canvas: !!canvasRef.current });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      // Check if video is ready
      if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas dimensions to match video (only if they changed)
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          console.log('Canvas resized to:', canvas.width, canvas.height);
        }
        
        // Draw video frame - this is the key line that makes the feed visible
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Draw completed slots with green transparent overlay
        slots.forEach((slot, slotIndex) => {
          if (slot.points.length >= 3) {
            ctx.beginPath();
            ctx.moveTo(slot.points[0].x, slot.points[0].y);
            for (let i = 1; i < slot.points.length; i++) {
              ctx.lineTo(slot.points[i].x, slot.points[i].y);
            }
            ctx.closePath();
            
            // Fill with green transparent
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw slot number
            const centerX = slot.points.reduce((sum, p) => sum + p.x, 0) / slot.points.length;
            const centerY = slot.points.reduce((sum, p) => sum + p.y, 0) / slot.points.length;
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 24px Arial';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText(`S${slotIndex + 1}`, centerX - 15, centerY);
            ctx.fillText(`S${slotIndex + 1}`, centerX - 15, centerY);
          }
        });
        
        // Draw current slot being defined with red
        if (currentSlot.length > 0) {
          ctx.beginPath();
          ctx.moveTo(currentSlot[0].x, currentSlot[0].y);
          for (let i = 1; i < currentSlot.length; i++) {
            ctx.lineTo(currentSlot[i].x, currentSlot[i].y);
          }
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Draw points
          currentSlot.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#ff0000';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        }
      } else {
        // Video not ready yet, keep trying
        console.log('Video not ready:', video.readyState, video.videoWidth, video.videoHeight);
      }
      
      // Always continue the animation loop
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Start the draw loop
    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [slots, currentSlot, isStreaming]);

  const handleCanvasClick = (e) => {
    if (!isStreaming || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    setCurrentSlot([...currentSlot, { x, y }]);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (currentSlot.length > 0) {
      setCurrentSlot(currentSlot.slice(0, -1));
    }
  };

  const finishSlot = () => {
    if (currentSlot.length >= 3) {
      setSlots([...slots, { points: [...currentSlot], id: slots.length + 1 }]);
      setCurrentSlot([]);
    } else {
      alert('A slot needs at least 3 points. Please add more points.');
    }
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const reset = () => {
    setSlots([]);
    setCurrentSlot([]);
  };

  const confirmSlots = () => {
    if (slots.length === 0) {
      alert('Please define at least one parking slot.');
      return;
    }

    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(video, 0, 0);

    const imageDataUrl = tempCanvas.toDataURL('image/jpeg');

    // Convert slots to the format expected by the backend
    const formattedSlots = slots.map((slot, index) => ({
      slot_number: index + 1,
      coordinates: slot.points.map(p => [p.x / video.videoWidth, p.y / video.videoHeight]), // Normalize to 0-1
      imageWidth: video.videoWidth,
      imageHeight: video.videoHeight
    }));

    onSlotsSelected({
      slots: formattedSlots,
      imageData: imageDataUrl,
      totalSlots: slots.length,
      imageWidth: video.videoWidth,
      imageHeight: video.videoHeight
    });
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Select Parking Slots - Live Camera Feed</h2>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
            >
              ×
            </button>
          </div>

          {!isStreaming ? (
            <div className="text-center py-12">
              <p className="mb-6 text-gray-700 text-lg">Click below to start your camera</p>
              <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
              >
                📷 Start Camera
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Instructions:</strong>
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Left-click on the live feed to add points and define parking slot regions</li>
                  <li>Right-click to remove the last point</li>
                  <li>Click "Finish Slot" when you've defined all points (minimum 3 points)</li>
                  <li>Define all slots, then click "Confirm" to save</li>
                  <li>Green transparent areas show completed slots</li>
                </ul>
              </div>
              
              <div className="relative border-4 border-gray-400 rounded-lg overflow-hidden bg-black mb-4" style={{ minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '1px', 
                    height: '1px', 
                    opacity: 0, 
                    pointerEvents: 'none',
                    visibility: 'hidden'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onContextMenu={handleRightClick}
                  className="w-full h-auto cursor-crosshair bg-black"
                  style={{ maxHeight: '60vh', display: 'block', position: 'relative', zIndex: 1, minHeight: '400px' }}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      className="bg-green-100 px-4 py-2 rounded-full text-sm font-semibold text-green-800 flex items-center gap-2 border-2 border-green-400"
                    >
                      Slot {index + 1}
                      <button
                        onClick={() => removeSlot(index)}
                        className="text-red-600 hover:text-red-800 font-bold text-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Current slot:</strong> {currentSlot.length} points</p>
                  <p><strong>Total slots defined:</strong> {slots.length}</p>
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={finishSlot}
                  disabled={currentSlot.length < 3}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                >
                  ✓ Finish Slot ({currentSlot.length} points)
                </button>
                <button
                  onClick={reset}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold"
                >
                  Reset All Slots
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold"
                >
                  Stop Camera
                </button>
                <button
                  onClick={confirmSlots}
                  disabled={slots.length === 0}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-lg ml-auto"
                >
                  ✓ Confirm ({slots.length} slots)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveCameraSlotSelector;

