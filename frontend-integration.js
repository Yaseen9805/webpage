// translate-script.js
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('camera-feed');
    const translatedText = document.getElementById('translated-text');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    let socket;

    // Connect to Flask backend via WebSocket
    function connectWebSocket() {
        socket = io('http://localhost:5000');
        
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('translation', (data) => {
            if (data.text) {
                translatedText.textContent += data.text + ' ';
                translatedText.scrollTop = translatedText.scrollHeight;
            }
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            setTimeout(connectWebSocket, 3000);
        });
    }

    // Access the user's camera
    async function setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640,
                    height: 480,
                    frameRate: { ideal: 10 }
                } 
            });
            video.srcObject = stream;
            video.play();
            
            // Set up canvas
            canvas.width = 640;
            canvas.height = 480;
            
            // Start sending frames
            sendFrames();
        } catch (error) {
            console.error('Error accessing the camera:', error);
            translatedText.textContent = 'Error: Unable to access the camera. Please make sure you have granted camera permissions.';
        }
    }

    function sendFrames() {
        if (socket && socket.connected) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameData = canvas.toDataURL('image/jpeg', 0.5);
            socket.emit('frame', frameData);
        }
        setTimeout(sendFrames, 100); // Send 10 frames per second
    }

    // Initialize
    connectWebSocket();
    setupCamera();
});
