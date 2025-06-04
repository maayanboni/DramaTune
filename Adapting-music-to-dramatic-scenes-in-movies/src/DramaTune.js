import React, { useState, useRef, useEffect } from "react";

export default function DramaTune() {
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [musicTracks, setMusicTracks] = useState([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRefs = useRef([]);
  const [playingIndex, setPlayingIndex] = useState(null);

  //volume eq 
  const [eqValues, setEqValues] = useState({ volume: 1, bass: 0, treble: 0 });

  const handlePlay = (i) => {
    // Pause all other tracks
    audioRefs.current.forEach((aud, idx) => {
      if (aud && idx !== i) {
        aud.pause();
        aud.currentTime = 0;
      }
    });
    // Play video from start
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    // Play selected music from start + Volume update
    if (audioRefs.current[i]) {
      audioRefs.current[i].currentTime = 0;
      audioRefs.current[i].volume = eqValues.volume; // Control in Volume
      audioRefs.current[i].play();
    }
    setPlayingIndex(i);
  };

  // Update volume when user change the slider 
  useEffect(() => {
    if (playingIndex !== null && audioRefs.current[playingIndex]) {
      audioRefs.current[playingIndex].volume = eqValues.volume;
    }
  }, [eqValues.volume, playingIndex]);
  

  // Keep video and audio in sync on pause/seek
  useEffect(() => {
    if (playingIndex === null) return;
    const vid = videoRef.current;
    const aud = audioRefs.current[playingIndex];
    if (!vid || !aud) return;

    vid.onpause = () => aud.pause();
    vid.onplay = () => aud.play();
    vid.onseeked = () => { aud.currentTime = vid.currentTime; };
    vid.onended = () => {
      aud.pause();
      aud.currentTime = 0;
      setPlayingIndex(null);
    };
    return () => {
      vid.onpause = null;
      vid.onplay = null;
      vid.onseeked = null;
      vid.onended = null;
    };
  }, [playingIndex]);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (video) {
        URL.revokeObjectURL(video);
      }
      const videoURL = URL.createObjectURL(file);
      setVideo(videoURL);
      setVideoFile(file);
      setMusicTracks([]);
      setIsAnalyzed(false);
    }
  };

  const handleReupload = () => {
    if (video) {
      URL.revokeObjectURL(video);
    }
    setVideo(null);
    setMusicTracks([]);
    setIsAnalyzed(false);
    setLoading(false);
    setVideoFile(null);
    fileInputRef.current.click();
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    setLoading(true);
    setIsAnalyzed(false);
    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      setMusicTracks(
        data.top_3_music.map((track, i) => ({
          id: i + 1,
          title: track.title,
          url: track.url, 
        }))
      );
      setIsAnalyzed(true);
    } catch (err) {
      alert("Error uploading video or analyzing music matches!");
    }
    setLoading(false);
  };

  const handleDownload = async (i) => {
    if (!videoFile || i === null) return;
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('music', musicTracks[i].title);

    try {
      const response = await fetch('http://localhost:5001/merge_and_download', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video_with_music.mp4';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Error downloading merged video!");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <h1 className="t-font">DramaTune</h1>
      <input type="file" ref={fileInputRef} accept="video/*" onChange={handleUpload} style={{ display: 'none' }} />

      {!video && (
        <button 
          onClick={() => fileInputRef.current.click()}
          className="w-full px-4 py-2 bg-blue-500 text-black rounded-md hover:bg-blue-600 transition-colors"
        >
          Choose Video
        </button>
      )}

      {video && (
        <div className="video-container mb-4">
          <video 
            ref={videoRef}
            controls 
            className="w-full rounded-lg shadow-md"
          >
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button 
            onClick={handleReupload}
            className="mt-2 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Change Video
          </button>
        </div>
      )}

      {video && !isAnalyzed && (
        <button
          onClick={handleAnalyze}
          className="w-full px-4 py-2 bg-green-500 text-black rounded-md hover:bg-green-600 transition-colors"
        >Analyze Video</button>
      )}

      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full w-1/2"></div>
        </div>
      )}

      {isAnalyzed && musicTracks.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Suggested Tracks</h2>
          <div className="tracks-op flex flex-row gap-2">
            {musicTracks.map((track, i) => (
              <div
                key={track.id}
                className={`track-item rounded-lg shadow-sm transition-all duration-200 
                  ${playingIndex === i ? '' : 'border border-gray-300'}`}
                style={{
                  border: playingIndex === i ? '3px solid #2563eb' : '1px solid #d1d5db',
                  boxShadow: playingIndex === i ? '0 0 0 2px #a5b4fc' : undefined
                }}
              >
                <div className="flex flex-col items-center p-4">
                  <span>{track.title}</span>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md mt-2"
                    onClick={() => handlePlay(i)}
                  >Play</button>
                  <audio loop
                    ref={el => audioRefs.current[i] = el}
                    src={track.url}
                    preload="auto"
                  />
                </div>
              </div>
            ))}
          </div>
          {/* volume label*/}
          {playingIndex !== null && (
            <div className="flex flex-row gap-6 items-center justify-center my-4 p-2 bg-gray-100 rounded-lg">
              <div className="flex flex-col items-center">
                <label htmlFor="volume-slider" className="text-xs">Volume</label>
                <input
                  id="volume-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={eqValues.volume}
                  onChange={e => setEqValues({ ...eqValues, volume: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}
          {/*end volume label */}

          <div className="flex center">
            <button
              className="px-4 py-2 bg-[#C49A6C] text-black rounded-lg shadow hover:bg-[#B88645] transition-colors"
              disabled={playingIndex === null}
              onClick={() => handleDownload(playingIndex)}
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}