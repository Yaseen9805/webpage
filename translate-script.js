document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('camera-feed');
    const translatedText = document.getElementById('translated-text');

    // Access the user's camera
    async function setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
        } catch (error) {
            console.error('Error accessing the camera:', error);
            translatedText.textContent = 'Error: Unable to access the camera. Please make sure you have granted camera permissions.';
        }
    }

    setupCamera();

    // Placeholder for sign language translation (replace with actual implementation)
    function translateSignLanguage() {
        // Simulating translation with random words
        const words = ['Hello', 'World', 'How', 'Are', 'You', 'Today', 'Sign', 'Language', 'Translator'];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        
        translatedText.textContent += randomWord + ' ';
    }

    // Simulate translation every 2 seconds
    setInterval(translateSignLanguage, 2000);
});

