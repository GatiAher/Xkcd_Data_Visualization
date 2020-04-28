
##########
# IMPORT #
##########

# for Heroku
import os

from flask import Flask, render_template, request
import numpy as np

import pandas as pd
import json

########
# DATA #
########

root_dir = "./"
titles = np.load(root_dir + "../data/comic_tags/titles.npy")
image_urls = np.load(root_dir + "../data/comic_tags/image_urls.npy")
tsne = np.load(root_dir + "../data/document_relations/tsne.npy")
tsne_conv = tsne.astype(float)

comic_serial_nums = [ str(i) for i in range(1, titles.shape[0] + 1) ]
comic_serial_nums = np.asarray(comic_serial_nums)
comic_serial_nums = np.transpose(comic_serial_nums)

df = pd.DataFrame(data = [titles, image_urls, tsne_conv[:, 0], tsne_conv[:, 1], comic_serial_nums],
                index=["title", "imageUrl", "x", "y", "sn"]
                ).T # transpose to make rows comics and columns categories'

#######
# APP #
#######

app= Flask(__name__)

@app.route('/')
def homepage():
    chart_data = df.to_dict(orient='records')
    chart_data = json.dumps(chart_data, indent=2)
    return_chart_data = {'chart_data': chart_data}
    return render_template('index.html',
            return_chart_data=return_chart_data,
            max_serial_num=titles.shape[0])

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
