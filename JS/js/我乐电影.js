var rule = {
  title: '我乐电影',
  host: 'http://www.56dy.com/',
  url: '/fyclass/list/------pfypage[/fyclass/list]',
  searchUrl: '/vodsearch/**----------fypage---.html',
  searchable: 2,
  quickSearch: 0,
  filterable: 0,
  headers: {
    'User-Agent': 'UC_UA',
  },
  class_parse: '.type-slide.clearfix li:gt(0):lt(7);a&&Text;a&&href;.*/(.*?)/',
  play_parse: true,
  lazy: "js:\n  let html = request(input);\n  let hconf = html.match(/r player_.*?=(.*?)</)[1];\n  let json = JSON5.parse(hconf);\n  let url = json.url;\n  if (json.encrypt == '1') {\n    url = unescape(url);\n  } else if (json.encrypt == '2') {\n    url = unescape(base64Decode(url));\n  }\n  if (/\\.(m3u8|mp4|m4a|mp3)/.test(url)) {\n    input = {\n      parse: 0,\n      jx: 0,\n      url: url,\n    };\n  } else {\n    input = url && url.startsWith('http') && tellIsJx(url) ? {parse:0,jx:1,url:url}:input;\n  }",
  limit: 6,
  double: true,
  推荐: 'ul.stui-vodlist.clearfix;li;a&&title;.lazyload&&data-original;.pic-text&&Text;a&&href',
  一级: '.stui-vodlist li;a&&title;a&&data-original;.pic-text&&Text;a&&href',
  二级: {
    title: '.stui-content__detail .title&&Text;.stui-content__detail&&p:eq(2)&&a&&Text',
    img: '.stui-content__thumb .lazyload&&data-original',
    desc: '.stui-content__detail p:eq(0)&&Text;.stui-content__detail p:eq(1)&&Text;.stui-content__detail p:eq(2)&&Text',
    content: '.detail&&Text',
    tabs: `js:
// 获取所有播放和下载面板
let panels = pdfa(html, '.stui-pannel__head');
let tabs = [];
panels.forEach(panel => {
    let title = pdfh(panel, 'h3.title&&Text').trim();
    let typeSpan = pdfh(panel, 'span.more&&Text');
    if (typeSpan.includes('在线播放')) {
        tabs.push('在线-' + title);
    } else if (typeSpan.includes('迅雷下载')) {
        tabs.push('下载-' + title);
    }
});
TABS = tabs;`,
    在线: `js:
// 处理在线播放
let source = pdfl(html, '.stui-pannel__head:has(span:contains(在线播放)) + .stui-content__playlist a').map(a => {
    let name = pdfh(a, 'a&&Text');
    let url = pd(a, 'a&&href');
    return name + '$' + HOST + url;
}).join('#');
input = source ? source : '';
`,
    下载: `js:
// 处理下载链接
let downSource = [];
let downloadPanels = pdfa(html, '.stui-pannel__head:has(span:contains(迅雷下载)) + .stui-content__playlist li');
downloadPanels.forEach(li => {
    let name = pdfh(li, '.filename&&Text') || pdfh(li, 'a.thunder_down&&Text');
    let url = pd(li, 'input.thunder_url&&value') || pd(li, 'a.thunder_down&&attr:href');
    if (name && url) {
        downSource.push(name + '$' + url.replace('thunder://',''));
    }
});
input = downSource.join('#');
`
  },
  搜索: 'ul.stui-vodlist__media,ul.stui-vodlist,#searchList li;a&&title;.lazyload&&data-original;.pic-text&&Text;a&&href;.detail&&Text',
}