# DramaTune 🎵

DramaTune is a web application that helps you find and merge the perfect music track with any dramatic video scene using machine learning.

## Features

- Upload a dramatic video and get the top 3 matching music tracks.
- Preview the video with suggested music tracks.
- Download your video merged with your chosen music.
- Clean and simple React-based UI.

## How It Works

1. **Upload** your video file.
2. **DramaTune** analyzes the video rhythm and suggests 3 music tracks.
3. **Preview** each track with your video, then download your favorite result!

## Tech Stack

- **Frontend:** React (JavaScript)
- **Backend:** Python (Flask)
- **Machine Learning:** Random Forest (scikit-learn)
- **Audio/Video Processing:** moviepy, mediapipe, OpenCV

## Setup Instructions

### Backend

1. Install dependencies (preferably in a conda environment):

    ```
    conda create -n dramatune python=3.11
    conda activate dramatune
    conda install -c conda-forge flask flask-cors moviepy mediapipe opencv joblib scikit-learn pandas
    ```

2. Run the Flask server:

    ```
    python backend.py
    ```

### Frontend


    ```
    npm install
    npm start
    ```

### Configuration

- Place your music files in the correct directory (`music/`).
- Adjust paths in `backend.py` if needed.

## Contributors

- Maayan Boni

## License

[MIT](LICENSE)
