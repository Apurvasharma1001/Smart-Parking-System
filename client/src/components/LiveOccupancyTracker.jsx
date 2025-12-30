import { useState, useRef, useEffect } from 'react';
import { parkingLotAPI } from '../services/api';

const LiveOccupancyTracker = ({ parkingLotId, slots, onClose }) => {
  const [stream, setStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [slotStatuses, setSlotStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
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
        // Wait for video to be ready before starting
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded:', videoRef.current.videoWidth, videoRef.current.videoHeight);
          setIsStreaming(true);
          // Start detection loop after video is ready
          startDetection();
        };
        videoRef.current.onloadeddata = () => {
          console.log('Video data loaded');
          setIsStreaming(true);
          startDetection();
        };
        // Also set streaming immediately as fallback
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            setIsStreaming(true);
            startDetection();
          }
        }, 100);
      } else {
        setIsStreaming(true);
        startDetection();
      }
    } catch (error) {
      alert('Could not access camera. Please ensure camera permissions are granted.');
      console.error('Camera error:', error);
    }
  };

  const captureFrameForDetection = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg');
  };

  const startDetection = () => {
    // Run detection every 2 seconds
    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || loading) return;

      try {
        setLoading(true);
        const imageData = captureFrameForDetection();
        
        // Send frame to backend for OpenCV processing
        try {
          const response = await parkingLotAPI.processFrame(parkingLotId, imageData);
          
          if (response.data && response.data.slots) {
            const statusMap = {};
            response.data.slots.forEach(slot => {
              statusMap[slot.slot_number] = slot.status;
            });
            setSlotStatuses(statusMap);
          }
        } catch (processError) {
          console.error('Frame processing error:', processError);
          // Fallback to refreshing from backend
          const response = await parkingLotAPI.getSlotStatus(parkingLotId);
          if (response.data && response.data.slots) {
            const statusMap = {};
            response.data.slots.forEach(slot => {
              statusMap[slot.slot_number] = slot.status;
            });
            setSlotStatuses(statusMap);
          }
        }
      } catch (error) {
        console.error('Detection error:', error);
      } finally {
        setLoading(false);
      }
    }, 2000); // Detect every 2 seconds
  };

  // Draw live feed with slot overlays
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
        const needsResize = canvas.width !== video.videoWidth || canvas.height !== video.videoHeight;
        if (needsResize) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          console.log('Canvas resized to:', canvas.width, canvas.height);
        }
        
        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw video frame
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch (e) {
          console.error('Error drawing video:', e);
          animationFrameRef.current = requestAnimationFrame(draw);
          return;
        }
        
        // Draw slots with color coding
        if (slots && slots.length > 0) {
          slots.forEach((slot, index) => {
            if (slot.coordinates && Array.isArray(slot.coordinates) && slot.coordinates.length >= 3) {
              // Denormalize coordinates (they should be normalized 0-1)
              const points = slot.coordinates.map(coord => {
                // Handle both normalized [x, y] and array format
                const x = Array.isArray(coord) ? coord[0] : (coord.x !== undefined ? coord.x : 0);
                const y = Array.isArray(coord) ? coord[1] : (coord.y !== undefined ? coord.y : 0);
                return {
                  x: x * canvas.width,
                  y: y * canvas.height
                };
              });
              
              ctx.beginPath();
              ctx.moveTo(points[0].x, points[0].y);
              for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
              }
              ctx.closePath();
              
              // Color based on status (red for occupied, green for vacant)
              const slotNumber = slot.slot_number || slot.slotNumber || (index + 1);
              const isOccupied = slotStatuses[slotNumber] === 'occupied';
              
              // Fill with transparent color
              ctx.fillStyle = isOccupied 
                ? 'rgba(255, 0, 0, 0.5)' // Red transparent for occupied (50% opacity)
                : 'rgba(0, 255, 0, 0.4)'; // Green transparent for vacant (40% opacity)
              ctx.fill();
              
              // Draw border (thicker for occupied)
              ctx.strokeStyle = isOccupied ? '#ff0000' : '#00ff00';
              ctx.lineWidth = isOccupied ? 4 : 3;
              ctx.stroke();
              
              // Draw slot number and status
              const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
              const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
              
              ctx.fillStyle = '#fff';
              ctx.font = 'bold 20px Arial';
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 4;
              const text = `S${slotNumber} ${isOccupied ? '🚗' : '🅿️'}`;
              ctx.strokeText(text, centerX - 30, centerY);
              ctx.fillText(text, centerX - 30, centerY);
            }
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
    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [slots, slotStatuses, isStreaming]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
  };

  const refreshDetection = async () => {
    try {
      setLoading(true);
      const response = await parkingLotAPI.getSlotStatus(parkingLotId);
      
      if (response.data && response.data.slots) {
        const statusMap = {};
        response.data.slots.forEach(slot => {
          statusMap[slot.slot_number] = slot.status;
        });
        setSlotStatuses(statusMap);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Live Occupancy Tracking</h2>
              <p className="text-sm text-gray-600 mt-1">
                Red = Occupied 🚗 | Green = Vacant 🅿️
              </p>
            </div>
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
              <p className="mb-6 text-gray-700 text-lg">Start camera to track occupancy in real-time</p>
              <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
              >
                📷 Start Live Tracking
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex gap-4 items-center">
                <button
                  onClick={refreshDetection}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                  {loading ? 'Detecting...' : '🔄 Refresh Detection'}
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
                >
                  Stop Camera
                </button>
                <div className="ml-auto text-sm text-gray-600">
                  Detection runs automatically every 2 seconds
                </div>
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
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '60vh', 
                    display: 'block', 
                    position: 'relative', 
                    zIndex: 1,
                    backgroundColor: '#000'
                  }}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Slot Status:</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {slots && slots.map((slot, index) => {
                    const slotNumber = slot.slot_number || slot.slotNumber || (index + 1);
                    const isOccupied = slotStatuses[slotNumber] === 'occupied';
                    return (
                      <div
                        key={slot._id || index}
                        className={`p-2 rounded-lg text-center text-xs font-semibold border-2 ${
                          isOccupied
                            ? 'bg-red-100 text-red-800 border-red-400'
                            : 'bg-green-100 text-green-800 border-green-400'
                        }`}
                        style={{
                          backgroundColor: isOccupied 
                            ? 'rgba(255, 0, 0, 0.2)' 
                            : 'rgba(0, 255, 0, 0.2)'
                        }}
                      >
                        <div className="text-lg mb-1">{isOccupied ? '🚗' : '🅿️'}</div>
                        <div className="font-bold">S{slotNumber}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveOccupancyTracker;

