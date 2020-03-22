"""


reads from: "text_vectors/tfidf_vectors.npy"
saves to: "document_relations/tsne.npy"

@author: Gati Aher
"""

import numpy as np
from scipy import sparse

from sklearn.manifold import MDS

if __name__ == "__main__":

    tfidf_vectors = sparse.load_npz("text_vectors/tfidf_vectors.npz")
    print(tfidf_vectors.shape)
    # # dissimilarity is 1 minus similarity
    # dissimilarities = 1 - cosine_array
    # # compute the embedding
    # coord = MDS(dissimilarity='precomputed').fit_transform(dissimilarities)
    # # save coord
    # np.save("cosine_data/mds_coords", coord)
    # print("MDS SHAPE: ", coord.shape)
