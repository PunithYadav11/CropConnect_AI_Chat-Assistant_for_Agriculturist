import pandas as pd
import numpy as np
import joblib
import cgitb
cgitb.enable()
import sys

header = ['State_Name', 'District_Name', 'Season', 'Crop'] 

class Question:
    def __init__(self, column, value):
        self.column = column
        self.value = value

    def match(self, example):
        val = example[self.column]
        return val == self.value

    def __repr__(self):
        return "Is %s %s %s?" % (header[self.column], "==", str(self.value))

def class_counts(data):
    return Counter(row[-1] for row in data)

class Leaf:
    def __init__(self, data):
        self.predictions = class_counts(data)

class Decision_Node:
    def __init__(self, question, true_branch, false_branch):
        self.question = question
        self.true_branch = true_branch
        self.false_branch = false_branch

def print_tree(node, spacing=""):
    if isinstance(node, Leaf):
        print(spacing + "Predict", node.predictions)
        return
    print(spacing + str(node.question))
    print(spacing + "--> True:")
    print_tree(node.true_branch, spacing + " ")

    print(spacing + "--> False:")
    print_tree(node.false_branch, spacing + " ")

def print_leaf(counts):
    total = sum(counts.values()) * 1.0
    return {lbl: str(int(count / total * 100)) + "%" for lbl, count in counts.items()}

def classify(row, node):
    if isinstance(node, Leaf):
        return node.predictions
    if node.question.match(row):
        return classify(row, node.true_branch)
    else:
        return classify(row, node.false_branch)

# Load model once to avoid reloading every time
dt_model_final = joblib.load('crop_prediction/filetest2.pkl')

def main():
    state = sys.argv[1].capitalize()
    district = sys.argv[2].upper()
    season = sys.argv[3].capitalize()

    testing_data = [[state, district, season]]

    for row in testing_data:
        predict_dict = print_leaf(classify(row, dt_model_final))

    for key in predict_dict:
        print(key, ",")

if __name__ == "__main__":
    main()
