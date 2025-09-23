import pickle
import os

def load_pickle(file_path, default):
    if os.path.exists(file_path):
        with open(file_path, "rb") as f:
            return pickle.load(f)
    return default

def save_pickle(file_path, data):
    with open(file_path, "wb") as f:
        pickle.dump(data, f)
