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

reads from: "../data/text_vectors/tfidf_vectors.npz"
saves to:
- "../data/document_relations/tsne.npy"
- "../data/document_relations/tsne_df.pkl"

@author: Gati Aher
"""

import numpy as np
from scipy import sparse
import pandas as pd

from sklearn.decomposition import TruncatedSVD
from sklearn.manifold import TSNE

# get num comics
from my_utils import get_latest_comic_num

if __name__ == "__main__":

    tfidf_vectors = sparse.load_npz("../data/text_vectors/tfidf_vectors.npz")

    # do Truncated SVD to reduce dimensionality
    svd = TruncatedSVD(n_components=50, n_iter=7, random_state=42)
    reduced_tfidf_vectors = svd.fit_transform(tfidf_vectors)

    print("EXPLAINED VARIENCE RATIO:", svd.explained_variance_ratio_)
    # EXPLAINED VARIENCE RATIO SUM: 0.1253496762390387
    print("EXPLAINED VARIENCE RATIO SUM:", svd.explained_variance_ratio_.sum())

    # do SVD to project into 2D space
    embedded = TSNE(n_components=2).fit_transform(reduced_tfidf_vectors)

    # save coord
    np.save("../data/document_relations/tsne.npy", embedded)
    print("TSNE SHAPE:", embedded.shape)
    print("TSNE TYPE:", type(embedded))

    # save coords as dataframe
    num_comics = get_latest_comic_num() + 1
    comic_serial_numbers = [ str(i) for i in range(1, num_comics) ]
    df = pd.DataFrame(embedded, columns=['x', 'y'], index=comic_serial_numbers)
    pd.to_pickle(df, "../data/document_relations/tsne_df.pkl")
