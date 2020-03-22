"""
plot MDS points and labels
to visualize the texts in a two dimensional space
creates a scatterplot of texts' MDS coordinates (x, y)
labeled with comic number
this can help identify clusters of similar texts
reads from: "cosine_data/mds_coords.npy" and "cosine_data/label_array.npy"
@author: Gati Aher
"""

import numpy as np
import pickle

import matplotlib.pyplot as plt


if __name__ == "__main__":

    # get TSNE embedded
    embedded = np.load('document_relations/tsne.npy')
    print("EMBEDDED SHAPE:", embedded.shape)

    # get serial_numbers
    serial_numbers = np.load('text_vectors/serial_numbers.npy')
    print("SERIAL_NUMBERS LEN:", len(serial_numbers))
    print("SERIAL_NUMBERS SHAPE:", serial_numbers.shape)

    # get comic_tags
    load_comic_tags_file = open('comic_tags/comic_tags', 'rb')
    comic_tags = pickle.load(load_comic_tags_file)
    print("COMIC_TAGS LEN:", len(comic_tags))

    # get visited_subcategories
    load_visited_subcategories_file = open('comic_tags/visited_subcategories', 'rb')
    visited_subcategories = pickle.load(load_visited_subcategories_file)
    print("VISITED SUBCATEGORIES LEN:", len(visited_subcategories))

    ##########################
    # CONNECT TAGS TO POINTS #
    ##########################
    tagged_serial_numbers = dict(zip(serial_numbers, [[None]]*len(serial_numbers)))
    print(serial_numbers[1])
    print(tagged_serial_numbers["0001"])

    ########
    # PLOT #
    ########

    # plotting
    plt.scatter(embedded[:,0], embedded[:,1])

    # Label the points
    for idx, point in enumerate(embedded):
        plt.annotate(serial_numbers[idx], point)

    plt.show()
