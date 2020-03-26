"""
shared functions
"""

def get_latest_comic_num():
    """
    Load the comic number from 'latest_comic_num.txt'

    return: int
    """
    fn = "latest_comic_num.txt"
    f = open(fn)
    num = f.read()
    f.close
    return int(num)
