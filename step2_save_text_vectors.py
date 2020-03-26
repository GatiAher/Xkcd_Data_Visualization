"""
load all the documents, clean text, create tfidf_vectors (weighted text vector)

save:
- serial_numbers for comics
- tfidf_vectors
- feature_names

reads "xkcd_xxx.txt" files in "raw_data" directory
saves files to:
- "text_vectors/tfidf_vectors.npz"
- "text_vectors/feature_names.npy"
- "text_vectors/tfidf_vectors_df.pkl"

takes 1 min to run

@author: Gati Aher
"""

# IMPORTS

import os
import re

from scipy import sparse
import numpy as np
import pandas as pd

import spacy
# NOTE: to download model, in terminal: python -m spacy download en
from nltk.stem import SnowballStemmer

from sklearn.feature_extraction.text import TfidfVectorizer

# get num comics
from my_utils import get_latest_comic_num


def load_documents():
    """
    Load the comic word data from each comic's serially numbered file.

    return: list of strings (for each comic: title, alt-text, transcript)
    save: list of serial_numbers in order (for each comic, uniquely identifiable)
    """

    num_comics = get_latest_comic_num() + 1

    dir = "raw_data"
    serial_numbers = []
    documents = []
    for i in range(1, num_comics):
        fn = dir + "/xkcd_" + str(i) + ".txt"
        f = open(fn)
        text = f.read()
        documents.append(text)
        f.close

    return documents


nlp = spacy.load('en_core_web_sm')
stemmer = SnowballStemmer("english")
def my_tokenizer(text):
    """
    Categorizes numbers and lemminize, stems, and squashes words in order to
    reduce dimensions of text vector and count tokens in the same word family.

    # NOTE: This only tokenizes words that contain only the characters [a-z] and
    are more than 2 letters long, or contain only characters [0-9] and are tokenized
    as '#num'

    # NOTE: "The default regexp selects tokens of 2 or more alphanumeric characters
    (punctuation is completely ignored and always treated as a token separator)."

    param: string
    return: list of strings
    """
    ret_tokens = []
    doc = nlp(text)
    for token in doc:
        lem = token.lemma_.lower()
        # if token is only letters, add lemma token to retlist
        if len(lem) > 2 and bool(re.match(r'^[A-Za-z]+$', lem)):
            # squash indentical consecutive letters. Ex: woooo --> wo
            squashed = re.sub(r'([a-z])\1\1+', r'\1', lem)
            stem = stemmer.stem(squashed)
            ret_tokens.append(stem)
        # if token is only numbers, add category token to retlist
        elif bool(re.match(r'^[0-9]+$', lem)):
            category = str(len(lem)) + "num"
            ret_tokens.append(category)
    return ret_tokens


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

    This particular implementation uses my tokenizer
    """

    # NOTE: if word occurs in more than 70% of texts, cutoff
    # NOTE: if word does not occur in at least 2 documents, cutoff
    # NOTE: to use LSA in step3, sublinear scaling and inverse document frequency
    # should be turned on (sublinear_tf=True, use_idf=True) to bring the
    # feature values closer to a Gaussian distribution, compensating
    # for LSA’s erroneous assumptions about textual data.
    tfidf_vectorizer=TfidfVectorizer(tokenizer=my_tokenizer, min_df=2, max_df=0.7,
                                    sublinear_tf=True, use_idf=True)

    # send in all documents, get their tfidf scores
    tfidf_vectors=tfidf_vectorizer.fit_transform(documents)
    # tfidf_vectors type is: <class 'scipy.sparse.csr.csr_matrix'>
    sparse.save_npz("text_vectors/tfidf_vectors.npz", tfidf_vectors)

    # save names of features (words that are columns for text vectors)
    feature_names = np.asarray(tfidf_vectorizer.get_feature_names())
    np.save("text_vectors/feature_names.npy", feature_names)

    # save as DataFrame
    num_comics = get_latest_comic_num() + 1
    comic_serial_numbers = [ str(i) for i in range(1, num_comics) ]
    df = pd.DataFrame(tfidf_vectors.todense(), columns=tfidf_vectorizer.get_feature_names(), index=comic_serial_numbers)
    pd.to_pickle(df, 'text_vectors/tfidf_vectors_df.pkl')

    # know how big of a vector was produced
    print(tfidf_vectors.shape)


if __name__ == "__main__":
    """
    load all the documents (comics)
    calculate and save documents tf_idf scores
    """
    documents = load_documents()
    save_tf_idf_vector(documents)

    print("COMPLETE")
