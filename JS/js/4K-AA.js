var rule = {
    类型: '影视',
    title: '4K-AV',
    host: 'https://4k-av.com',
    url: '/fyclass/page-fypage.html[/fyclass/]',
    searchUrl: '/s?q=**&page=fypage',
    searchable: 2,
    quickSearch: 0,
    headers: {
        'User-Agent': 'IOS_UA',
    },
    timeout: 5000,
    class_parse: '#cate_list&&li;a&&title;a&&href;/(\\w+)/',
    cate_exclude: '成人视频',
    play_parse: 0,
    lazy: $js.toString(() => {
        let rl = request(input).match(/<source src=\"(.*?)\"/);
        input = rl;
            
        
    }),
    double: true,
    推荐: '#recommlist;ul&&li;h2&&Text;img&&src;span&&Text;a&&href',
    一级: '#MainContent_newestlist&&.NTMitem;h2&&Text;img&&src;div.resyear&&Text;a&&href',

    二级: {
        title: 'h2&&Text;#MainContent_tags&&Text',
        img: 'img&&src',
        desc: '#MainContent_videodetail&&label&&Text;#MainContent_videodetail&&label:eq(2)&&Text;;;',
        content: '',
        tabs: `js: TABS = ['720','4K']`,
        lists: $js.toString(() => {

            LISTS = [];
            TABS.forEach((tab) => {
                let lists2 = pdfa(html, '#rtlist&&li').map(it => {
                    let _tt1 = pdfh(it, 'span&&Text');
                    let _uu1 = pd(it, 'img&&src', MY_URL).replace('screenshot.jpg', '');
                    return _tt1 + '$' + _uu1;
                });
                let lists1 = pdfa(html, 'body&&#page').map(it => {
                    let _tt = pdfh(it, 'h2&&title');
                    let _uu = pd(it, 'source&&src', MY_URL);
                    return _tt + '$' + _uu;
                });
                if (lists2.length > 0) {
                    LISTS.push(lists2);
                } else {
                    LISTS.push(lists1);
                }
            })
        }),

    },
  搜索: '#MainContent_newestlist&&.NTMitem;h2&&Text;img&&src;div.resyear&&Text;a&&href',
}
