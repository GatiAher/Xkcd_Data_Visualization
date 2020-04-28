"""
saves data to to csv

reads from:
- "data/comic_tags/titles.npy"
- "data/comic_tags/image_urls.npy"
- "data/document_relations/tsne.npy"

- "data/text_vectors/tfidf_vectors.npz"
- "data/text_vectors/feature_names.npy"

saves to:
- "web_app/final_data/comic_data.csv"

- "web_app/final_data/tfidf_vectors.npz"
- "web_app/final_data/feature_names.npy"

@author: Gati Aher
"""
from scipy import sparse
import numpy as np

import pandas as pd

def save_comic_data():
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

def save_word_data():
    # tfidf_vectors type is: <class 'scipy.sparse.csr.csr_matrix'> -- good for row splicing
    tfidf_vectors = sparse.load_npz("data/text_vectors/tfidf_vectors.npz")
    sparse.save_npz("web_app/final_data/tfidf_vectors.npz", tfidf_vectors)

    feature_names = np.load("data/text_vectors/tfidf_feature_names.npy")
    np.save("web_app/final_data/tfidf_feature_names.npy", feature_names)

if __name__ == "__main__":

    save_comic_data()
    save_word_data()
