const AirtableAPI = {
  apiKey: "",
  base: "",
  url: "https://api.airtable.com/v0/",
  init: function ({ apiKey, base }) {
    this.apiKey = apiKey;
    this.base = base;
    //const records = await this.fetch("Link");
    return this
  },
  fetch: async function (table) {
    if (this.apiKey && this.base && table) {
      const endpoint = `${this.url}${this.base}/${table}?api_key=${this.apiKey}`;
      //console.log(endpoint);
      const res = await fetch(endpoint, {});
      const rj = await res.json();
      //console.log("response", rj);
      return rj.records
    } else return null;
  },
}


const BookmarksAPI = {
  records:[],
  tagNames:[],
  categoryNames:[],
  tags:{},
  categories:{},
  colors:[
    {color:"rgb(0, 178, 144)", bg:"rgba(0, 178, 144, 0.1)"},
    {color:"rgb(81, 73, 230)", bg:"rgba(81, 73, 230, 0.2)"},
    {color:"rgba(128, 78, 247, 1)", bg:"rgba(128, 78, 247,0.35)"},
    {color:"rgba(251, 45, 45,  1)", bg:"rgba(251, 45, 45, 0.15)"},
    {color:"rgba(243, 167, 46, 1)", bg:"rgba(243, 167, 46,0.1)"}
  ],

  state:"All",
  actives:[],

  createLayout:function(){
    const app = document.getElementById("app");
    app.style.padding = "64px"
    const menu = document.createElement("div")
    menu.id = "tag-box"
    menu.classList.add("tag-box")
    menu.style.display = "flex"
    menu.style.width = "100%";
    menu.style.flexWrap = "wrap"
    menu.style.backgroundColor = "#f0f0f0"
    menu.style.padding = "16px";
    menu.style.margin = "64px 0 64px 0"
    menu.style.boxShadow = "0 4px 8px rgba(0,0,0, 0.15)"
    menu.style.alignItems = "center"

    const gridBox = document.createElement("div")
    gridBox.id = "grid-box"
    const styleEl = document.createElement("style")
    styleEl.innerHTML = `
      body {font-family:Helvetica}
      .tag-select {
        box-sizing:border-box;
        font-family:Helvetica;
        font-weight:bold;
        opacity:1;
        transition:
        .2s ease-in-out transform,
        .2s ease-in-out box-shadow;
        box-shadow:
          0px -8px 28px 0 rgba(34, 33, 81, 0.03),
          8px 8px 8px 0 rgba(34, 33, 81, 0.10);
      }
      .tag-select:hover {
        transform:translate3d(0px, -4px, 0px);
        opacity:1;
        box-shadow:
          -1px 0 28px 0 rgba(34, 33, 81, 0.01),
          18px 18px 8px -10px rgba(34, 33, 81, 0.1);
      }
    `

    //Append to DOM
    app.appendChild(styleEl);
    app.appendChild(menu);

  },
  updateMenu: function(){
    const menu = document.getElementById("tag-box");
    // Fill menu
    //console.log("updatemenu: ", BookmarksAPI)
    if (BookmarksAPI.tagNames && BookmarksAPI.tagNames.length > 0){
      BookmarksAPI.tagNames.forEach((tagname, i) => {
        const tagEl = document.createElement("div");
        tagEl.innerText = tagname;
        const tagSlug = BookmarksAPI.slugify(tagname)
        tagEl.classList.add("tag-select")
        tagEl.dataset.name = tagname
        tagEl.dataset.slug = tagSlug

        tagEl.style.padding = "4px 16px"
        tagEl.style.margin = "8px";
        tagEl.style.borderRadius = "6px"
        tagEl.style.textShadow = "1px 1px 1px rgba(0,0,0,0.05)"
        tagEl.style.fontSize = "18px"
        tagEl.style.cursor = "pointer"
        tagEl.style.backgroundColor = BookmarksAPI.colors[i].color
        tagEl.style.color = "white"

        //tagEl.style.color = BookmarksAPI.colors[i].color
        //tagEl.style.border = `1px solid ${BookmarksAPI.colors[i].color}`
        tagEl.addEventListener("click", function(){
          //console.log("tagEL: ", BookmarksAPI.slugify(BookmarksAPI.state))
          if (BookmarksAPI.slugify(BookmarksAPI.state) !== tagEl.dataset.name){
            BookmarksAPI.state = tagname
            BookmarksAPI.update()
          }})
        menu.appendChild(tagEl)
      })
    }
  },
  update:function(){
    //console.log("update: ", this)
    const gridBox = document.getElementById("grid-box");
    gridBox.innerHTML =``;
    if (gridBox) {
      if (this.state === "All"){
        this.records.forEach(r => r && gridBox.appendChild(this.createRecordEl(r)))
      }
      else {
        this.tags[this.state].forEach(r => r && gridBox.appendChild(this.createRecordEl(r)))
      }
    }
  },
  slugify:function(name){
    return name.toLowerCase().replace(" ", "-")
  },

  createRecordEl:function(rec){
    const box = document.createElement("div")
    box.classList.add("col-lg-4 mb-4")
    box.innerHTML = `
      <div class="row">
        <div class="col-md-12">
          <img src="${rec.fields.ImageUrl}" alt="wrapkit" class="img-fluid" />
        </div>
        <div class="col-md-12">
          <div class="pt-2">
            <h5 class="mt-4 font-weight-medium mb-0">
              <a rel="nofollow noopener" target="_blank" href="${rec.fields.URL}">${rec.fields.Title}</a>
            </h5>
            <h6 class="subtitle">Property Specialist</h6>
            <p>${rec.fields.Bilgi}</p>
            <a rel="nofollow noopener" target="_blank" class="mt-4" href="${rec.fields.URL}">VISIT</a>
          </div>
        </div>
      </div>
    `
    return box
  },

  postFetch: function(){
      //Tags
      const tagNames = [...new Set(BookmarksAPI.records.filter(r => r.fields.Tag).map(r => r.fields.Tag ))];
      //console.log("post", tagNames, BookmarksAPI)
      const tags = tagNames.forEach(tn => {
          //console.log("tagname: ", tn)
          const tagrecord = BookmarksAPI.records.filter(r => r.fields.Tag === tn)
          //console.log("tagrecs", tagrecord)
          BookmarksAPI.tags[tn] = tagrecord
          //BookmarksAPI.tags[t] = tagrecord
          return tagrecord
      } )
      BookmarksAPI.tagNames = tagNames;
      //BookmarksAPI.tags.All = records;
      //Categories
      const categoryNames = [...new Set(BookmarksAPI.records.filter(r => r.fields.Category).map(r => r.fields.Category ))];
      const categories = categoryNames.forEach(cn => {
        //console.log("tagname: ", cn)
        const tagrecord = BookmarksAPI.records.filter(r => r.fields.Tag === cn)
        //console.log("tagrecs", tagrecord)
        BookmarksAPI.categories[cn] = tagrecord
        //BookmarksAPI.tags[t] = tagrecord
        return tagrecord
    } )
      BookmarksAPI.categoryNames = categoryNames;
  }

};


(async function(){

  AirtableAPI.init({apiKey:"keym6ehWNZnQzpS4m" , base:"appq9CwhpYOjOv4tQ"})

  const data = await AirtableAPI.fetch("Link")
  const records = data
  //console.log("fetcher: ", records)
  if (records && records.length > 0){
    BookmarksAPI.records = records;
    BookmarksAPI.postFetch()
    BookmarksAPI.createLayout()
    BookmarksAPI.updateMenu()
    BookmarksAPI.update()
  }
//Bookmarks.fetchTags()
window.Bookmarks = BookmarksAPI

})()