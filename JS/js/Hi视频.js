function replaceWithCode(obj, codeMap) {
  // 特殊处理数字索引
  if (typeof obj === 'number' && obj >= 0 && obj < codeMap.length) {
    let mapped = codeMap[obj];
    return typeof mapped === 'object' ? replaceWithCode(mapped, codeMap) : mapped;
  }
  // 处理基本类型
  if (typeof obj !== 'object' || obj === null) {
    return codeMap[obj] !== undefined ? codeMap[obj] : obj;
  }
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => replaceWithCode(item, codeMap));
  }
  // 处理对象
  let result = {};
  for (let [key, value] of Object.entries(obj)) {
    result[key] = replaceWithCode(value, codeMap);
  }
  return result;
}

globalThis.replaceWithCode = replaceWithCode;

var rule = {
  title: 'Hi视频',
  host: 'https://www.hitvhd.com/',
  class_name: '电影&电视剧&综艺&动漫',
  class_url: '1&2&3&4',
  searchUrl: '/search/**.html',
  searchable: 2,
  quickSearch: 0,
  headers: {
    'User-Agent': 'MOBILE_UA',
  },
  url: 'https://wys.upfuhn.com/v1/ys_video_sites?t=fyclass&s_t=0&a&y&o=0&ps=21&pn=fypage',
  filterable: 0,
  filter_url: '',
  filter: {},
  filter_def: {},
  detailUrl: '/index.php/vod/detail/id/fyid.html',
  play_parse: true,
  limit: 6,
  推荐: '.hot-video li;a&&title;img&&src;.score span&&Text;a&&href',
  一级: 'json:data.data;video_name;video_vertical_url;score;video_site_id',
  detailUrl: '/play/fyid.html',
  二级: $js.toString(() => {
    VOD = {};
    let list = [];
    var html = fetch(input);
    var code = JSON.parse(jsp.pdfh(html, "#__NUXT_DATA__&&Html"));
    let nobj = replaceWithCode(code, code);
    let parr = nobj[0][1]['pinia'][1]['media']['ysVideoSeriesList'];
    let mDetail = nobj[0][1]['pinia'][1]['media']['mediaDetail'];
    //log(mDetail);
    parr.map(item => {
      list.push(item["series_num"] + "$" + item["video_url"])
    })
    VOD.vod_name = mDetail["video_name"];
    VOD.vod_pic = mDetail["video_vertical_url"];
    VOD.type_name = mDetail["tag"];
    VOD.vod_remarks = mDetail["newest_series_num"];
    VOD.vod_year = mDetail["years"];
    VOD.vod_area = mDetail["area"];
    VOD.vod_director = mDetail["director"];
    VOD.vod_actor = mDetail["main_actor"];
    VOD.vod_content = mDetail["video_desc"];
    VOD.vod_play_from = ["Hi视频"].join("$$$");
    VOD.vod_play_url = list.join("#");
  }),
  搜索: '.grid&&li;a&&title;img&&src;.score span&&Text;a&&href',
}