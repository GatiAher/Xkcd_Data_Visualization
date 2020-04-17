"""
plot points and topic labels

reads from:
* 'document_relations/tsne.npy' or 'document_relations/mds.npy'
* 'text_vectors/serial_numbers.npy'
* 'comic_tags/comic_tags'
* 'comic_tags/visited_subcategories'

saves to:
* 'images/xxx.jpg'

@author: Gati Aher
"""

import numpy as np
import pickle

import matplotlib.pyplot as plt


if __name__ == "__main__":

    # get TSNE embedded
    embedded = np.load('document_relations/tsne.npy') # shape (2282, 2)

    # get MDS embedded
    # embedded = np.load('document_relations/mds.npy') # shape (2282, 2)

    # get serial_numbers
    serial_numbers = np.load('text_vectors/serial_numbers.npy') # shape (2282,)

    # get comic_tags
    load_comic_tags_file = open('comic_tags/comic_tags', 'rb')
    comic_tags = pickle.load(load_comic_tags_file) # len 2283

    # get visited_subcategories
    load_visited_subcategories_file = open('comic_tags/visited_subcategories', 'rb')
    visited_subcategories = pickle.load(load_visited_subcategories_file) # len 222

    ##########################
    # CONNECT TAGS TO POINTS #
    ##########################
    tagged_serial_numbers = dict(zip(serial_numbers, [[None]]*len(serial_numbers)))
    for idx, comic_tag in enumerate(comic_tags):
        if str(idx) in tagged_serial_numbers.keys(): # omit index 0
            tagged_serial_numbers[str(idx)] = comic_tag

    # print("TAG:", tagged_serial_numbers["2283"])

    ########
    # PLOT #
    ########

    # colors
    color_selected = [1, 0, 0]
    color_unselected = [0.5, 0.5, 0.5, 0.05]

    # create 225 lists of 2282 points-colors
    color_lists = [ [color_unselected]*len(embedded) for i in range(len(visited_subcategories)) ]
    for idx_topic, topic in enumerate(visited_subcategories):
        for idx_serial, serial_number in enumerate(serial_numbers):
            if topic in tagged_serial_numbers[serial_number]:
                color_lists[idx_topic][idx_serial] = color_selected

    # plotting
    # NOTE: number of topic specific
    # currently 222 topics --> make 228 subplots
    num_suplots = 19
    num_rows = 3
    num_cols = 4
    plots = []

    counter = 0
    marker_size = [1]*len(serial_numbers)
    for i in range(num_suplots):
        fig, axs = plt.subplots(nrows=num_rows, ncols=num_cols, sharex='all', sharey='all')
        for r in range(num_rows):
            for c in range(num_cols):
                if counter < len(color_lists):
                    axs[r, c].scatter(embedded[:,0],
                                    embedded[:,1],
                                    c=color_lists[counter],
                                    s=marker_size)
                    axs[r, c].set_title(visited_subcategories[counter], fontsize=10)
                else:
                    axs[r, c].scatter(embedded[:,0],
                                    embedded[:,1],
                                    c=[color_unselected],
                                    s=marker_size)
                    axs[r, c].set_title("extra", fontsize=10)
                counter += 1
        fig.savefig('images/tsne_' + str(i) + '.jpg')
