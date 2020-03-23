"""
Metric Multi-dimensional Scaling (MDS)
to visualize the texts in a two dimensional space.
MDS is computed on the pairwise cosine similarities
it produces a set of (x, y) coordinates for each text
based on its similarities to other texts
MDS is a computationaly heavy step that takes a long time to run,
so the results are saved before plotting

reads from: "text_vectors/tfidf_vectors.npz"
saves to: "document_relations/mds.npy"

@author: Gati Aher
"""

import numpy as np
from scipy import sparse

from sklearn.metrics.pairwise import cosine_similarity
from sklearn.manifold import MDS

if __name__ == "__main__":

    tfidf_vectors = sparse.load_npz("text_vectors/tfidf_vectors.npz")

    cosine_array = cosine_similarity(tfidf_vectors, tfidf_vectors)
    dissimilarities = 1 - cosine_array

    # compute the embedding
    embedded = MDS(dissimilarity='precomputed').fit_transform(dissimilarities)

    # save coord
    np.save("document_relations/mds.npy", embedded)
    print("MDS SHAPE: ", embedded.shape)
