import joblib
import pandas as pd
import numpy as np
from analyze_rhythm import estimate_rhythm

# Load model and new music data (with loudness)
model = joblib.load('random_forest_model.pkl')
music_data = pd.read_csv('normalized_music_tempo_loudness.csv')  # <- NEW CSV

def get_top3_music_for_video(video_path, estimate_rhythm):
    """
    video_path: path to uploaded video file
    estimate_rhythm: your function for getting rhythm from video
    Returns: List of top 3 music filenames
    """
    rhythm_score = estimate_rhythm(video_path)  # e.g., 223 (raw)

    # Use the same normalization you used during training!
    # Get min/max from your training set:
    video_data = pd.read_csv('video_rhythm_results.csv')
    min_rhythm =  video_data['rhythm_score'].min()  # or use the actual min
    max_rhythm =  video_data['rhythm_score'].max()  # or use the actual max

    normalized_rhythm = (rhythm_score - min_rhythm) / (max_rhythm - min_rhythm)

    normalized_rhythm = max(0, min(1, normalized_rhythm))

    # Prepare feature vectors for all tracks
    input_features = [
        [normalized_rhythm, row['normalized_tempo'], row['normalized_loudness']]
        for _, row in music_data.iterrows()
    ]

    predictions = model.predict(input_features)
    top3_indices = np.argsort(predictions)[-3:][::-1]
    top3_music_files = music_data.iloc[top3_indices]['music'].tolist()

    print("Video:", video_path, "Rhythm Normal Score:", normalized_rhythm)
    print("First 5 music tempos:", music_data['normalized_tempo'].head())
    print("First 5 music loudness:", music_data['normalized_loudness'].head())
    print("First 5 prediction inputs:", input_features[:5])
    print("First 5 predictions:", predictions[:5])
    print("Top 3 music indices:", top3_indices)
    print("Top 3 music files:", top3_music_files)
    return top3_music_files

