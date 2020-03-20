"""
measures and saves how similar the documents are irrespective of their size
computes the tf_idf score for each document and compares those with cosine similarity
reads "xkcd_xxx.txt" files in "data" directory
saves files to:
- "cosine_data/word_count_vector_array.npy"
- "cosine_data/cosine_array.npy"
- "cosine_data/label_array.npy"
@author: Gati Aher
"""

import os

import numpy as np

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer

from sklearn.metrics.pairwise import cosine_similarity


def load_documents(dir):
    labels = []
    documents = []
    for filename in os.listdir(dir):
        fn = dir + "/" + filename
        if filename.startswith("xkcd_"):
            f = open(fn)
            text = f.read()
            # filename between "xkcd_" and ".txt"
            labels.append(filename[5:-4])
            documents.append(text)
            f.close

    return labels, documents


def get_tf_idf_vector(documents):
    """calculate tf_idf vector
    In a large text corpus, some words will be very present
    (e.g. “the”, “a”, “is” in English) hence carrying very little
    meaningful information about the actual contents of the document.
    If we were to feed the direct count data directly to a classifier
    those very frequent terms would shadow the frequencies of rarer
    yet more interesting terms.
    In order to re-weight the count features into floating point values suitable
    for usage by a classifier it is very common to use the tf–idf transform
    SOURCE: https://scikit-learn.org/stable/modules/feature_extraction.html
    """
    ########################
    # INIT COUNTVECTORIZER #
    ########################
    cv = CountVectorizer()
    # this steps generates word counts for the words in documents
    word_count_vector = cv.fit_transform(documents)
    np.save("cosine_data/word_count_vector_array.npy", word_count_vector)
    print("WORD COUNT VECTOR SHAPE: ", word_count_vector.shape)
    ######################
    # COMPUTE IDF VALUES #
    ######################
    tfidf_transformer = TfidfTransformer(smooth_idf=True,use_idf=True)
    tfidf_transformer.fit(word_count_vector)
    #####################################
    # COMPUTE TFIDF SCORE FOR DOCUMENTS #
    #####################################
    # count matrix
    count_vector = cv.transform(documents)
    # tf-idf scores
    tf_idf_vector=tfidf_transformer.transform(count_vector)
    #######################
    # RETURN TFIDF SCORES #
    #######################
    return tf_idf_vector


if __name__ == "__main__":
    """compare cosine similairity of each document's tf_idf score
        save cosine similarity and labels
    """
    labels, documents = load_documents("data")
    tf_idf_vector = get_tf_idf_vector(documents)
    cos_sim = cosine_similarity(tf_idf_vector, tf_idf_vector)

    # save cosine similarity
    np.save("cosine_data/cosine_array.npy", cos_sim)

    # save labels
    label_array = np.asarray(labels)
    np.save("cosine_data/label_array.npy", label_array)

    print("COMPLETE")
