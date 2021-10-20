// const fs = require("fs");
// const puppeteer = require("puppeteer");

async function scrapeBand() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const ul = document.getElementById("ulWiesbaden");
  const bands = JSON.parse(fs.readFileSync("./data_files/bands.json", "utf-8"));
  const urls = JSON.parse(fs.readFileSync("./data_files/urls.json", "utf-8"));
  const doms = JSON.parse(fs.readFileSync("./data_files/doms.json", "utf-8"));

  const urlsWiesbadenLength = Object.keys(urls.wiesbaden).length;

  let foundItems = 0;

  for (i = 0; i < urlsWiesbadenLength; i++) {
    await page.goto(urls.wiesbaden[i], { waitUntil: "networkidle2" });

    const foundObjects = await page.evaluate(
      ({ bands, doms }) => {
        const result = [];

        const titles = document.querySelectorAll(
          `div[class="${doms.wiesbaden.titles}"] > h2 > span`
        );

        const dates = document.querySelectorAll(
          `span[class="${doms.wiesbaden.dates}"]`
        );

        const subpages = document.querySelectorAll(
          `div[class="${doms.wiesbaden.subpages}"] > a`
        );

        for (j = 0; j < titles.length; j++) {
          const title = titles[j].innerText;
          const checkTitle = title.toLowerCase();
          const date = dates[j].innerText;

          for (k = 0; k < bands.length; k++) {
            const index = checkTitle.indexOf(bands[k]);
            result.push(`${title} : ${date}`, `${subpages[j]}`);
          }
        }
        // RETURN HERE !!
      },
      { bands, doms }
    );

    console.log(foundObjects);

    for (l = 0; l < foundObjects.length; l += 2) {
      if (foundObjects[l] != undefined && foundObjects[l + 1] != undefined) {
        const li = document.createElement("li");
        li.innerHTML = foundObjects[l];
        const subpage = foundObjects[l + 1];
        li.addEventListener("click", function (e) {
          if (e.target) {
            window.open(
              subpage,
              "popup",
              "width=" + screen.width + ",height=" + screen.height
            );
          }
        });
        ul.append(li);
        foundItems++;
      }

      if (foundItems === 1) {
        const h2 = document.getElementById("h2Wiesbaden");
        h2.innerHTML = "Wiesbaden : Veranstaltungen gefunden !";
      }
    }
  }
  if (foundItems === 0) {
    const h2 = document.getElementById("h2Wiesbaden");
    h2.innerHTML = "Wiesbaden : Nichts Interessantes gefunden !";
  }

  await browser.close();
}

scrapeBand();
