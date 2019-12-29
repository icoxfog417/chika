import requests
import json
import pandas as pd


def main(path, endpoint):
    df = pd.read_csv(path)

    error = 0
    for i, row in df.iterrows():
        item = {}
        for c in df.columns:
            item[c] = row[c]
        r = requests.post(endpoint, data={
            "body": json.dumps(item)
        })
        if not r.ok:
            error += 1
            r.raise_for_status()
        break

    print(f"{len(df) - error} is registered. {error} is error.")


if __name__ == "__main__":
    url = "https://us-central1-chika-5bc38.cloudfunctions.net/import_data"
    main("word_list.csv", url)
