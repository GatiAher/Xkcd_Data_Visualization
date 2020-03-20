"""
Metric Multi-dimensional Scaling (MDS)
to visualize the texts in a two dimensional space.
MDS is computed on the pairwise cosine similarities
it produces a set of (x, y) coordinates for each text
based on its similarities to other texts
MDS is a computationaly heavy step that takes a long time to run,
so the results are saved before plotting
reads from: "cosine_data/cosine_array.npy"
saves to: "cosine_data/mds_coords"
@author: Gati Aher
"""

import numpy as np
from sklearn.manifold import MDS

if __name__ == "__main__":
    cosine_array =  np.load("cosine_data/cosine_array.npy")
    # dissimilarity is 1 minus similarity
    dissimilarities = 1 - cosine_array
    # compute the embedding
    coord = MDS(dissimilarity='precomputed').fit_transform(dissimilarities)
    # save coord
    np.save("cosine_data/mds_coords", coord)
    print("MDS SHAPE: ", coord.shape)
