
##########
# IMPORT #
##########

from flask import Flask, render_template, request
import numpy as np

import pandas as pd
import json

########
# DATA #
########

root_dir = "../"
titles = np.load(root_dir + "comic_tags/titles.npy")
image_urls = np.load(root_dir + "comic_tags/image_urls.npy")
tsne = np.load(root_dir + "document_relations/tsne.npy")
tsne_conv = tsne.astype(float)
comic_serial_nums = [ str(i) for i in range(1, titles.shape[0] + 1) ]

df = pd.DataFrame(data = [titles, image_urls, tsne_conv[:, 0], tsne_conv[:, 1]],
                index=["titles", "image_urls", "x", "y"],
                columns=comic_serial_nums
                ).T # transpose to make rows comics and columns categories'

# class DataStore():
#     comic_serial_nums = None
#     titles=None
#     image_urls=None
#     tsne_x= None
#     tsne_y= None
# data_store=DataStore()

#######
# APP #
#######

app= Flask(__name__)

@app.route('/')
def homepage():
    chart_data = df.to_dict(orient='records')
    chart_data = json.dumps(chart_data, indent=2)
    return_chart_data = {'chart_data': chart_data}
    return render_template('index.html', return_chart_data=return_chart_data)

########
# MAIN #
########

if __name__ == "__main__":
    # print("comic_serial_nums: ", len(comic_serial_nums))
    # print("titles: ", titles.shape)
    # print("image_urls: ", image_urls.shape)
    # print("tsne: ", tsne.shape)
    # print(df)
    # print(df.shape)

    app.run(debug=True)
