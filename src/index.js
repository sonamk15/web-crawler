const fetch = require('node-fetch');
const cheerio = require("cheerio");

let url = "https://www.youtube.com/";
let depth = 2

const seenUrls = {};
let mainDict = { }
let total_links = 0
total_images = 0
let details = []
let arr


const getUrl = (link) => {
  if (link.includes("http")){
    return link;
  }
  else if (link.includes("/")) {
    return `https://www.youtube.com`;
  }
  else {
    return `https://www.youtube.com/${link}`;
  }
};


const crawl = async (url) => {
  let dic = {}
  arr = []
  if (seenUrls[url]) return [];

  seenUrls[url] = true;
  let urlKey = url
  const response = await fetch(url);

  const html = await response.text();
  const $ = cheerio.load(html);
  const links = await $("a")
    .map((i, link) => link.attribs.href)
    .get();

  const images = await $("img")
    .map((i, link) => link.attribs.src)
    .get();

  total_images+=images.length
  for (let i = 0; i < links.length; i++) {
    let link = getUrl(links[i])
    arr.push(link)
  }
  let uniqueItems = [...new Set(arr)]
// actually in many page title is not defined so for the title I used to link only
  dic['page_title'] = urlKey
  dic['page_link'] = urlKey
  dic["image_count"] = images.length

  details.push(dic)
  return (uniqueItems)
};


const scrape = async () => {
  if (depth == 0)return;
  else if (depth == 1) {
    let queue = []
    queue.push(url)
    const allLinks = []
    const urls = await Promise.all(queue.map(async (link) => await crawl(link) ))
    urls.map((array) => {
      if (array.length) {
        array.map((newLink) => {
          allLinks.push(newLink)
        })
      }
    })
    mainDict['total_links']=total_links
    mainDict["total_images"] = total_images
    mainDict['details']= details
    return mainDict
  }
  else {
    let queue = []
    queue.push(url)

    for (let i = 0; i < depth; i++) {
      if (queue.length) {
        const allLinks = []
        const urls = await Promise.all(queue.map(async (link) => await crawl(link) ))
        urls.map((array) => {
          if (array.length) {
            array.map((newLink) => {
              allLinks.push(newLink)
            })
          }
        })
        queue = allLinks;
        total_links+=queue.length
        for(let k=0; k<queue.length; k++){
        }
      }
    }
    mainDict['total_links']=total_links
    mainDict["total_images"] = total_images
    mainDict['details']= details
  }
  return mainDict
}
const data =  scrape()
data.then((res)=>{
    console.log(res)
})
