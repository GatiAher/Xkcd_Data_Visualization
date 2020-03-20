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
import matplotlib.pyplot as plt



if __name__ == "__main__":

    mds_coords =  np.load("cosine_data/mds_coords.npy")
    label_array =  np.load("cosine_data/label_array.npy")

    ########
    # PLOT #
    ########

    # plotting
    plt.scatter(mds_coords[:,0], mds_coords[:,1])

    # Label the points
    for i in range(mds_coords.shape[0]):
        plt.annotate(label_array[i], (mds_coords[i,:]))

    plt.show()
