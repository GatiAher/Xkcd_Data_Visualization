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

word_data_all_summed = tfidf_vectors.sum(axis=0)
word_data_all_summed = np.squeeze(np.asarray(word_data_all_summed))

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


@app.route('/barchart-data', methods=['POST'])
def word_data():
    if request.method == 'POST':

        picked_idx = [request.json['picked_sn'] - 1]

        selected_idx = request.json['selected_sn']
        selected_idx = [num - 1 for num in selected_idx]

        barchart_data = get_barchart_data(picked_idx, selected_idx)
        return barchart_data

###########
# TESTING #
###########

def get_barchart_data(picked_idx, selected_idx):
    """
    Get top words and vales based off of a_idx
    Then for those words get values for b_idx

    word_data type: 'scipy.sparse.csr.csr_matrix'
    sum word data so total tfidf value for word
    word_data type: 'numpy.matrix'
    transform 'numpy.matrix' to 'numpy.ndarray'
    """
    len_output = 30

    word_data_picked = get_summed_tfidf(picked_idx, len_output)
    word_data_selected = get_summed_tfidf(selected_idx, len_output)
    word_data_all = get_summed_tfidf([-1], len_output)

    top_word_idxs_selected = np.argpartition(word_data_selected, -len_output)[-len_output:]
    top_word_idxs_selected = top_word_idxs_selected[np.argsort(word_data_selected[top_word_idxs_selected])]

    top_word_vals_selected = word_data_selected[top_word_idxs_selected]
    top_word_vals_picked = word_data_picked[top_word_idxs_selected]
    top_word_vals_all = word_data_all[top_word_idxs_selected]
    top_words_selected = [tfidf_feature_names[i] for i in top_word_idxs_selected]

    # labels = ["word", "tfidf"]
    labels = ["name", "value"]
    top_word_vals = zip(top_word_vals_picked, top_word_vals_selected, top_word_vals_all)
    tfidf_zipped = zip(top_words_selected, top_word_vals)
    tfidf_dict = [dict(zip(labels, row)) for row in tfidf_zipped]

    barchart_data = json.dumps([tfidf_dict])
    return barchart_data


####################
# HELPER FUNCTIONS #
####################

def get_summed_tfidf(idx_list, len_output):
    if len(idx_list) == 0:
        return np.zeros(len_output)
    elif idx_list[0] == -1:
        return word_data_all_summed
    else:
        word_data = tfidf_vectors[idx_list, :]
        word_data = word_data.sum(axis=0)
        word_data = np.squeeze(np.asarray(word_data))
        return word_data

########
# MAIN #
########

if __name__ == "__main__":
    # print("comic_data_df: ", comic_data_df.shape)
    # print("tfidf_vectors: ", tfidf_vectors.shape)
    # print("tfidf_feature_names: ", len(tfidf_feature_names))

    # app.run(debug=True)

    # Make Heroku Use 0.0.0.0, and read the port number from an environment variable
    HOST = '0.0.0.0' if 'PORT' in os.environ else '127.0.0.1'
    PORT = int(os.environ.get('PORT', 5000))
    app.run(host=HOST, port=PORT)
