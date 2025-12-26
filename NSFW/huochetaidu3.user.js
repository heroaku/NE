// ==UserScript==
// @name         maccms-mxonepro-huochetaidu
// @namespace    gmspider
// @version      2025.1.11
// @description  maccms GMSpider for huochetaidu
// @author       Luomo
// @match        *://*/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.slim.min.js
// @require      https://cdn.jsdelivr.net/gh/CatVodSpider-GM/SFW-Spiders@main/Spiders-Lib/maccms-1.0.2.js
// @grant        unsafeWindow
// ==/UserScript==

console.log(JSON.stringify(GM_info));

(function () {
    const GMSpiderArgs = {};
    if (typeof GmSpiderInject !== 'undefined') {
        let args = JSON.parse(GmSpiderInject.GetSpiderArgs());
        GMSpiderArgs.fName = args.shift();
        GMSpiderArgs.fArgs = args;
    } else {
        GMSpiderArgs.fName = "homeContent";
        GMSpiderArgs.fArgs = [true];
    }
    Object.freeze(GMSpiderArgs);

    // 只整合spider相关的URL配置
    const GmSpider = MacCmsGMSpider({
        configPicUserAgent: true,
        homeContent: {
            category: {
                select: ".navbar-item",
                slice: [1, 6]
            },
            loadUrl: "https://www.tdgo.shop/"  // 整合到这里
        },
        categoryContent: {
            loadUrl: "https://www.tdgo.shop/vodshow/${tid}-${index0:-}-${index1:-}-${index2:-}-${index3:-}-${index4:-}-${index5:-}-${index6:-}-${pg:-1}-${index8:-}-${index9:-}-${index10:-}.html"
        },
        detailContent: {
            loadUrl: "https://www.tdgo.shop${id}"
        },
        playerContent: {
            loadUrl: "https://www.tdgo.shop${playUrl}"
        },
        searchContent: {
            loadUrl: "https://www.tdgo.shop/vodsearch/${key}----------${pg:-1}---.html"
        }
    });

    $(document).ready(function () {
        const result = GmSpider[GMSpiderArgs.fName](...GMSpiderArgs.fArgs);
        console.log(result);
        if (typeof GmSpiderInject !== 'undefined') {
            GmSpiderInject.SetSpiderResult(JSON.stringify(result));
        }
    });
})();
