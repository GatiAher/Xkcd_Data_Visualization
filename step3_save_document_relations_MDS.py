"""
Metric Multi-dimensional Scaling (MDS)
to visualize the texts in a two dimensional space.
MDS is computed on the pairwise cosine similarities
it produces a set of (x, y) coordinates for each text
based on its similarities to other texts
MDS is a computationaly heavy step that takes a long time to run,
so the results are saved before plotting

reads from: "text_vectors/tfidf_vectors.npz"
saves to:
- "document_relations/mds.npy"
- "document_relations/mds_df.pkl"

@author: Gati Aher
"""

import numpy as np
from scipy import sparse
import pandas as pd

from sklearn.metrics.pairwise import cosine_similarity
from sklearn.manifold import MDS

# get num comics
from my_utils import get_latest_comic_num

if __name__ == "__main__":

    tfidf_vectors = sparse.load_npz("text_vectors/tfidf_vectors.npz")

    cosine_array = cosine_similarity(tfidf_vectors, tfidf_vectors)
    dissimilarities = 1 - cosine_array

    # compute the embedding
    embedded = MDS(dissimilarity='precomputed').fit_transform(dissimilarities)

    # save coord
    np.save("document_relations/mds.npy", embedded)
    print("MDS SHAPE: ", embedded.shape)

    # save coords as dataframe
    num_comics = get_latest_comic_num() + 1
    comic_serial_numbers = [ str(i) for i in range(1, num_comics) ]
    df = pd.DataFrame(embedded, columns=['x', 'y'], index=comic_serial_numbers)
    pd.to_pickle(df, "document_relations/mds_df.pkl")
