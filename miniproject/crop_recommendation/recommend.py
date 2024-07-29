import sys
import pickle
import numpy as np

# Load the trained model
with open('crop_recommendation/classifier.pkl', 'rb') as f:
    classifier = pickle.load(f)

# Get the input parameters as command line arguments
n_params = float(sys.argv[1])
p_params = float(sys.argv[2])
k_params = float(sys.argv[3])
t_params = float(sys.argv[4])
h_params = float(sys.argv[5])
ph_params = float(sys.argv[6])
r_params = float(sys.argv[7])

# Get the user inputs and store them in a numpy array
user_input = np.array([[n_params, p_params, k_params, t_params, h_params, ph_params, r_params]])

# Make predictions using the trained model
predictions = classifier.predict(user_input)

# Print the predicted crop
print(str(predictions[0]))
