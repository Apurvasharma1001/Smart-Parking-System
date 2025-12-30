# 📹 Camera Integration Guide

This guide explains how to set up and use camera feeds for parking detection.

## Camera Source Types

The system supports multiple camera source types:

### 1. Webcam/USB Camera
- Built-in laptop cameras
- USB-connected cameras
- Format: `camera://0`, `camera://1`, etc.
- Example: `camera://0` (first camera)

### 2. IP Camera
- Network cameras (RTSP, HTTP streams)
- Format: `rtsp://ip:port/stream` or `http://ip:port/stream`
- Example: `rtsp://192.168.1.100:554/stream`

### 3. Video File
- Pre-recorded video files
- Formats: `.mp4`, `.avi`, `.mov`, `.mkv`, etc.
- Example: `C:/videos/parking.mp4`

### 4. Image File
- Static image files
- Formats: `.jpg`, `.png`, `.bmp`, etc.
- Example: `C:/images/parking.jpg`

## API Endpoints

### 1. List Available Cameras

**GET** `/api/parking-lots/cameras`

Lists all available webcam/USB cameras on the system.

**Response:**
```json
{
  "success": true,
  "cameras": [
    {
      "index": 0,
      "name": "Camera 0",
      "type": "webcam",
      "width": 1920,
      "height": 1080,
      "fps": 30,
      "backend": "DirectShow",
      "source": "camera://0"
    },
    {
      "index": 1,
      "name": "Camera 1",
      "type": "webcam",
      "width": 1280,
      "height": 720,
      "fps": 30,
      "backend": "DirectShow",
      "source": "camera://1"
    }
  ],
  "source_types": [
    {
      "type": "webcam",
      "label": "Webcam/USB Camera",
      "description": "Built-in or USB connected camera",
      "format": "camera://{index}",
      "example": "camera://0"
    },
    {
      "type": "ip_camera",
      "label": "IP Camera",
      "description": "Network IP camera (RTSP, HTTP, etc.)",
      "format": "rtsp://ip:port/stream",
      "example": "rtsp://192.168.1.100:554/stream"
    },
    {
      "type": "file",
      "label": "Video File",
      "description": "Pre-recorded video file",
      "format": "file path",
      "example": "C:/videos/parking.mp4"
    },
    {
      "type": "image",
      "label": "Image File",
      "description": "Static image file",
      "format": "file path",
      "example": "C:/images/parking.jpg"
    }
  ]
}
```

### 2. Test Camera Connection

**POST** `/api/parking-lots/test-camera`

Test if a camera source is accessible.

**Request:**
```json
{
  "source": "camera://0"
}
```

**Response:**
```json
{
  "success": true,
  "source": "camera://0",
  "message": "Camera 0 connected successfully",
  "width": 1920,
  "height": 1080,
  "fps": 30
}
```

### 3. Enable Camera Detection

**POST** `/api/parking-lots/:id/enable-camera`

Enable camera detection for a parking lot.

**Request:**
```json
{
  "cameraSource": "camera://0",
  "cameraSourceType": "webcam",
  "threshold": 0.15
}
```

**Response:**
```json
{
  "message": "Camera detection enabled successfully",
  "parkingLot": {
    "_id": "...",
    "cameraEnabled": true,
    "cameraSource": "camera://0",
    "cameraSourceType": "webcam",
    "cameraThreshold": 0.15
  }
}
```

## Usage Workflow

### Step 1: List Available Cameras

```bash
GET /api/parking-lots/cameras
Authorization: Bearer <token>
```

This will show you all available cameras on the system.

### Step 2: Test Camera Connection

```bash
POST /api/parking-lots/test-camera
Authorization: Bearer <token>

{
  "source": "camera://0"
}
```

Verify the camera works before enabling detection.

### Step 3: Enable Camera Detection

```bash
POST /api/parking-lots/:id/enable-camera
Authorization: Bearer <token>

{
  "cameraSource": "camera://0",
  "cameraSourceType": "webcam",
  "threshold": 0.15
}
```

### Step 4: Define Slot Regions

Define slot regions using a captured frame from the camera (see slot definition guide).

### Step 5: Test Detection

```bash
POST /api/parking-lots/:id/refresh-slots
Authorization: Bearer <token>
```

This will capture a frame from the camera and detect occupancy.

## Frontend Integration (For Developers)

To add camera selection in the frontend:

1. **Fetch available cameras:**
   ```javascript
   const response = await fetch('/api/parking-lots/cameras', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   const { cameras, source_types } = await response.json();
   ```

2. **Create dropdown:**
   ```jsx
   <select onChange={(e) => setSelectedCamera(e.target.value)}>
     <option value="">Select Camera Source</option>
     {cameras.map(camera => (
       <option key={camera.index} value={camera.source}>
         {camera.name} ({camera.width}x{camera.height})
       </option>
     ))}
     <option value="file">Video/Image File</option>
     <option value="ip">IP Camera</option>
   </select>
   ```

3. **Test connection:**
   ```javascript
   const testResult = await fetch('/api/parking-lots/test-camera', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       source: selectedCamera
     })
   });
   ```

4. **Enable camera:**
   ```javascript
   await fetch(`/api/parking-lots/${parkingLotId}/enable-camera`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       cameraSource: selectedCamera,
       cameraSourceType: 'webcam',
       threshold: 0.15
     })
   });
   ```

## Troubleshooting

### Camera Not Detected?
- Make sure camera is connected and not being used by another application
- Try different camera indices (0, 1, 2, etc.)
- Check camera permissions in Windows

### Camera Connection Fails?
- Verify camera index is correct
- Make sure camera is not being used by another app
- Try testing with a different camera

### IP Camera Not Working?
- Verify network connection
- Check RTSP/HTTP URL format is correct
- Ensure camera is accessible from the server
- Some IP cameras may require authentication (add to URL)

### Low Frame Rate?
- Camera detection captures frames on-demand (not continuous streaming)
- For real-time detection, call refresh-slots endpoint periodically
- Consider using lower resolution cameras for faster processing

## Best Practices

1. **Always test camera connection** before enabling detection
2. **Use clear camera positioning** - ensure good view of parking slots
3. **Adequate lighting** - better lighting = better detection
4. **Stable camera mount** - avoid camera movement
5. **Define slots accurately** - use clear reference frame

## Example: Complete Setup

```bash
# 1. List cameras
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/parking-lots/cameras

# 2. Test camera
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"source": "camera://0"}' \
  http://localhost:5000/api/parking-lots/test-camera

# 3. Enable camera for parking lot
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cameraSource": "camera://0",
    "cameraSourceType": "webcam",
    "threshold": 0.15
  }' \
  http://localhost:5000/api/parking-lots/{parkingLotId}/enable-camera
```

