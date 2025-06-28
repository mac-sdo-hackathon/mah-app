import requests
from lxml import html
from google import genai

import functions_framework

@functions_framework.http
def hello_http(request):
    # Yahoo!ニュース トップページを取得
    url = "https://news.yahoo.co.jp/"
    response = requests.get(url)
    response.encoding = "utf-8"

    # HTMLをパース
    tree = html.fromstring(response.text)

    # XPathで li[1]〜li[7] の aタグを抽出
    links = []
    for i in range(1, 9):  # li[0] は存在しないので 1〜7
        xpath = f"/html/body/div[1]/div/main/div[1]/div/section[1]/div/div/div/ul/li[{i}]/a"
        elems = tree.xpath(xpath)
        if elems:
            link = elems[0].get("href")
            title = elems[0].text_content().strip()
            links.append((title, link))

    top_topics = ""

    # 結果を表示
    for title, link in links:
        print(f"{title}: {link}")
        top_topics += f"{title}: {link}\n"

    topic_prompt = f"""以下のトピックを見て、いい感じのアイスブレイクを返して。
    ```トピック
    {top_topics}
    ```
    """

    print(topic_prompt)

    # The client gets the API key from the environment variable `GEMINI_API_KEY`.
    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=topic_prompt
    )

    print(response.text)
    response = f"{top_topics}\n\n{response.text}"
    return response