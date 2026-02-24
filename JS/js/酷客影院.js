import { Crypto, load } from 'assets://js/lib/cat.js';

let HOST = "http://www.dy2055.com";
let siteKey = "", siteType = "", sourceKey = "", ext = "";
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    sourceKey = cfg.sourceKey;
    ext = cfg.ext;
    if (ext && ext.indexOf('http') === 0) {
        HOST = ext;
    }
}

async function home(filter) {
    const classes = [
        { type_id: "1", type_name: "电影" },
        { type_id: "2", type_name: "电视剧" },
        { type_id: "3", type_name: "综艺" },
        { type_id: "4", type_name: "动漫" }
    ];
    return JSON.stringify({ class: classes });
}

async function homeVod() {
    const url = HOST + '/';
    let html = '';
    try {
        const res = await req(url, { headers: { 'User-Agent': UA } });
        html = res.content;
    } catch (error) {
        return JSON.stringify({ list: [] });
    }
    if (!html) return JSON.stringify({ list: [] });
    
    const $ = load(html);
    const list = [];
    
    $('ul.stui-vodlist li').each((index, item) => {
        const $item = $(item);
        const $thumb = $item.find('a.stui-vodlist__thumb');
        const href = $thumb.attr('href') || '';
        const idMatch = href.match(/\/edu-(\d+)\.html/);
        if (!idMatch) return;
        
        const vod = {
            vod_id: idMatch[1],
            vod_name: $thumb.attr('title') || $item.find('h4.title a').text().trim(),
            vod_pic: $thumb.attr('data-original') || $thumb.attr('src') || '',
            vod_remarks: $item.find('span.pic-text.text-right').text().trim() || ''
        };
        
        if (vod.vod_pic && !vod.vod_pic.startsWith('http')) {
            vod.vod_pic = HOST + vod.vod_pic;
        }
        
        list.push(vod);
    });
    
    return JSON.stringify({
        list: list.slice(0, 20),
        page: 1,
        pagecount: 1,
        limit: list.length,
        total: list.length
    });
}

async function category(tid, pg, filter, extend) {
    const url = `${HOST}/list/${tid}_${pg}.html`;
    
    let html = '';
    try {
        const res = await req(url, { headers: { 'User-Agent': UA } });
        html = res.content;
    } catch (error) {
        return JSON.stringify({ list: [] });
    }
    
    if (!html) return JSON.stringify({ list: [] });
    
    const $ = load(html);
    const list = [];
    
    $('ul.stui-vodlist li').each((index, item) => {
        const $item = $(item);
        const $thumb = $item.find('a.stui-vodlist__thumb');
        const href = $thumb.attr('href') || '';
        const idMatch = href.match(/\/edu-(\d+)\.html/);
        if (!idMatch) return;
        
        const vod = {
            vod_id: idMatch[1],
            vod_name: $thumb.attr('title') || $item.find('h4.title a').text().trim(),
            vod_pic: $thumb.attr('data-original') || '',
            vod_remarks: $item.find('span.pic-text.text-right').text().trim() || ''
        };
        
        if (vod.vod_pic && !vod.vod_pic.startsWith('http')) {
            vod.vod_pic = HOST + vod.vod_pic;
        }
        
        list.push(vod);
    });
    
    return JSON.stringify({
        list: list,
        page: parseInt(pg) || 1,
        pagecount: 100,
        limit: list.length,
        total: list.length * 100
    });
}

async function detail(id) {
    const url = `${HOST}/edu-${id}.html`;
    let html = '';
    try {
        const res = await req(url, { headers: { 'User-Agent': UA } });
        html = res.content;
    } catch (error) {
        return JSON.stringify({ list: [], message: '详情解析失败: 请求失败' });
    }
    
    if (!html) return JSON.stringify({ list: [], message: '详情解析失败: HTML为空' });
    
    const $ = load(html);
    const vod = {
        vod_id: id,
        vod_name: '',
        vod_pic: '',
        vod_remarks: '',
        vod_actor: '',
        vod_director: '',
        vod_class: '',
        vod_year: '',
        vod_area: '',
        vod_content: '',
        vod_play_from: '',
        vod_play_url: ''
    };
    
    vod.vod_name = $('h1.line1').text().trim();
    if (!vod.vod_name) {
        vod.vod_name = $('title').text().split('-')[0].trim();
    }
    
    const $thumbImg = $('.stui-content__thumb img.lazyload');
    vod.vod_pic = $thumbImg.attr('data-original') || $thumbImg.attr('src') || '';
    if (vod.vod_pic && !vod.vod_pic.startsWith('http')) {
        vod.vod_pic = HOST + vod.vod_pic;
    }
    
    vod.vod_remarks = $('.stui-content__thumb .pic-text.text-right').text().trim() || '';
    
    const actors = [];
    $('p.line1 a[href*="/actor.php"]').each((i, el) => {
        actors.push($(el).text().trim());
    });
    if (actors.length === 0) {
        const actorText = $('p.line1').text().replace('主演：', '').trim();
        if (actorText) {
            actors.push(actorText);
        }
    }
    vod.vod_actor = actors.join('/') || '未知';
    
    const directors = [];
    $('p.data a[href*="/director.php"]').each((i, el) => {
        directors.push($(el).text().trim());
    });
    if (directors.length === 0) {
        const directorText = $('p.data:contains("导演")').text().replace('导演：', '').trim();
        if (directorText) {
            directors.push(directorText);
        }
    }
    vod.vod_director = directors.join('/') || '未知';
    
    $('p.data').each((i, p) => {
        const text = $(p).text();
        if (text.includes('类型')) {
            const typeLink = $(p).find('a[href*="/list/"]');
            if (typeLink.length) {
                vod.vod_class = typeLink.text().trim();
            } else {
                vod.vod_class = text.replace('类型：', '').split(' ')[0].trim();
            }
        } else if (text.includes('地区')) {
            const areaLink = $(p).find('a[href*="/area.php"]');
            if (areaLink.length) {
                vod.vod_area = areaLink.text().trim();
            } else {
                vod.vod_area = text.replace('地区：', '').split(' ')[0].trim();
            }
        } else if (text.includes('年份')) {
            const yearLink = $(p).find('a[href*="/year.php"]');
            if (yearLink.length) {
                vod.vod_year = yearLink.text().trim();
            } else {
                vod.vod_year = text.replace('年份：', '').split(' ')[0].trim();
            }
        }
    });
    
    vod.vod_content = $('#desc .col-pd').text().trim().replace(/\s+/g, ' ') || '暂无简介';
    
    const playFrom = [];
    const playUrl = [];
    
    const sourceTabs = $('.stui-pannel__head .nav.nav-tabs li a');
    sourceTabs.each((index, tab) => {
        const sourceName = $(tab).text().trim();
        if (!sourceName) return;
        
        const targetId = $(tab).attr('href');
        const $container = $(targetId);
        if ($container.length === 0) return;
        
        const episodes = [];
        $container.find('ul.stui-content__playlist li a').each((i, a) => {
            const $a = $(a);
            const epName = $a.text().trim();
            const epHref = $a.attr('href');
            if (epName && epHref && !epName.includes('观看更多')) {
                const fullUrl = epHref.startsWith('http') ? epHref : HOST + epHref;
                episodes.push(`${epName}$${fullUrl}`);
            }
        });
        
        if (episodes.length > 0) {
            playFrom.push(sourceName);
            playUrl.push(episodes.join('#'));
        }
    });
    
    if (playFrom.length === 0) {
        const playBtn = $('a.btn-primary[href*="/gov-"]');
        if (playBtn.length > 0) {
            const href = playBtn.attr('href');
            if (href) {
                playFrom.push('默认线路');
                playUrl.push(`播放$${href.startsWith('http') ? href : HOST + href}`);
            }
        }
    }
    
    if (playFrom.length > 0) {
        vod.vod_play_from = playFrom.join('$$$');
        vod.vod_play_url = playUrl.join('$$$');
    }
    
    return JSON.stringify({ list: [vod] });
}

async function search(wd, quick, pg = "1") {
    const url = `${HOST}/search.php`;
    const body = `searchword=${encodeURIComponent(wd)}`;
    
    let html = '';
    try {
        const res = await req(url, {
            method: 'POST',
            headers: {
                'User-Agent': UA,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });
        html = res.content;
    } catch (error) {
        return JSON.stringify({ list: [] });
    }
    
    if (!html) return JSON.stringify({ list: [] });
    
    const $ = load(html);
    const list = [];
    
    $('ul.stui-vodlist__media li').each((index, item) => {
        const $item = $(item);
        const $thumb = $item.find('a.stui-vodlist__thumb');
        const href = $thumb.attr('href') || '';
        const idMatch = href.match(/\/edu-(\d+)\.html/);
        if (!idMatch) return;
        
        const vod = {
            vod_id: idMatch[1],
            vod_name: $item.find('h3.title a').text().trim() || $thumb.attr('title'),
            vod_pic: $thumb.attr('data-original') || '',
            vod_remarks: $thumb.find('.pic-text').text().trim() || ''
        };
        
        if (vod.vod_pic && !vod.vod_pic.startsWith('http')) {
            vod.vod_pic = HOST + vod.vod_pic;
        }
        
        list.push(vod);
    });
    
    return JSON.stringify({ list: list, page: pg });
}

async function play(flag, id, flags) {
    const playPageUrl = id.startsWith('http') ? id : HOST + id;
    try {
        const res = await req(playPageUrl, { headers: { 'User-Agent': UA } });
        const html = res.content;
        const $ = load(html);
        let iframeSrc = $('#playbox iframe').attr('src');
        if (!iframeSrc) throw new Error('未找到iframe');

        let iframeRes = await req(iframeSrc, { 
            headers: { 'User-Agent': UA, 'Referer': HOST },
            followRedirect: false 
        });

        if (iframeRes.status === 302 && iframeRes.headers && iframeRes.headers.location) {
            let location = iframeRes.headers.location;
            if (!location.startsWith('http')) {
                const base = iframeSrc.split('/').slice(0, 3).join('/');
                location = base + (location.startsWith('/') ? location : '/' + location);
            }
            iframeRes = await req(location, { headers: { 'User-Agent': UA, 'Referer': HOST } });
        }

        const iframeHtml = iframeRes.content;

        const m3u8Match = 
            iframeHtml.match(/src=["']([^"']+\.m3u8[^"']*)["']/i) ||
            iframeHtml.match(/loadSource\s*\(\s*["']([^"']+\.m3u8[^"']*)["']\s*\)/i) ||
            iframeHtml.match(/(https?:\/\/[^"'\s<]+\.m3u8[^"'\s<]*)/i);

        if (m3u8Match && m3u8Match[1]) {
            return JSON.stringify({ parse: 0, url: m3u8Match[1] });
        }

        throw new Error('未提取到m3u8地址');
    } catch (error) {
        return JSON.stringify({ parse: 0, url: playPageUrl });
    }
}

export function __jsEvalReturn() {
    return {
        init: init,
        detail: detail,
        home: home,
        play: play,
        homeVod: homeVod,
        category: category,
        search: search
    };
}