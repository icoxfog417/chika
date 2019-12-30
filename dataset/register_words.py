import requests
import json
import pandas as pd
from tqdm import tqdm


def main(path, endpoint):
    df = pd.read_csv(path)
    # df = df.sample(frac=0.5).reset_index(drop=True)

    counts = {}
    for i, row in df.iterrows():
        index, number = row["index"].split("_")
        index = int(index)
        if index not in counts:
            counts[index] = []
        counts[index].append(number)

    count_body = {
        "counts": {}
    }
    for i in counts:
        count_body["counts"][i] = len(counts[i])

    print(count_body)
    r = requests.post(endpoint + "/import_count", data={
        "body": json.dumps(count_body)
    }, timeout=10)
    print(r)

    count = 0
    index_dict = {}
    for i, row in tqdm(df.iterrows(), total=df.shape[0]):
        item = {}
        for c in df.columns:
            item[c] = row[c]
        index = item["index"]
        _index, _ = index.split("_")
        if _index not in index_dict:
            index_dict[_index] = 0
        new_index = f"{_index}_{index_dict[_index]}"

        try:
            item["index"] = new_index
            r = requests.post(endpoint + "/import_data", data={
                "body": json.dumps(item)
            }, timeout=10)
            if r.ok:
                count += 1
                index_dict[_index] += 1
        except Exception as ex:
            print(ex)
            continue

    print(f"{count} words are registered")


if __name__ == "__main__":
    url = "https://us-central1-chika-5bc38.cloudfunctions.net"
    main("word_list.csv", url)
