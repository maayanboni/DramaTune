import librosa
import os
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# -----Extract loudness from tracks
music_folder = 'music'
music_files = [f for f in os.listdir(music_folder) if f.endswith('.mp3')]

loudness_values = []

for fname in music_files:
    path = os.path.join(music_folder, fname)
    try:
        y, sr = librosa.load(path)
        rms = librosa.feature.rms(y=y).mean()  # Root-mean-square energy (a proxy for loudness)
        loudness_values.append({'music': fname, 'loudness': rms})
    except Exception as e:
        print(f"Error processing {fname}: {e}")

df = pd.DataFrame(loudness_values)
df.to_csv('music_loudness.csv', index=False)
print("Loudness values extracted and saved to music_loudness.csv")

# -----Merge files (tempo and loudness)
tempo_df = pd.read_csv('music_tempo_scores.csv')
loudness_df = pd.read_csv('music_loudness.csv')

merged = pd.merge(tempo_df, loudness_df, on='music')
merged.to_csv('music_tempo_loudness.csv', index=False)
print("Merged CSV with tempo and loudness saved as music_tempo_loudness.csv")

# -----Normalize the loudness column
music_df = pd.read_csv('music_tempo_loudness.csv')

music_df['tempo'] = music_df['tempo'].apply(lambda x: float(x.strip('[]')))
music_scaler = MinMaxScaler()
music_df['normalized_tempo'] = music_scaler.fit_transform(music_df[['tempo']])

# Normalize loudness
loudness_scaler = MinMaxScaler()
music_df['normalized_loudness'] = loudness_scaler.fit_transform(music_df[['loudness']])

music_df.to_csv('normalized_music_tempo_loudness.csv', index=False)
print("Normalized music data (tempo + loudness) saved to normalized_music_tempo_loudness.csv")

