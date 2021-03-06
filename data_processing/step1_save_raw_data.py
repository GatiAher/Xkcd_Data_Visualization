"""
extract and saves the text from pages on the 'explain xkcd' html pages
for each comic, this parses the explained xkcd html file.
saves title, alt-text, and transcript as a single line
to a file named "../data/raw_data/xkcd_" + comic_number + ".txt" inside of raw_data/ directory

saves to:
- "../data/raw_data/xkcd_" + comic_number + ".txt"

- "../data/comic_tags/titles.npy"
- "../data/comic_tags/alt_text.npy"
- "../data/comic_tags/image_urls.npy"

takes 20-30 minutes to run

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

# saving display data
import numpy as np

#############
# FUNCTIONS #
#############

def put_text_into_file(comic_number):
    """for comic, save title, alt-text, transcript
        return 1 if successful, 0 if unsucessful
    """

    # get HTML text
    text = requests.get('https://www.explainxkcd.com/wiki/index.php/' + str(comic_number))
    if text.status_code != 200: return 0
    soup = bs4.BeautifulSoup(text.text, 'lxml')

    #############
    # GET TITLE #
    #############
    title = soup.title.string.lower()
    number_string = re.search(r'\d+', title).group()
    number_string = number_string
    name_string = re.search(r'[a-z]([^\n-]*)', title).group()

    ###########
    # GET ALT #
    ###########
    alt = soup.find("a", {"class": "image"})
    alt_string = alt.get('title')

    ##################
    # GET TRANSCRIPT #
    ##################
    # add all transcript lines to list
    transcript_lines = []
    # span element with id Transcript is a level below
    # header element that is siblings with dl element
    transcript_element = soup.find("span", {"id": "Transcript"})
    if transcript_element is not None:
        #NOTE: comic 1116 doesn't have transcript
        current_element = transcript_element.parent
        # append all the dd elements
        while(current_element.next_sibling is not None):
            current_element = current_element.next_sibling
            # print(current_element)
            if current_element.name == 'span' or current_element.name == 'h2': break
            for item in current_element:
                if(type(item) == bs4.element.Tag): transcript_lines.append(item.text)

    transcript_string = " ".join(transcript_lines)

    ##################
    # SAVE INTO FILE #
    ##################
    print("NUMBER: ", number_string)

    save_string = ""
    save_string += name_string + " "
    if alt_string is not None: save_string += alt_string + " "
    save_string += transcript_string + " "

    print("SAVE STRING: ", save_string)

    file1 = open("../data/raw_data/xkcd_" + number_string + ".txt","w")
    file1.write(save_string)
    file1.close()

    ####################
    # GET DISPLAY DATA #
    ####################

    display_title = soup.title.string[:-15]

    display_alt_text = alt_string

    image = soup.find("a", {"class": "image"}).find("img")
    display_image_url = "https://www.explainxkcd.com" + image['src']

    return display_title, display_alt_text, display_image_url


if __name__ == "__main__":
    """record all comics in range 0-num_comics. record any errors"""

    num_comics = get_latest_comic_num() + 1

    display_title_list = []
    display_alt_text_list = []
    display_image_url_list = []

    for i in tqdm(range(num_comics)):
        try:
            display_title, display_alt_text, display_image_url = put_text_into_file(i)
            display_title_list.append(display_title)
            display_alt_text_list.append(display_alt_text)
            display_image_url_list.append(display_image_url)
        except:
            # record errors
            f = open("../data/raw_data/ERROR_" + str(i) + ".txt","w")
            f.write("*** (" + str(i) + ") An exception occurred ***")
            f.close()

    # save as display individual numpy arrays
    display_title_array = np.asarray(display_title_list)
    np.save("../data/comic_tags/titles.npy", display_title_array)
    display_alt_text_array = np.asarray(display_alt_text_list)
    np.save("../data/comic_tags/alt_text.npy", display_alt_text_array)
    display_image_url_array = np.asarray(display_image_url_list)
    np.save("../data/comic_tags/image_urls.npy", display_image_url_array)
