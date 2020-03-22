"""
use truncated singular value decomposition (SVD) to reduce data
from 7501 dimensions to 50 dimensions

use explained_variance_ratio_ to know how much variance the 50 components contain

Info About Choice of Truncated SVD:
When truncated SVD is applied to term-document matrices (as returned by CountVectorizer
or TfidfVectorizer), this transformation is known as latent semantic analysis (LSA),
because it transforms such matrices to a “semantic” space of low dimensionality.
In particular, LSA is known to combat the effects of synonymy and polysemy.

While the TruncatedSVD transformer works with any (sparse) feature matrix,
using it on tf–idf matrices is recommended over raw frequency counts in an
LSA/document processing setting.

reads from: "text_vectors/tfidf_vectors.npy"
saves to: "document_relations/tsne.npy"

@author: Gati Aher
"""

import numpy as np
from scipy import sparse

from sklearn.decomposition import TruncatedSVD

if __name__ == "__main__":

    tfidf_vectors = sparse.load_npz("text_vectors/tfidf_vectors.npz")

    # do Truncated SVD to reduce dimensionality
    svd = TruncatedSVD(n_components=50, n_iter=7, random_state=42)
    svd.fit(tfidf_vectors)

    print("EXPLAINED VARIENCE RATIO:", svd.explained_variance_ratio_)
    print("EXPLAINED VARIENCE RATIO SUM:", svd.explained_variance_ratio_.sum())
















    # # dissimilarity is 1 minus similarity
    # dissimilarities = 1 - cosine_array
    # # compute the embedding
    # coord = MDS(dissimilarity='precomputed').fit_transform(dissimilarities)
    # # save coord
    # np.save("cosine_data/mds_coords", coord)
    # print("MDS SHAPE: ", coord.shape)
