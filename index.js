import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
const PORT = 5001;

const corsOptions = {
  origin: "*",
  credentials: true // <-- REQUIRED backend setting
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get("/", (_req, res) => {
  res.send("Hello World");
});

app.post("/get-news", async (_req, res) => {
  try {
    const { data } = await axios({
      method: "GET",
      url: "https://zeit.de/index"
    });

    const $ = cheerio.load(data);
    const articles = [];
    $("article")
      .children("a")
      .each((i, article) => {
        let picture = $(article)
          .find($("figure img"))
          .attr("src");

        if (
          !picture &&
          $(article)
            .children("figure")
            .children("div")
            .children("noscript")[0]
        ) {
          const data = $(article).find("noscript");
          data.each((i, el) => {
            el.children.forEach(child => {
              const links = child.data.split('src="');
              picture = links[1].substring(0, links[1].search('"'));
            });
          });
        }

        articles.push({
          title: article.attribs.title,
          link: article.attribs.href,
          picture,
          description: $(article)
            .find($("p"))
            .text()
        });
      });

    const filteredArticles = articles.filter(article => article.title);

    res.send({ articles: filteredArticles });
  } catch (error) {
    console.log("\x1b[1m%s\x1b[0m", error);
    res.status(501);
  }
});

app.listen(PORT, () => console.log(`App is running on Port ${PORT}`));
