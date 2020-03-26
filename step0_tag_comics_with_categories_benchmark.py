"""
extract and saves the topic categories for comics from pages on the 'explain xkcd' html pages

saves to: "comic_tags/comic_tags"
saves to: "comic_tags/visited_subcategories"

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

# save list of lists
import pickle
import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer


# get num comics
from my_utils import get_latest_comic_num



#############
# FUNCTIONS #
#############

def go_into_subcategory(link, comic_tags, visited_subcategories):
    """
    go into subcategory page
    """
    text = requests.get("https://www.explainxkcd.com" + link)
    if text.status_code != 200: print("!! ERROR !!")
    soup = bs4.BeautifulSoup(text.text, 'lxml')

    title = soup.title.string.lower()
    tag = title[9:-15]

    if tag not in visited_subcategories:
        visited_subcategories.append(tag)

        serial_numbers = get_comic_serial_numbers(soup)
        for num in serial_numbers:
                if num < len(comic_tags):
                    comic_tags[num].append(tag)
                else:
                    print("*****COMIC NUM", num)

        hrefs = get_subcategory_hrefs(soup)
        for href in hrefs:
            go_into_subcategory(href, comic_tags, visited_subcategories)


def get_subcategory_hrefs(soup):
    """
    return list of subcategory hrefs on soup current page
    """
    ret_list = []

    mw_subcategories = soup.find("div", {"id": "mw-subcategories"})
    if mw_subcategories:
        anchors = mw_subcategories.find_all("a")

        for doc in anchors:
            href = doc["href"]
            ret_list.append(href)

    return ret_list


def get_comic_serial_numbers(soup):
    """
    get list of comics numbers on soup current page
    """
    ret_list = []

    mw_pages = soup.find("div", {"id": "mw-pages"})
    if mw_pages:
        anchors = mw_pages.find_all("a")

        for doc in anchors:
            title = doc["title"]
            serial_number = re.search(r'\d*', title).group()
            if len(serial_number) > 1:
                ret_list.append(int(serial_number))

    return ret_list


if __name__ == "__main__":

    num_comics = get_latest_comic_num() + 1
    comic_tags = [ [] for i in range(num_comics) ] # just ignore the first index, indexing works nicely
    visited_subcategories = []
    go_into_subcategory("/wiki/index.php/Category:Comics_by_topic", comic_tags, visited_subcategories)

    mlb = MultiLabelBinarizer()
    df = pd.DataFrame(mlb.fit_transform(comic_tags),columns=mlb.classes_)
    print(df.shape)
    pd.to_pickle(df, 'comic_tags/comic_tags_df.pkl')

    print("load")
    df2 = pd.read_pickle("comic_tags/comic_tags_df.pkl")
    print(df2.shape)

    print("LEN SUB:", len(visited_subcategories))

    # # Its important to use binary mode, save comic_tags
    # comic_tags_file = open('comic_tags/comic_tags', 'ab')
    # pickle.dump(comic_tags, comic_tags_file)
    # comic_tags_file.close()
    #
    # # Its important to use binary mode, save visited_subcategories
    # visited_subcategories_file = open('comic_tags/visited_subcategories', 'ab')
    # pickle.dump(visited_subcategories, visited_subcategories_file)
    # visited_subcategories_file.close()
