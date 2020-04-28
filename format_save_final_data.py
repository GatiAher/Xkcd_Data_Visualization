"""
saves data to to csv

reads from:
- "data/comic_tags/titles.npy"
- "data/comic_tags/image_urls.npy"
- "data/document_relations/tsne.npy"

saves to:
- "web_app/final_data/data.csv"

@author: Gati Aher
"""


import numpy as np
import pandas as pd

if __name__ == "__main__":

    #############
    # save data #
    #############

    root_dir = "./"
    titles = np.load(root_dir + "data/comic_tags/titles.npy")
    image_urls = np.load(root_dir + "data/comic_tags/image_urls.npy")
    tsne = np.load(root_dir + "data/document_relations/tsne.npy")
    tsne_conv = tsne.astype(float)

    comic_serial_nums = [ str(i) for i in range(1, titles.shape[0] + 1) ]
    comic_serial_nums = np.asarray(comic_serial_nums)
    comic_serial_nums = np.transpose(comic_serial_nums)

    dict = {"sn": comic_serial_nums, "title": titles, "imageUrl": image_urls, "x": tsne_conv[:, 0], "y":tsne_conv[:, 1]}

    df = pd.DataFrame(dict)

    df.to_csv("web_app/final_data/data.csv")
