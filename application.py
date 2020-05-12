##########
# IMPORT #
##########

# for Heroku
import os

from flask import Flask, render_template, request, jsonify
import numpy as np

from scipy import sparse
import json

import pandas as pd

########
# DATA #
########

comic_data_df = pd.read_csv("final_data/comic_data.csv")

tfidf_vectors = sparse.load_npz("final_data/tfidf_vectors.npz")
with open("final_data/tfidf_feature_names.txt", 'r') as filehandle:
    tfidf_feature_names = json.load(filehandle)

class DataStore():
    picked_idx=[]
    selected_idx=[]
dataStore=DataStore()

#######
# APP #
#######

app = Flask(__name__)

@app.route('/')
@app.route('/index')
@app.route('/home')
def homepage():
    comic_data = comic_data_df.to_dict(orient='records')
    comic_data = json.dumps(comic_data, indent=2)
    return_comic_data = {'comic_data': comic_data}
    return render_template('index.html',
            return_comic_data=return_comic_data,
            max_serial_num=comic_data_df.shape[0])


@app.route('/data', methods=['POST'])
def word_data():
    if request.method == 'POST':

        picked_idx = [request.json['picked_sn'] - 1]
        dataStore.picked_idx = picked_idx

        selected_idx = request.json['selected_sn']
        selected_idx = [num - 1 for num in selected_idx]
        dataStore.selected_idx = selected_idx

        barchart_data = get_barchart_data(dataStore.picked_idx, dataStore.selected_idx)
        return barchart_data

###########
# TESTING #
###########

def get_barchart_data(picked_idx, selected_idx, sortedBy="selected"):
    """
    Get top words and vales based off of a_idx
    Then for those words get values for b_idx

    word_data type: 'scipy.sparse.csr.csr_matrix'
    sum word data so total tfidf value for word
    word_data type: 'numpy.matrix'
    transform 'numpy.matrix' to 'numpy.ndarray'
    """
    len_output = 30
    output_zeros = np.zeros(len_output)

    if len(picked_idx) == 0:
        word_data_picked = output_zeros
    else:
        word_data_picked = tfidf_vectors[picked_idx, :]
        word_data_picked = word_data_picked.sum(axis=0)
        word_data_picked = np.squeeze(np.asarray(word_data_picked))

    if len(selected_idx) == 0:
        word_data_selected = output_zeros
    else:
        word_data_selected = tfidf_vectors[selected_idx, :]
        word_data_selected = word_data_selected.sum(axis=0)
        word_data_selected = np.squeeze(np.asarray(word_data_selected))

    if sortedBy == "selected":
        word_data_a = word_data_selected
        word_data_b = word_data_picked
    else:
        word_data_a = word_data_picked
        word_data_b = word_data_selected

    top_5_word_idxs_a = np.argpartition(word_data_a, -len_output)[-len_output:]
    top_5_word_idxs_a = top_5_word_idxs_a[np.argsort(word_data_a[top_5_word_idxs_a])]

    top_5_word_vals_a = word_data_a[top_5_word_idxs_a]
    top_5_word_vals_b = word_data_b[top_5_word_idxs_a]
    top_5_words_a = [tfidf_feature_names[i] for i in top_5_word_idxs_a]

    if sortedBy == "selected":
        top_5_word_vals_selected = top_5_word_vals_a
        top_5_word_vals_picked = top_5_word_vals_b
    else:
        top_5_word_vals_picked = top_5_word_vals_a
        top_5_word_vals_selected = top_5_word_vals_b

    # labels = ["word", "tfidf"]
    labels = ["name", "value"]
    top_5_word_vals = zip(top_5_word_vals_picked, top_5_word_vals_selected)
    tfidf_zipped = zip(top_5_words_a, top_5_word_vals)
    tfidf_dict = [dict(zip(labels, row)) for row in tfidf_zipped]

    barchart_data = json.dumps([tfidf_dict])
    return barchart_data


########
# MAIN #
########

if __name__ == "__main__":
    # print("comic_data_df: ", comic_data_df.shape)
    # print("tfidf_vectors: ", tfidf_vectors.shape)
    # print("tfidf_feature_names: ", len(tfidf_feature_names))

    app.run(debug=True)

    # # Make Heroku Use 0.0.0.0, and read the port number from an environment variable
    # HOST = '0.0.0.0' if 'PORT' in os.environ else '127.0.0.1'
    # PORT = int(os.environ.get('PORT', 5000))
    # app.run(host=HOST, port=PORT)
