import React, { useEffect, useRef, useState } from "react";

export default function CameraCapture({ onCapture, onManyCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devices, setDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    setIsMobile(mobile);
  }, []);

  // Listen for messages from child window
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data.type === 'camera-capture') {
        const { images } = event.data;
        const blobs = await Promise.all(images.map(base64 => fetch(base64).then(res => res.blob())));
        if (images.length === 1) {
          onCapture && onCapture(blobs[0]);
        } else {
          onManyCapture && onManyCapture(blobs);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Load available camera devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);
      } catch (err) {
        console.warn("Error enumerating devices:", err);
      }
    };
    loadDevices();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  // Check camera permission
  const checkPermissions = async () => {
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: "camera" });
        setPermissionGranted(result.state === "granted");
        return result.state === "granted";
      } catch {
        console.warn("Permissions API not supported");
      }
    }
    return true;
  };

  // ✅ Start camera with proper facingMode
  const start = async (options = {}) => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      alert("Camera permission is required to use this feature.");
      return;
    }

    try {
      let facingMode = options.facingMode || "user"; // default: front camera
      let constraints = {
        video: { facingMode },
        audio: false,
      };

      if (devices.length > 0 && devices[currentDeviceIndex]) {
        constraints.video = {
          deviceId: { exact: devices[currentDeviceIndex].deviceId },
        };
      }

      console.log("🎥 Starting camera with:", constraints);

      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      setActive(true);
      setPermissionGranted(true);

      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }

      // Refresh device list
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
    } catch (err) {
      console.error("❌ Error accessing camera:", err);
      setPermissionGranted(false);
      alert(
        "Unable to access camera. Please:\n" +
          "1️⃣ Use HTTPS (✅ You already are)\n" +
          "2️⃣ Grant camera permission in browser settings\n" +
          "3️⃣ Ensure no other app is using the camera"
      );
    }
  };

  // Stop camera
  const stop = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setActive(false);
    setCountdown(0);
  };

  // ✅ Switch between front/back cameras
  const toggleCamera = async () => {
    if (!active) return;
    stop();

    const nextIndex = (currentDeviceIndex + 1) % 2; // front/back toggle
    const facingMode = nextIndex === 0 ? "user" : "environment";
    setCurrentDeviceIndex(nextIndex);

    setTimeout(() => start({ facingMode }), 400);
  };

  // Capture one photo
  const snapOne = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(v, 0, 0);
    canvas.toBlob((b) => onCapture && onCapture(b), "image/jpeg", 0.9);
  };

  // 360 capture sequence
  const start360 = async (shots = 8, intervalMs = 700) => {
    let taken = 0;
    setCountdown(shots);
    const promises = [];

    const id = setInterval(() => {
      if (taken >= shots) {
        clearInterval(id);
        setCountdown(0);
        Promise.all(promises).then((blobs) => {
          onManyCapture && onManyCapture(blobs);
        });
        return;
      }

      if (!videoRef.current) return;
      const v = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(v, 0, 0);

      const promise = new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });
      promises.push(promise);
      taken += 1;
      setCountdown(shots - taken);
    }, intervalMs);
  };

  const openCameraInNewTab = () => {
    const url = './camera-test.html';
    window.open(url, '_blank', 'width=800,height=600');
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        padding: 12,
        borderRadius: 8,
      }}
    >
      {isMobile ? (
        <div className="actions" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button onClick={openCameraInNewTab} style={{ flex: "1 1 auto", minWidth: "120px" }}>
            Open Camera in New Tab
          </button>
        </div>
      ) : (
        <>
          <div
            className="actions"
            style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
          >
            {!active ? (
              <button
                onClick={() => start({ facingMode: "user" })}
                style={{ flex: "1 1 auto", minWidth: "120px" }}
              >
                Open Camera
              </button>
            ) : (
              <button
                onClick={stop}
                style={{ flex: "1 1 auto", minWidth: "120px" }}
              >
                Close Camera
              </button>
            )}

            <button
              onClick={toggleCamera}
              disabled={!active}
              style={{ flex: "1 1 auto", minWidth: "120px" }}
            >
              Switch Camera
            </button>

            <button
              onClick={snapOne}
              disabled={!active}
              style={{ flex: "1 1 auto", minWidth: "120px" }}
            >
              Capture
            </button>

            <button
              onClick={() => start360(10, 600)}
              disabled={!active}
              style={{ flex: "1 1 auto", minWidth: "120px" }}
            >
              360 Capture (10)
            </button>

            {countdown > 0 && <span className="badge">{countdown} left</span>}
          </div>

          <div style={{ marginTop: 10 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                maxHeight: "300px",
                borderRadius: 8,
                background: "#000",
              }}
            />
          </div>

          {permissionGranted === false && (
            <p style={{ color: "red", textAlign: "center", marginTop: 8 }}>
              Camera access denied. Please enable it in your browser settings.
            </p>
          )}

          <p className="note" style={{ marginTop: 6, fontSize: 13 }}>
            Tip: For 360 capture, slowly turn your phone left/right and tilt a bit
            for better angles.
          </p>
        </>
      )}
    </div>
  );
}
