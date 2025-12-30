# 🎥 Testing with Video Files

This guide shows you how to test the parking detection system with video files.

## Quick Test

### Step 1: Extract a Frame from Your Video

```bash
cd server/opencv_service

# Extract first frame (frame 0)
python test_video.py path/to/your/video.mp4 0

# Extract last frame
python test_video.py path/to/your/video.mp4 -1

# Extract specific frame (e.g., frame 100)
python test_video.py path/to/your/video.mp4 100
```

This will:
- Extract the frame from your video
- Save it as `test_frame_X.jpg` in the opencv_service directory
- Show video information (total frames, FPS, duration)

### Step 2: Use the Extracted Frame

You can now use the extracted frame image just like any other image:

1. **Define slot regions** using the frame image
2. **Test detection** using the frame image
3. Or use the video file directly (see below)

---

## Using Video Files Directly

The OpenCV service now supports video files directly! You can:

### Option 1: Via API (Recommended)

When calling the detection API, you can use a video file path:

```json
POST http://localhost:5001/detect-occupancy

{
  "image_path": "C:/path/to/your/parking_video.mp4",
  "video_frame": 0,  // Frame number: 0 = first, -1 = last, or specific number
  "slots": [
    {
      "slot_id": "S1",
      "slot_number": 1,
      "coordinates": [[0.1, 0.2], [0.3, 0.2], [0.3, 0.4], [0.1, 0.4]],
      "image_width": 1920,
      "image_height": 1080
    }
  ],
  "threshold": 0.15
}
```

### Option 2: Extract Frame First

1. Extract a frame from your video using `test_video.py`
2. Use that frame image to define slots
3. Test detection on different frames from the video

---

## Supported Video Formats

The service supports common video formats:
- `.mp4` (recommended)
- `.avi`
- `.mov`
- `.mkv`
- `.flv`
- `.wmv`
- `.webm`

---

## Testing Workflow

### Complete Testing Workflow

1. **Get a video of your parking lot**
   ```bash
   # Copy your video to the project directory or note the path
   ```

2. **Extract a reference frame**
   ```bash
   cd server/opencv_service
   python test_video.py your_video.mp4 0
   # This creates test_frame_0.jpg
   ```

3. **Define slots using the reference frame**
   - Use the slot selector on the extracted frame
   - Or manually define coordinates

4. **Test detection on different frames**
   ```bash
   # Test on frame 0
   python test_video.py your_video.mp4 0
   
   # Test on frame 100
   python test_video.py your_video.mp4 100
   
   # Test on last frame
   python test_video.py your_video.mp4 -1
   ```

5. **Use via API**
   - Enable camera detection for a parking lot
   - Set `cameraImageUrl` to your video path
   - Call detection API with `video_frame` parameter

---

## Video Frame Options

- `0` or not specified: First frame
- `-1`: Last frame  
- `N` (positive number): Specific frame number (e.g., 100 = frame 100)
- `-N` (negative number): N frames from the end (e.g., -10 = 10 frames before the end)

---

## Tips

1. **Reference Frame**: Use the first frame (frame 0) or a clear frame to define slots
2. **Frame Selection**: Choose frames where vehicles are clearly visible
3. **File Paths**: Use absolute paths or paths relative to where the service is running
4. **Performance**: Videos are larger, so frame extraction takes a bit longer than images

---

## Example: Testing with Video

```bash
# 1. Start OpenCV service
cd server/opencv_service
.\venv\Scripts\Activate.ps1
python service.py

# 2. In another terminal, extract a test frame
python test_video.py parking_lot.mp4 0

# 3. Use the extracted frame to define slots
python slot_selector.py test_frame_0.jpg slots.json

# 4. Test detection on different frames via API or by extracting more frames
```

---

## Troubleshooting

**Video won't load?**
- Check file path is correct
- Verify video format is supported
- Make sure OpenCV can read the video codec

**Frame extraction fails?**
- Video might be corrupted
- Frame number might be out of range
- Check video has frames: `python test_video.py video.mp4 0` first

**Detection not working on video frames?**
- Make sure slot coordinates were defined using a frame from the same video
- Check video resolution matches the coordinates' image dimensions


