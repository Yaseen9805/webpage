# app.py
import base64
import io
import os
import pickle

import cv
import mediapipe as mp
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from PIL import Image

app = Flask(__name__)
CORS(app, origins=["*"])
socketio = SocketIO(app, cors_allowed_origins="*")

# Load the trained model
cwd = os.getcwd()
MODEL_PATH = os.path.join(cwd, "model.p")
print(MODEL_PATH)
try:
    with open(MODEL_PATH, "rb") as f:
        model_dict = pickle.loads(f.read())
        model = model_dict["model"]
except:
    print(f"Error: Could not load model from {MODEL_PATH}")
    model = None

# Initialize MediaPipe
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3)

# Label dictionary
labels_dict = {
    0: "hello",
    1: "eat",
    2: "yes",
    3: "thank you",
    4: "i love you",
    5: "friends",
}


def process_frame(frame):
    data_aux = []
    x_ = []
    y_ = []

    H, W, _ = frame.shape
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style(),
            )

            for i in range(len(hand_landmarks.landmark)):
                x = hand_landmarks.landmark[i].x
                y = hand_landmarks.landmark[i].y
                x_.append(x)
                y_.append(y)

            for i in range(len(hand_landmarks.landmark)):
                x = hand_landmarks.landmark[i].x
                y = hand_landmarks.landmark[i].y
                data_aux.append(x - min(x_))
                data_aux.append(y - min(y_))

            # Add distance features as in original project
            distances = []
            for i in range(1, len(hand_landmarks.landmark)):
                for j in range(i):
                    x1, y1 = x_[j], y_[j]
                    x2, y2 = x_[i], y_[i]
                    distance = np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
                    distances.append(distance)

            if len(distances) > 42:
                distances = distances[:42]

            data_aux.extend(distances)

            if len(data_aux) == 84 and model:  # Ensure correct feature length
                prediction = model.predict([np.asarray(data_aux)])
                predicted_character = labels_dict.get(int(prediction[0]), "Unknown")
                return predicted_character, frame

    return None, frame


@socketio.on("frame")
def handle_frame(frame_data):
    try:
        # Convert base64 to image
        img_data = base64.b64decode(frame_data.split(",")[1])
        img = Image.open(io.BytesIO(img_data))
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

        # Process frame
        result, processed_frame = process_frame(frame)

        # Convert processed frame back to base64
        _, buffer = cv2.imencode(".jpg", processed_frame)
        processed_frame_b64 = base64.b64encode(buffer).decode("utf-8")

        if result:
            emit(
                "translation",
                {
                    "text": result,
                    "frame": f"data:image/jpeg;base64,{processed_frame_b64}",
                },
            )
    except Exception as e:
        print(f"Error processing frame: {str(e)}")


if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)
