# Xkcd_Data_Visualization
A natural language processing and data visualization project.

hosted at: https://xkcd-tsne-visualization.herokuapp.com/

![alt text][xkcd-data-visualization]

[xkcd-data-visualization]: screenshot-xkcd-data-visualization.png "Web App Screenshot"

## Overview

This single-page web application lets users interact with xkcd comics clustered by similarity. In the course of this project, I learned how to clean data, choose different natural language analysis techniques, and build an interactive data visualization, and host a web application.  

Interactions:
- **click and drag on graph:** select points (color points pink), list selected comic serial numbers below; zoom into section of map
- **hover on point:** color point yellow, populate tooltip with comic title
- **click on point / input on text box:** color point red, display title and comic in bottom panel
- **double click on graph:** zoom out

## Background Information on Xkcd Comics

xkcd comics are "A webcomic of romance, sarcasm, math, and language" (xkcd slogan). These comics are licensed under a Creative Commons Attribution-NonCommercial 2.5 License, and their transcripts are available on www.explainxkcd.com (xkcd comic's wiki). This web application uses the first 2283 comics as data source.

## Methodology

**Languages:**
- Python
- Javascript


#### Step 1: Save Comics Transcript, Title, And Alt-Text

**beautifulsoup** for text-scrapping html from www.explainxkcd.com (xkcd comic's wiki)

#### Step 2: Save Comic As Text Vectors of TF-IDF Scores**

**nltk's SnowballStemmer and spacy's Lemminizer** for text-cleaning to increase coherency and reduce number of dimension
  - lemminize and stem to make words with the same root e.g. "run", "running", and "ran" register as the same word
  - clean contractions
  - remove words that are less than 3 characters long
  - remove punctuation, non-english characters, and characters that occur more than three in a row ("wooo" --> "wo")
  - SnowballStemmer is a moderately aggressive stemmer

**sklearn's Tfidfvectorizer** for feature extraction
  - compute word counts, idf and tf-idf values
  - if word occurs in more than 70% of texts, cutoff
  - if word does not occur in at least 2 documents, cutoff
  - number of dimensions is (number of comics x number of unique words)

***TF-IDF (term frequency-inverse document frequency)*** is a statistical measure that evaluates how relevant a word is to a document in a collection of documents. This is done by multiplying two metrics: how many times a word appears in a document, and the inverse document frequency of the word across a set of documents.This downweights words that are common to most of the documents as those very frequent terms would shadow the frequencies of rarer yet more interesting terms.


#### Step 3: Create 2D Embedding of Document Relations**

**sklearn's Truncated SVD** for reducing the feature space and perform latent semantic analysis
  - use truncated singular value decomposition (SVD) to reduce data from 7501 dimensions (words) to 50 dimension (features) that capture most of the variance of the data
  - When truncated SVD is applied to term-document matrices (as returned by TfidfVectorizer), it is known as latent semantic analysis (LSA),because it transforms such matrices to a “semantic” space of low dimensionality
  - In particular, LSA is known to combat the effects of synonymy and polysemy

**sklearn's TSNE** for building document relations expressed as corrdinates in the 2D plane

***TSNE (t-distributed Stochastic Neighbor Embedding)*** is a tool to visualize high-dimensional data in a 2D plane, where similar comics turn into neighboring points.
  - cost function: minimizes the divergence between two distributions, a distribution that measures pairwise similarities of the input objects and a distribution that measures pairwise similarities of the corresponding low-dimensional points in the embedding
  - stochastic: probalistic (based on Gaussian distributions), gives a different outcome every time it runs
  - t-distribution: preserves small distances inside clusters, prevents overlaping in dense clusters. Since it preserves smaller distances (as compared to PCA or SVD which aims to minimize variance) so it preserves local structures well
  - very computationally heavy, so using another dimension reduction technique (PCA, SVD, etc.) to reduce dimensions to 50 before using TSNE is highly recommended

#### Step 4: Build Interactive Web Application To Explore Documnent Relationships**

**d3.js** for front-end, data visualization and event-behavior (click, hover, zoom, etc.)

**Flask** as a back-end
