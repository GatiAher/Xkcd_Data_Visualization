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

myvalue = 5

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


@app.route('/picked-data', methods=['POST'])
def picked_word_data():
    # myvalue = request.sn
    if request.method == 'POST':
        picked_idx = request.json['index_num']
        barchart_data = get_barchart_data(picked_idx)
        return barchart_data

def get_barchart_data(comic_idx):
    # get row
    word_data = tfidf_vectors[comic_idx, :]
    # transform 'numpy.matrix' to 'numpy.ndarray'
    word_data = np.array(word_data.todense()).ravel()
    top_5_word_idxs = np.argpartition(word_data, -5)[-5:]
    top_5_word_idxs = top_5_word_idxs[np.argsort(word_data[top_5_word_idxs])]

    top_5_word_vals = word_data[top_5_word_idxs]
    top_5_words = [tfidf_feature_names[i] for i in top_5_word_idxs]
    # labels = ["word", "tfidf"]
    labels = ["name", "value"]
    tfidf_zipped = zip(top_5_words, top_5_word_vals)
    tfidf_dict = [dict(zip(labels, row)) for row in tfidf_zipped]

    barchart_data = json.dumps([tfidf_dict])
    return barchart_data

########
# MAIN #
########

if __name__ == "__main__":
    print("comic_data_df: ", comic_data_df.shape)
    print("tfidf_vectors: ", tfidf_vectors.shape)
    print("tfidf_feature_names: ", len(tfidf_feature_names))

    app.run(debug=True)

    # Make Heroku Use 0.0.0.0, and read the port number from an environment variable
    # HOST = '0.0.0.0' if 'PORT' in os.environ else '127.0.0.1'
    # PORT = int(os.environ.get('PORT', 5000))
    # app.run(host=HOST, port=PORT)
