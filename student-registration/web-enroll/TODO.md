# Update Student Registration for 25 Images with 360 Embeddings

## Tasks
- [x] Change upload limit from 12 to 25 in server.js
- [x] Modify CameraCapture.jsx to pass captured blobs to onManyCapture
- [x] Modify EnrollForm.jsx to track 360 images and send flags to backend
- [x] Modify students.js to handle 360 images by storing 120-D embeddings in GridFS
- [x] Test the implementation

## Progress
- [x] Plan approved by user

# Fix CORS and Face Recognition Model Issues

## Tasks
- [x] Update CORS configuration in server/src/app.js to allow 'https://student-registration-sepia.vercel.app' by default
- [x] Download missing face_recognition_model-shard2 to web-enroll/public/models/
- [x] Add GET /classes route to students.js to handle /api/students/classes requests
- [ ] Redeploy the backend on Render with the updated CORS and new route
- [ ] Redeploy the frontend on Vercel with the new model file

## Progress
- [x] CORS code updated
- [x] Model shard downloaded
- [ ] Awaiting redeployment

# Make EnrollForm Mobile Responsive

## Tasks
- [x] Add responsive CSS media queries to styles.css for mobile (max-width: 768px)
- [x] Reduce container padding and margin on mobile
- [x] Adjust font sizes for headings, inputs, buttons on mobile
- [x] Change .row to flex-direction: column on mobile to prevent overlap
- [x] Adjust .grid columns and thumb sizes for mobile
- [x] Adjust camera video and buttons for mobile
- [x] Hide or adjust background circles on mobile
- [x] Test the mobile responsiveness

## Progress
- [x] Plan approved by user
