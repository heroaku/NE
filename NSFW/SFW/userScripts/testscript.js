// ==UserScript==
// @name         maccms-mxonepro
// @namespace    gmspider
// @version      2025.1.11
// @description  maccms GMSpider
// @author       Luomo
// @match        *://*/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.slim.min.js
// @require      https://cdn.jsdelivr.net/gh/CatVodSpider-GM/SFW-Spiders@main/Spiders-Lib/maccms-1.0.2.js
// @grant        unsafeWindow
// ==/UserScript==

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
    
    // 分析网站结构后的优化配置
    const GmSpider = MacCmsGMSpider({
        configPicUserAgent: true,
        
        // 首页内容配置
        homeContent: {
            category: {
                // 根据网站实际结构调整选择器
                select: ".navbar-item, .nav-item, .menu-item",
                // 可能需要排除非影视分类的导航项
                exclude: ":has(.fas), :has(.fa)",
                // 或者更精确的选择器
                slice: [0, 8] // 调整切片范围以获取正确的分类数量
            }
        },
        
        // 分类页面配置（如果需要）
        categoryContent: {
            list: {
                select: ".video-item, .movie-item, .post-item",
                elements: {
                    title: ".title, .name",
                    pic: "img",
                    desc: ".desc, .info",
                    url: "a"
                }
            }
        },
        
        // 详情页面配置（如果需要）
        detailContent: {
            detail: {
                title: ".detail-title, h1",
                pic: ".detail-poster img, .poster img",
                desc: ".detail-desc, .description",
                category: ".detail-category, .category a",
                area: ".detail-area, .area",
                year: ".detail-year, .year",
                director: ".detail-director, .director",
                actor: ".detail-actor, .actors"
            },
            playList: {
                select: ".play-list, .episode-list",
                elements: {
                    title: ".play-title, .episode-title",
                    url: "a"
                }
            }
        },
        
        // 搜索配置（如果需要）
        searchContent: {
            list: {
                select: ".search-result-item, .video-item",
                elements: {
                    title: ".title, .name",
                    pic: "img",
                    desc: ".desc, .info",
                    url: "a"
                }
            }
        }
    });
    
    $(document).ready(function () {
        try {
            const result = GmSpider[GMSpiderArgs.fName](...GMSpiderArgs.fArgs);
            console.log("爬虫执行结果:", result);
            
            if (typeof GmSpiderInject !== 'undefined') {
                GmSpiderInject.SetSpiderResult(JSON.stringify(result));
            }
        } catch (error) {
            console.error("爬虫执行出错:", error);
            
            // 如果出错，尝试备选方案
            if (GMSpiderArgs.fName === "homeContent") {
                console.log("尝试备选方案...");
                
                // 手动提取分类信息
                const categories = [];
                $(".navbar-item, .nav-item, .menu-item").each(function(index) {
                    const text = $(this).text().trim();
                    const href = $(this).find("a").attr("href") || $(this).attr("href");
                    
                    if (text && href && index < 8) {
                        categories.push({
                            type_id: href.split("/").pop().split(".")[0] || index.toString(),
                            type_name: text
                        });
                    }
                });
                
                const result = {
                    class: categories
                };
                
                console.log("备选方案结果:", result);
                
                if (typeof GmSpiderInject !== 'undefined') {
                    GmSpiderInject.SetSpiderResult(JSON.stringify(result));
                }
            }
        }
    });
})();
