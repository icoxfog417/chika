import os
import unicodedata
import random
from urllib.parse import urljoin
import requests
import pandas as pd
from bs4 import BeautifulSoup
from tqdm import tqdm
from janome.tokenizer import Tokenizer
from janome.analyzer import Analyzer
from janome.tokenfilter import POSKeepFilter, CompoundNounFilter


class Storage():

    def __init__(self, root=""):
        self.root = root
        if not root:
            self.root = os.path.join(
                            os.path.dirname(__file__), "./data")
    
    def path(self, file_name):
        return os.path.join(self.root, file_name)

    def exists(self, file_name):
        return os.path.exists(self.path(file_name))

    def download(self, url, file_name, encoding="utf-8"):
        r = requests.get(url, stream=True)
        path = self.path(file_name)
        if r.ok:
            r_encoding = r.apparent_encoding.lower()
            with open(path, mode="wb") as f:
                if r_encoding == encoding:
                    f.write(r.content)
                else:
                    f.write(r.content.decode(r_encoding).encode(encoding))
        else:
            r.raise_for_status()

        return path

    def read_as_xml(self, file_name, encoding="utf-8"):
        html = None
        with open(self.path(file_name), "r", encoding=encoding) as f:
            html = BeautifulSoup(f.read(), "lxml")

        return html


def get_list(ranking_url):
    storage = Storage()
    file_name = "ranking.html"

    if not storage.exists(file_name):
        storage.download(ranking_url, file_name)

    html = storage.read_as_xml(file_name)
    table = html.find("table", attrs={"class": "list"})
    link_list = []
    for row in table.find_all("tr"):
        href = row.find("a")
        if href is None:
            continue
        title = href.text.strip()
        url = href.attrs["href"]
        link_list.append({
            "title": title,
            "url": url
        })
    link_list = pd.DataFrame(link_list)
    return link_list


def download_literature(row):
    storage = Storage()
    title = row["title"]
    url = row["url"]
    literature_name = f"{title}_content.html"
    path = storage.path(literature_name)

    if not storage.exists(literature_name):
        file_name = f"{title}_page.html"
        html = None
        if not storage.exists(file_name):
            storage.download(url, file_name)
        html = storage.read_as_xml(file_name)

        try:
            xhtml_index = html.find("img", attrs={"alt": "htmlアイコン"})
            xhtml_link = xhtml_index.find_next("a").attrs["href"]
            url = urljoin(url, xhtml_link)
            path = storage.download(url, literature_name, encoding="utf-8")
            xml = storage.read_as_xml(literature_name)
            meta = xml.new_tag("meta", attrs={
                                "name": "DC.Link",
                                "content": url})
            xml.find("head").append(meta)
            with open(path, "w", encoding="utf-8") as f:
                f.write(str(xml))
            os.remove(storage.path(file_name))
        except Exception as ex:
            literature_name = ""
            print(ex)

    return literature_name


def get_words(file_name):
    storage = Storage()
    xml = storage.read_as_xml(file_name)

    def get_meta(name):
        return xml.find("meta", attrs={"name": name}).attrs["content"]

    author = get_meta("DC.Title")
    title = get_meta("DC.Creator")
    url = get_meta("DC.Link")

    # erase ruby
    for r in xml.find_all("ruby"):
        r.extract()
    for i in xml.find_all("img"):
        i.extract()
    for s in xml.find_all("span", attrs={"class": "notes"}):
        s.extract()

    body = xml.find("div", attrs={"class": "main_text"})

    text = body.text
    text = unicodedata.normalize("NFKC", text)
    text = text.strip()
    text = text.replace("\r", "").replace("\n", "\n")

    sections = text.split("\n")
    sections = [s.strip() for s in sections if s.strip()]

    tokenizer = Tokenizer()
    token_filters = [CompoundNounFilter()]
    analyzer = Analyzer(tokenizer=tokenizer, token_filters=token_filters)

    words = {}
    for s in tqdm(sections):
        sentences = s.split("。")
        for x in sentences:
            _x = x.strip()
            if _x and len(_x) > 10:
                for token in analyzer.analyze(_x):
                    pos = token.part_of_speech.split(",")
                    if token.surface.endswith("ン"):
                        continue
                    if not pos[0].startswith("名詞"):
                        continue
                    if pos[1] not in ["一般", "複合"]:
                        continue
                    if "*" in token.reading or len(token.reading) == 1:
                        continue
                    if pos[1] == "複合" and token.surface.endswith("の"):
                        continue

                    word = {
                        "author": author,
                        "title": title,
                        "url": url,
                        "reading": token.reading,
                        "prefix": token.reading[0],
                        "word": token.surface,
                        "context": _x
                    }
                    if word["prefix"] not in words:
                        words[word["prefix"]] = []
                    words[word["prefix"]].append(word)

    return words


if __name__ == "__main__":
    ranking_2019_04 = "https://www.aozora.gr.jp/access_ranking/2019_04_xhtml.html"
    link_list = get_list(ranking_2019_04)
    word_all = {}
    trial_count = 10
    for i, row in link_list.iterrows():
        name = download_literature(row)
        if not name:
            continue

        registered = 0
        words = get_words(name)
        for k in words:
            if k not in word_all:
                word_all[k] = {}

            for t in range(trial_count):
                w = random.choice(words[k])
                if w["word"] not in word_all[k]:
                    word_all[k][w["word"]] = w
                    registered += 1
                    break

        print(f"{registered} words are registered from {row['title']})")

        if i > 1:
            break

    word_list = []
    for p in word_all:
        index = 0
        for w in word_all[p]:
            _w = word_all[p][w]
            _w["index"] = f"{ord(p)}_{index}"
            word_list.append(_w)
            index += 1

    word_list = pd.DataFrame(word_list)
    word_list.to_csv("word_list.csv", index=False)
