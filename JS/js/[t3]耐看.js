function decryptData(encryptedHex, rawKeyArray, ivArray) {
    // 将原始密钥数组转换为 WordArray 类型
    const rawKey = CryptoJS.lib.WordArray.create(new Uint8Array(rawKeyArray));
    // 将初始化向量数组转换为 WordArray 类型
    const iv = CryptoJS.lib.WordArray.create(new Uint8Array(ivArray));
    // 将十六进制加密数据转换为 WordArray 类型
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);

    const modes = [
        { name: 'CBC', mode: CryptoJS.mode.CBC },
        { name: 'OFB', mode: CryptoJS.mode.OFB },
        { name: 'CTR', mode: CryptoJS.mode.CTR },
        { name: 'ECB', mode: CryptoJS.mode.ECB },
        { name: 'CFB', mode: CryptoJS.mode.CFB }
    ];

    for (let modeInfo of modes) {
        try {
            let decryptionOptions = {
                mode: modeInfo.mode,
                padding: CryptoJS.pad.Pkcs7
            };

            if (modeInfo.name!== 'ECB') {
                decryptionOptions.iv = iv;
            }

            const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, rawKey, decryptionOptions);
            const result = decrypted.toString(CryptoJS.enc.Utf8);

            if (result) {
                console.log(`使用 ${modeInfo.name} 模式解密成功`);
                return result;
            }
        } catch (error) {
            console.log(`使用 ${modeInfo.name} 模式解密失败: ${error}`);
        }
    }

    console.error('所有解密模式均失败');
    return null;
}


function aesGcmDecrypt(encryptedHex, rawKeyArray, ivArray, tagArray) {
    try {
        // 将十六进制密文转换为 Buffer
        const encrypted = Buffer.from(encryptedHex, 'hex');
        // 将密钥、IV 和认证标签转换为 Buffer
        const key = Buffer.from(rawKeyArray);
        const iv = Buffer.from(ivArray);
        const tag = Buffer.from(tagArray);

        // 创建 AES-GCM 解密器
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        // 设置认证标签
        decipher.setAuthTag(tag);

        // 解密数据
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString('utf8');
    } catch (error) {
        console.error('解密失败:' + error);
        return null;
    }
}

function getrandom(url) {
    let randStr = url.substring(0, 8);
    let string = url.substring(8, url.length);
    let substr = atob(string);
    return decodeURIComponent(substr.substring(8, substr.length - 8));
}

globalThis.decryptData = decryptData;
globalThis.aesGcmDecrypt = aesGcmDecrypt;
globalThis.getrandom = getrandom;

var rule = {
    title: '耐看',
    host: 'https://nkvod.com',
    url: '/show/fyfilter.html',
    filterable: 1, //是否启用分类筛选,
    filter: "H4sIAAAAAAAAA+2Wz0rDQBCH32XPPcxs+s++ivRQJGBRK9gqSOlJK4rQgog9CHqSVhBaoRRNaZ8mm5q3cFNsfpOLFy815DbzTbLZb2cW0lasKrttdeCeq4pavc/N063KqUbtyJX5We3w1F0/2LDYdEfhxSjCNmHVqXZymxXM59SfL7BCnP+ygopej6gmnf9h61BwB9yRXINryRmcJSdwEpx3Ym5DwcvgZclL4CXJi+BFyQvgBcnhy9KX4cvSl+HL0pfhy9KX4WtD2aigd2e8PhoV58lGBYNZOJiiaFGrbl/YfML3vGByn6jv11vNuP41vjTXV4l6c+/4xI32Us0p/cfhwxmYx4XvDc3NcDOWOLbgY2z6E1HCSQeDl/D5VZTQnOBtuFr2RAn9NN2ZP39ASVN2B/7NHYg5wZekL8GXpC/Bi6QXwYukF8HLhtt39xxx97KRTefIwpdKKR7lfDbK2SinY5S1/B/fhi11vgFV7DDnIwwAAA==",
    filter_url: "{{fl.类型}}--{{fl.排序}}------fypage---{{fl.年份}}",
    filter_def: {
     1: {
      类型: "1"
     },
     2: {
      类型: "2"
     },
     3: {
      类型: "3"
     },
     4: {
      类型: "4"
     },
     21: {
      类型: "21"
     }
    },
    searchUrl: '/rss.xml?wd=**',
    headers: {
        'User-Agent': 'PC_UA',
    },
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    class_name:'电影&电视剧&动漫&综艺',
    class_url:'1&2&3&4',
    limit: 6,
    double: false,
    play_parse: true,
    lazy: $js.toString(() => {
      let html = JSON.parse(request(input).match(/r player_.*?=(.*?)</)[1]);
      let url = html.url;
      if (/m3u8|mp4/.test(url)) {
          input = {jx: 0, url: url, parse: 0}
      } else {
          let Config = {};
          let jscode = request(HOST + '/static/js/playerconfig.js');
          eval(jscode + '\nConfig=MacPlayerConfig');
          let jx = Config.player_list[html.from].parse;
          if (jx == '') {
              jx = Config.parse;
          }
          log("jx>>>>>" + jx);
          try {
              let jxhtml = request(jx + url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'referer': 'https://nkvod.com/',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
                    }
              });
              // console.log('jxhtml:' + jxhtml);

              let tag, encrypted, raw_key, iv;

              const tagMatch = jxhtml.match(/var\s+tag\s*=\s*.*?\[([^\]]*)\]/);
              if (tagMatch) {
                  tag = tagMatch[1];
                  tag = JSON.parse(`[${tag}]`);
              } else {
                  tag = null;
              }
              console.log("tag:" + tag);

              // 匹配 encrypted 变量
              const encryptedMatch = jxhtml.match(/var\s+encrypted\s*=\s*"(.*?)"/);
              if (encryptedMatch) {
                  encrypted = encryptedMatch[1];
              } else {
                  encrypted = null;
              }
              console.log("encrypted:" + encrypted);

              // 匹配 raw_key 变量
              const rawKeyMatch = jxhtml.match(/var\s+raw_key\s*=\s*.*?\[([^\]]*)\]/);
              if (rawKeyMatch) {
                  raw_key = rawKeyMatch[1];
                  raw_key = JSON.parse(`[${raw_key}]`);
              } else {
                  raw_key = null;
              }
              console.log("raw_key:" + raw_key);

              // 匹配 iv 变量
              const ivMatch = jxhtml.match(/var\s+iv\s*=\s*.*?\[([^\]]*)\]/);
              if (ivMatch) {
                  iv = ivMatch[1];
                  iv = JSON.parse(`[${iv}]`);
              } else {
                  iv = null;
              }
              console.log("iv:" + iv);

              let decryptedText;
              if (!tag) {
                  console.log('正在使用随机解密');
                  decryptedText = decryptData(encrypted, raw_key, iv);
              } else {
                  console.log('drpy2不支持GCM解密,将进入嗅探');
                  input = {jx: 1, url: input, parse: 1}
                 //  decryptedText = aesGcmDecrypt(encrypted, raw_key, iv, tag);
              }

              if (decryptedText) {
                  console.log('解密成功:' + decryptedText);
              } else {
                  console.log('解密失败');
              }

              let match = decryptedText.match(/getrandom\('(.*?)'\)/)[1];
              console.log('待解密的url:' + match);
              let playurl = getrandom(match);
              console.log('解密的url:' + playurl);
              input = {jx: 0, url: playurl, parse: 0}
          } catch (error) {
              console.error('请求过程中出现错误:' + error);
          }
          
      }
    }),
    
    推荐: '*;*;*;*;*',
    double: true, // 推荐内容是否双层定位
    一级: 'body&&.public-list-box;a&&title;img&&data-src;.public-list-subtitle&&Text;a&&href',
   
    二级: {
     "title": "h3&&Text",
     "img": "img&&data-src",
     //更新状态;年份;地区;演员;导演
     "desc": ".slide-info:eq(2)--strong&&Text;.slide-info:eq(1)&&Text;;.slide-info:eq(4)--strong&&Text;.slide-info:eq(3)--strong&&Text",
     "content": ".cor3&&Text",
     "tabs": ".anthology-tab&&a",
     "tab_text": 'a--span&&Text',
     "lists": ".anthology-list-play:eq(#id)&&a",
     "list_text": "a&&Text",
     "list_url": "a&&href"
    },
    
    搜索:$js.toString(() => {
         let html = request(input);
         let items = pdfa(html, 'rss&&item');
         // log(items);
         let d = [];
         items.forEach(it => {
           it = it.replace(/title|link|author|pubdate|description/g, 'p');
           let url = pdfh(it, 'p:eq(1)&&Text');
           d.push({
               title: pdfh(it, 'p&&Text'),
               url: url,
               desc: pdfh(it, 'p:eq(3)&&Text'),
               content: pdfh(it, 'p:eq(2)&&Text'),
               pic_url: "",
            });
          });
          setResult(d);
    }),
}