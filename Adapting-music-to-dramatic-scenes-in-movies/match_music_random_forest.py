import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

# ----------------------------
# Step 1: Load and prepare data
# ----------------------------

# Load rhythm values for videos and music
video_data = pd.read_csv('normalized_video_rhythm.csv')
music_data = pd.read_csv('normalized_music_tempo_loudness.csv')


pairs = []
targets = []

# Create training data from all (video, music) pairs
for _, video in video_data.iterrows():
    for _, music in music_data.iterrows():
        video_rhythm = video['normalized_rhythm']
        music_tempo = music['normalized_tempo']
        music_loudness = music['normalized_loudness']
        features = [video_rhythm, music_tempo, music_loudness]

        # Keep the match score without loudness
        # The features include loudness so the model can discover patterns
        match_score = 1 - abs(video_rhythm - music_tempo) + np.random.normal(0, 0.1)    #noise new


        pairs.append(features)
        targets.append(match_score)

# ----------------------------
# Step 2: Train the model
# ----------------------------

X = np.array(pairs)
y = np.array(targets)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

print("Model trained successfully!")

#accuracy
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\nModel Evaluation:")
print(f"Mean Absolute Error (MAE): {mae:.3f}")
print(f"Mean Squared Error (MSE): {mse:.3f}")
print(f"R² Score: {r2:.3f}")

#results:
#Model Evaluation:
#Mean Absolute Error (MAE): 0.092
#Mean Squared Error (MSE): 0.013
#R² Score: 0.568


#end accuracy

# ----------------------------
# Step 3: Predict top 3 matches for each video
# ----------------------------

top_3_matches = {}

for _, video in video_data.iterrows():
    video_rhythm = video['normalized_rhythm']
    video_id = video['video']

    # Create prediction inputs
    input_pairs = [
        [video_rhythm, row['normalized_tempo'], row['normalized_loudness']]
        for _, row in music_data.iterrows()
    ]

    predictions = model.predict(input_pairs)

    # Get top 3 music tracks
    top3_indices = np.argsort(predictions)[-3:][::-1]
    top3_music_ids = music_data.iloc[top3_indices]['music'].tolist()

    top_3_matches[video_id] = top3_music_ids

# Print results
print("\n🎵 Top 3 Music Matches for Each Video:")
for video_id, music_ids in top_3_matches.items():
    print(f"Video {video_id}: {music_ids}")

# Save to CSV
output_df = pd.DataFrame([
    {'video_id': vid, 'top_1': musics[0], 'top_2': musics[1], 'top_3': musics[2]}
    for vid, musics in top_3_matches.items()
])
output_df.to_csv('top_3_matches.csv', index=False)
print("\nResults saved to top_3_matches.csv")

#save the model for UI
joblib.dump(model, 'random_forest_model.pkl')