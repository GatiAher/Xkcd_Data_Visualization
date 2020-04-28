##########
# IMPORT #
##########

# for Heroku
import os

from flask import Flask, render_template, request, jsonify
import numpy as np

import pandas as pd
import json

########
# DATA #
########

comic_data_df = pd.read_csv("final_data/data.csv")

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

@app.route('/picked-word-data')
def picked_word_data():
    


########
# MAIN #
########

if __name__ == "__main__":
    # print("comic_serial_nums: ", comic_serial_nums.shape)
    # print("titles: ", titles.shape)
    # print("image_urls: ", image_urls.shape)
    # print("tsne: ", tsne.shape)
    # print(df)
    # print(df.shape)

    app.run(debug=True)

    # Make Heroku Use 0.0.0.0, and read the port number from an environment variable
    # HOST = '0.0.0.0' if 'PORT' in os.environ else '127.0.0.1'
    # PORT = int(os.environ.get('PORT', 5000))
    # app.run(host=HOST, port=PORT)
