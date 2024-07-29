import pandas as pd
import numpy as np
import sys
import pickle
from sklearn.ensemble import RandomForestClassifier

# Read the dataset
dataset = pd.read_csv('Crop_recommendation.csv')

# Divide the dataset into features and labels
X = dataset.iloc[:, :-1].values
y = dataset.iloc[:, -1].values

# Train the model using the Random Forest Classifier algorithm
classifier = RandomForestClassifier(n_estimators=10, criterion='entropy', random_state=0)
classifier.fit(X, y)

# Save the trained model
with open('classifier.pkl', 'wb') as f:
    pickle.dump(classifier, f)
