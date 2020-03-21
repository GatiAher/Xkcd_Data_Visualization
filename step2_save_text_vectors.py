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


# IMPORTS

import os
import re
import string

import numpy as np
import pandas as pd

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer

from sklearn.feature_extraction.text import TfidfVectorizer

from sklearn.metrics.pairwise import cosine_similarity

from nltk.stem.porter import PorterStemmer


# GLOBAL VARIABLES
porter_stemmer = PorterStemmer()


def load_documents(dir):
    labels = []
    documents = []
    for filename in os.listdir(dir):
        fn = dir + "/" + filename
        if filename.startswith("xkcd_"):
            f = open(fn)
            text = f.read()

            my_tokenizer(text)

            # filename between "xkcd_" and ".txt"
            labels.append(filename[5:-4])
            documents.append(text)
            f.close

    return labels, documents


def my_tokenizer(text):
    """
    Acts like default tokenizer but also categorizes numbers and
    stems words in order to reduce dimensions of text vector

    stem means fishes --> fish, caring --> car, cars --> car
    #TODO: replace with lemminization

    # NOTE: The default regexp selects tokens of 2 or more alphanumeric characters
    (punctuation is completely ignored and always treated as a token separator).
    """
    # replace newlines with single whitespace
    text = re.sub(r'\s+', ' ', text)
    # replace punctuation with whitespace
    text = text.translate(str.maketrans(string.punctuation, ' '*(len(string.punctuation))))
    # remove all non-alphabet and non-numeral characters
    text = re.sub(r'[^a-zA-Z0-9 ]', '', text).lower()
    # split string on white space
    words = text.split()

    tokens = []

    for word in words:
        # categorize numbers
        if word.isnumeric():
            tokens.append(str(len(word))+"digit")
        # lemminization on words
        elif word.isalpha() and len(word) >= 2:
            tokens.append(porter_stemmer.stem(word))

    return tokens


# TODO: if word occurs in more than 80% of texts, cutoff
# TODO: if word does not occur at least 2 times, cutoff
def save_tf_idf_vector(documents):
    """
    Convert and save a collection of raw documents to a matrix of TF-IDF features.

    Scikit-learn’s Tfidfvectorizer computes the word counts, idf and tf-idf values all at once.

    TF-IDF (term frequency-inverse document frequency) is a statistical measure that
    evaluates how relevant a word is to a document in a collection of documents.
    This is done by multiplying two metrics: how many times a word appears in a document,
    and the inverse document frequency of the word across a set of documents.
    This downweights words that are common to most of the documents as those very frequent
    terms would shadow the frequencies of rarer yet more interesting terms.
    """

    # settings that used for count vectorizer go here
    tfidf_vectorizer=TfidfVectorizer(tokenizer=my_tokenizer)

    # send in all your documents here
    tfidf_vectors=tfidf_vectorizer.fit_transform(documents)

    #########################################
    # PRINT TFIDF VALUES FOR FIRST DOCUMENT #
    #########################################

    print("*** FEATURE NAMES ***")

    print(tfidf_vectorizer.get_feature_names())
    print(tfidf_vectors.shape)



if __name__ == "__main__":
    # """compare cosine similairity of each document's tf_idf score
    #     save cosine similarity and labels
    # """
    # labels, documents = load_documents("data")
    # tf_idf_vector = get_tf_idf_vector(documents)
    # cos_sim = cosine_similarity(tf_idf_vector, tf_idf_vector)
    #
    # # save cosine similarity
    # np.save("cosine_data/cosine_array.npy", cos_sim)
    #
    # # save labels
    # label_array = np.asarray(labels)
    # np.save("cosine_data/label_array.npy", label_array)

    labels, documents = load_documents("raw_data")
    save_tf_idf_vector(documents)

    print("COMPLETE")
