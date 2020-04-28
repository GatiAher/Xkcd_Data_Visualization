
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

data = pd.read_csv("final_data/data.csv")

#######
# APP #
#######

app = Flask(__name__)

@app.route('/')
def homepage():
    chart_data = data.to_dict(orient='records')
    chart_data = json.dumps(chart_data, indent=2)
    return_chart_data = {'chart_data': chart_data}
    return render_template('index.html',
            return_chart_data=return_chart_data,
            max_serial_num=data.shape[0])

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
