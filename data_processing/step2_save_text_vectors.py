"""
load all the documents, clean text, create tfidf_vectors (weighted text vector)

save:
- tfidf_vectors
- feature_names

reads "xkcd_xxx.txt" files in "../data/raw_data" directory
saves files to:
- "../data/text_vectors/tfidf_vectors.npz"
- "../data/text_vectors/tfidf_feature_names.txt"

takes 1 min to run

@author: Gati Aher
"""

# IMPORTS

import os
import re

from scipy import sparse
import numpy as np
import json

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

    dir = "../data/raw_data"
    serial_numbers = []
    documents = []
    for i in range(1, num_comics):
        fn = dir + "/xkcd_" + str(i) + ".txt"
        f = open(fn)
        text = f.read()
        documents.append(text)
        f.close

    return documents


# import spacy (lemminizer) library
spacy_nlp = spacy.load('en_core_web_sm')
# # check pre-defined stop words
# spacy_stopwords = spacy.lang.en.stop_words.STOP_WORDS
# add custom stop_words
f = open("custom_stop_words.txt")
for word in f:
    spacy_nlp.vocab[word.strip()].is_stop = True
f.close()

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
    doc = spacy_nlp(text)

    # remove stop words
    tokens = [token.text for token in doc if not token.is_stop]

    for token in tokens:
        lem = token.lower() #token.lemma_.lower()
        # if token is only letters, consider adding lemma token to retlist
        if len(lem) > 2 and bool(re.match(r'^[A-Za-z]+$', lem)):
            # squash indentical consecutive letters. Ex: woooo --> wo
            squashed = re.sub(r'([a-z])\1\1+', r'\1', lem)
            stem = stemmer.stem(squashed)
            ret_tokens.append(stem)
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
    tfidf_vectorizer=TfidfVectorizer(tokenizer=my_tokenizer, min_df=3, max_df=0.5,
                                    sublinear_tf=True, use_idf=True)

    # send in all documents, get their tfidf scores
    tfidf_vectors=tfidf_vectorizer.fit_transform(documents)
    # tfidf_vectors type is: <class 'scipy.sparse.csr.csr_matrix'>
    sparse.save_npz("../data/text_vectors/tfidf_vectors.npz", tfidf_vectors)

    # save names of features (words that are columns for text vectors)
    feature_names = tfidf_vectorizer.get_feature_names()
    with open('../data/text_vectors/tfidf_feature_names.txt', 'w') as f:
        json.dump(feature_names, f)
    # feature_names = np.asarray(tfidf_vectorizer.get_feature_names())
    # np.save("../data/text_vectors/tfidf_feature_names.npy", feature_names)

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
