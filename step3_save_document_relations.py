"""
use truncated singular value decomposition (SVD) to reduce data from
7501 dimensions to 50 dimension.

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
from sklearn.manifold import TSNE

if __name__ == "__main__":

    tfidf_vectors = sparse.load_npz("text_vectors/tfidf_vectors.npz")

    # do Truncated SVD to reduce dimensionality
    svd = TruncatedSVD(n_components=50, n_iter=7, random_state=42)
    reduced_tfidf_vectors = svd.fit_transform(tfidf_vectors)

    print("EXPLAINED VARIENCE RATIO:", svd.explained_variance_ratio_)
    # EXPLAINED VARIENCE RATIO SUM: 0.1253496762390387
    print("EXPLAINED VARIENCE RATIO SUM:", svd.explained_variance_ratio_.sum())

    # do SVD to project into 2D space
    embedded = TSNE(n_components=2).fit_transform(reduced_tfidf_vectors)
    print("EMBEDDED SHAPE:", embedded.shape)
    print("EMBEDDED TYPE:", type(embedded))

    np.save("document_relations/tsne.npy", embedded)
