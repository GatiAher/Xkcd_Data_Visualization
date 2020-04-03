"""
extract and saves the title and image URL from pages on the 'explain xkcd' html pages

saves to:
- "comic_tags/titles.npy"
- "comic_tags/image_urls.npy"
- "comic_tags/titles_and_image_urls.pkl"

takes about 30 min to run

@author: Gati Aher
"""

###########
# IMPORTS #
###########

# parsing html
import bs4
import requests

# formatting text
import string
import re

# visualize progress bar in terminal
from tqdm import tqdm

# get num comics
from my_utils import get_latest_comic_num

# saving
import numpy as np
import pandas as pd

#############
# FUNCTIONS #
#############

def get_text(comic_number):
    """for comic, go to explain xkcd page, get title and image url
        return title, image_url
    """

    # get HTML text
    text = requests.get('https://www.explainxkcd.com/wiki/index.php/' + str(comic_number))
    if text.status_code != 200: return 0
    soup = bs4.BeautifulSoup(text.text, 'lxml')

    # #############
    # # GET TITLE #
    # #############
    title = soup.title.string[:-15]

    # #################
    # # GET IMAGE URL #
    # #################
    image = soup.find("a", {"class": "image"}).find("img")
    image_url = "https://www.explainxkcd.com" + image['src']

    return title, image_url


if __name__ == "__main__":
    """record all comics in range 0-num_comics. record any errors"""

    num_comics = get_latest_comic_num() + 1

    titles = []
    image_urls = []

    for i in tqdm(range(1, num_comics)):
        try:
            title, image_url = get_text(i)
            print(i, title)
            print(i, image_url)
            print(len(titles))
            print(len(image_urls))
            print()
            titles.append(title)
            image_urls.append(image_url)
        except:
            # record errors
            f = open("comic_tags/ERROR_" + str(i) + ".txt","w")
            f.write("*** (" + str(i) + ") An exception occurred ***")
            f.close()

    # save as individual numpy arrays
    titles_array = np.asarray(titles)
    np.save("comic_tags/titles.npy", titles_array)
    image_urls_array = np.asarray(image_urls)
    np.save("comic_tags/image_urls.npy", image_urls_array)

    # save as DataFrame
    comic_serial_numbers = [ str(i) for i in range(1, num_comics) ]
    d = {"title":titles, "image":image_urls}
    df = pd.DataFrame(d, columns=["title", "image"], index=comic_serial_numbers)
    pd.to_pickle(df, "comic_tags/titles_and_image_urls.pkl")

    print(df.shape)
