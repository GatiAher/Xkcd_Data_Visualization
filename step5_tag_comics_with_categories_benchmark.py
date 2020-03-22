"""
extract and saves the categories for comics from pages on the 'explain xkcd' html pages

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

####################
# GLOBAL VARIABLES #
####################

# latest comic + 1
num_comics = 2283

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
    print("TAG: ", tag)

    if tag not in visited_subcategories:
        visited_subcategories.append(tag)

        serial_numbers = get_comic_serial_numbers(soup)
        for num in serial_numbers:
                if num < num_comics:
                    comic_tags[num].append(tag)
                else:
                    print("*****COMIC NUM", num)

        hrefs = get_subcategory_hrefs(soup)
        for href in hrefs:
            go_into_subcategory(href, comic_tags, visited_subcategories)


def get_subcategory_hrefs(soup):
    """
    return list of subcategory hrefs on this page
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
    get list of comics numbers on this page
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

    # working with 1-2282 comics
    comic_tags = [ [] for i in range(num_comics) ] # just ignore the first index, numbering works nicely
    visited_subcategories = []
    go_into_subcategory("/wiki/index.php/Category:Comics_by_topic", comic_tags, visited_subcategories)
    # print(comic_tags)

    max_idx = -1
    max_len = -1
    min_idx = -1
    min_len = 200
    for tag_idx, tag_list in enumerate(comic_tags):
        print(tag_idx)
        print(tag_list)
        tag_len = len(tag_list)
        if tag_len > max_len:
            max_idx = tag_idx
            max_len = tag_len
        if tag_len < min_len:
            min_idx = tag_idx
            min_len = tag_len

    print("MAX")
    print(comic_tags[max_idx])
    print(max_idx, max_len)

    print("MIN") # expect 0
    print(comic_tags[min_idx])
    print(min_idx, min_len)

    print(len(visited_subcategories))
