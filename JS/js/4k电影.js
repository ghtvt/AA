var rule = {
  title: '4k电影',
  host: 'https://4kdy.vip/',
  url: '/4K-show/fyclass--------fypage---.html',
  searchUrl: '/4K-search/-------------.html?wd=**&submit=',
  searchable: 2,
  quickSearch: 0,
  filterable: 0,
  headers: {
    'User-Agent': 'MOBILE_UA',
  },
  class_parse: '.myui-header__menu li:gt(0):lt(7);a&&Text;a&&href;.*/(.*?).html',
  play_parse: true,
  lazy: "js:\n  // 提取播放配置\n  let html = request(input);\n  let playerConfig = html.match(/var player_aaaa=(.*?);/)[1];\n  let config = JSON5.parse(playerConfig);\n\n  // 处理加密逻辑\n  let url = config.url;\n\n  // 根据加密类型解密\n  if (config.encrypt == '1') {\n    url = unescape(url);\n  } else if (config.encrypt == '2') {\n    url = unescape(base64Decode(url));\n  }\n\n  // 验证 URL 是否有效\n  if (/\\.(m3u8|mp4|m4a|mp3)/.test(url)) {\n    input = {\n      parse: 0,\n      jx: 0,\n      url: url,\n      headers: {\n        'User-Agent': 'MOBILE_UA',\n        'Referer': 'https://4kdy.vip/'\n      }\n    };\n  } else {\n    // 如果 URL 不是直接可播放的，尝试解析或使用外部解析工具\n    input = url && url.startsWith('http') && tellIsJx(url) ? {parse:0,jx:1,url:url}:input;\n  }\n\n  // 解析播放信息\n  function parse() {\n    let videoInfo = {\n      title: '',\n      sources: [],\n      tracks: [],\n      headers: {\n        'User-Agent': 'MOBILE_UA',\n        'Referer': 'https://4kdy.vip/'\n      }\n    };\n\n    // 提取播放源信息\n    let sources = [];\n    if (config.from === 'bfzym3u8' || config.from === 'lzm3u8') {\n      sources.push({\n        name: config.from,\n        url: url,\n        type: 'm3u8',\n        headers: {\n          'User-Agent': 'MOBILE_UA',\n          'Referer': 'https://4kdy.vip/'\n        }\n      });\n    }\n\n    // 设置视频信息\n    videoInfo.title = '4K电影播放';\n    videoInfo.sources = sources;\n\n    return videoInfo;\n  }\n\n  // 如果需要解析，调用 parse 函数\n  if (input.parse) {\n    input = parse();\n  }",
  limit: 6,
  double: true,
  推荐: 'ul.myui-vodlist.clearfix;li;a&&title;a&&data-original;.pic-text&&Text;a&&href',
  一级: '.myui-vodlist li;a&&title;a&&data-original;.pic-text&&Text;a&&href',
  二级: {
    title: '.myui-content__detail .title--span&&Text;.myui-content__detail p.data:eq(-1)&&Text',
    img: '.myui-content__thumb .lazyload&&data-original',
    desc: '.myui-content__detail p.data:eq(1)&&Text;.myui-content__detail p.data:eq(2)&&Text;.myui-content__detail p.data:eq(0)&&a&&Text;.myui-content__detail p.data:eq(-2)&&Text;.myui-content__detail p.data:eq(4)&&Text',
    content: '.content&&Text',
    tabs: `js:
  TABS = [];
  // 提取在线播放源分类
  let playTabs = pdfa(html, '.nav.nav-tabs li:not(:last-child)');
  playTabs.forEach(it => {
    TABS.push(pdfh(it, 'a&&Text'));
  });
  // 添加磁力下载分类
  TABS.push("4K磁力");
  // 添加115网盘分类
  TABS.push("115网盘");
  // 添加百度网盘分类
  TABS.push("百度网盘");
`,
    lists: `js:
  LISTS = [];
  let magnetSet = new Set(); // 用于存储已处理的磁力链接
  let panSet = new Set(); // 用于存储已处理的百度网盘链接
  let w115Set = new Set(); // 用于存储已处理的115网盘链接
  
  // 提取在线播放源剧集
  let zxlists = pdfa(html, '.nav.nav-tabs li:not(:last-child)');
  zxlists.forEach(zx => {
    let sourceId = pdfh(zx, 'a&&href').match(/playlist(\\d+)/)[1];
    let list = pdfa(html, '.myui-content__list a').map(a => {
      let raw = pd(a, 'a&&href').replace(/-\\d+-/, "-"+sourceId+"-");
      return pdfh(a, 'a&&Text') + '$' + raw;
    });
    LISTS.push(list);
  });

  // 提取磁力下载链接并去重
  let magnets = pdfa(html, '.myui-down__list [href^="magnet:"]').map(it => {
    let magnetLink = pd(it, 'a&&href');
    if (!magnetSet.has(magnetLink)) {
      magnetSet.add(magnetLink);
      return pdfh(it, 'a&&Text') + '$' + magnetLink;
    }
    return null;
  }).filter(item => item !== null);
  
  LISTS.push(magnets);

  // 提取115网盘链接并去重
  let w115Links = pdfa(html, '.myui-down__list [href*="115.com"]').map(it => {
    let w115Link = pd(it, 'a&&href');
    if (!w115Set.has(w115Link)) {
      w115Set.add(w115Link);
      return pdfh(it, 'a&&Text') + '$' + w115Link;
    }
    return null;
  }).filter(item => item !== null);
  
  LISTS.push(w115Links);

  // 提取百度网盘链接并去重
  let panLinks = pdfa(html, '.myui-down__list [href*="baidu.com"]').map(it => {
    let panLink = pd(it, 'a&&href');
    if (!panSet.has(panLink)) {
      panSet.add(panLink);
      return pdfh(it, 'a&&Text') + '$' + panLink;
    }
    return null;
  }).filter(item => item !== null);
  
  LISTS.push(panLinks);
`
	},
  搜索框: '#searchList li;a&&title;.lazyload&&data-original;.pic-text&&Text;a&&href;.detail&&Text',
};