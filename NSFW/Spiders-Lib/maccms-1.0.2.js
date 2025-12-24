// let option ={
//     playerContent: {
//         defaultResult: {
//             class: [{
//                 type_id: 6,
//                 type_name: "短剧"
//             }]
//         }
//     }
// }
var MacCmsGMSpiderTool = {
    formatImgUrl: function (url, configPicUserAgent, customBaseUrl) {
        if (!url.startsWith("http")) {
            if (customBaseUrl) {
                url = customBaseUrl + url;
            } else {
                url = window.location.origin + url;
            }
        }
        if (configPicUserAgent) {
            url = url + "@User-Agent=" + window.navigator.userAgent;
        }
        return url;
    }
}
var MacCmsGMSpider = function (options) {
    const categoryFilterCachePrefix = "category_";

    function getVodList() {
        if (options?.getVodList) {
            return options.getVodList();
        }
        let vodList = [];
        $("a.module-item").each(function () {
            vodList.push({
                vod_id: $(this).attr("href"),
                vod_name: $(this).find(".module-poster-item-title").text().trim(),
                vod_pic: MacCmsGMSpiderTool.formatImgUrl($(this).find(".module-item-pic img").data("original"), options?.configPicUserAgent),
                vod_remarks: $(this).find(".module-item-douban").text().trim(),
                vod_year: $(this).find(".module-item-note").text().trim()
            })
        });
        return vodList;
    }

    function getSearchVodList() {
        let vodList = [];
        $(".module-card-item").each(function () {
            vodList.push({
                vod_id: $(this).find(".module-card-item-poster").attr("href"),
                vod_name: $(this).find(".module-card-item-title").text().trim(),
                vod_pic: MacCmsGMSpiderTool.formatImgUrl($(this).find(".module-item-pic img").data("original"), options?.configPicUserAgent),
                vod_remarks: $(this).find(".module-item-douban").text().trim(),
                vod_year: $(this).find(".module-item-note").text().trim()
            })
        });
        return vodList;
    }

    function getPageCount(currentPage) {
        if (options?.pageCountStyle) {
            return $(options?.pageCountStyle).length > 0 ? currentPage + 1 : currentPage;
        } else {
            return $("#page").find(".page-link:last").attr("href")?.split(/[/.]/).at(2).split("-").at(8) || 1;
        }
    }

    function cacheCategoryFilter(tid) {
        let filters;
        if (options?.getCategoryFilter) {
            filters = options.getCategoryFilter();
        } else {
            filters = getCategoryFilter();
        }
        localStorage.setItem(categoryFilterCachePrefix + tid, JSON.stringify(filters));
    }

    function getCategoryFilter() {
        const filters = [];
        $(".module-class-item").each(function () {
            const filter = {
                key: "",
                name: $(this).find(".module-item-title").text().trim(),
                value: []
            }
            $(this).find(".module-item-box a").each(function () {
                const params = $(this).attr("href").split(/[/.]/).at(2).split("-").slice(1);
                filter.key = "index" + params.findIndex((element) => element.length > 0)
                filter.value.push({
                    n: $(this).text().trim(),
                    v: params.find((element) => element.length > 0) || ""
                })
            })
            filters.push(filter);
        })
        return filters;
    }

    return {
        homeContent: function (filter) {
            const option = options.homeContent;
            let result = Object.assign({
                class: [],
                filters: {},
                list: []
            }, option?.defaultResult || {});
            $(option.category.select).slice(...option.category.slice).each(function () {
                let categoryHref = $(this).find("a").attr("href");
                if (categoryHref.startsWith("http")) {
                    if (categoryHref.startsWith(window.location.origin)) {
                        categoryHref = categoryHref.substring(window.location.origin.length);
                    } else {
                        return true;
                    }
                }
                const categoryId = categoryHref.split(/[/.]/).at(2);
                result.class.push({
                    type_id: categoryId,
                    type_name: $(this).find("a").text().trim()
                });
            })
            result.class.forEach(function (item) {
                const cacheFilter = localStorage.getItem(categoryFilterCachePrefix + item.type_id);
                if (typeof cacheFilter !== "undefined" && cacheFilter !== null) {
                    result.filters[item.type_id] = JSON.parse(cacheFilter);
                }
            })
            result.list = getVodList();
            return result;
        },
        categoryContent: function (tid, pg, filter, extend) {
            let result = {
                list: [],
                pagecount: getPageCount(pg)
            };
            cacheCategoryFilter(tid);
            result.list = getVodList();
            return result;
        },
        detailContent: function (ids) {
            if (options?.detailContent?.customFunction) {
                return options.detailContent.customFunction(ids);
            }
            let items = {};
            $(".module-info-item").each(function () {
                items[$(this).find(".module-info-item-title").text().trim().replace("：", "")] = $(this).find(".module-info-item-content").text().trim();
            });
            let vodPlayData = [];
            $("#y-playList .module-tab-item").each(function (i) {
                let media = [];
                $(`.module-play-list:eq(${i}) .module-play-list-link`).each(function () {
                    media.push({
                        name: $(this).text().trim(),
                        type: "webview",
                        ext: {
                            replace: {
                                playUrl: $(this).attr("href"),
                            }
                        }
                    });
                })
                vodPlayData.push({
                    from: $(this).data("dropdown-value"),
                    media: media
                })
            })

            return vod = {
                vod_id: ids[0],
                vod_name: $(".module-info-heading h1").text().trim(),
                vod_pic: MacCmsGMSpiderTool.formatImgUrl($(".module-info-poster .module-item-pic img").data("original"),options?.configPicUserAgent),
                vod_remarks: items?.["更新"] || "",
                vod_director: items?.["导演"] || "",
                vod_actor: items?.["主演"] || "",
                vod_content: $(".module-info-introduction-content").text().trim(),
                vod_play_data: vodPlayData
            };
        },
        playerContent: function (flag, id, vipFlags) {
            if (options?.playerContent?.OkPlayer) {
                if ($("#playleft iframe").contents()[0].readyState === 'complete') {
                    $("#playleft iframe").contents().find("#start").click();
                } else {
                    $('#playleft iframe').on("load", function () {
                        $("#playleft iframe").contents().ready(function () {
                            $("#playleft iframe").contents().find("#start").click();
                        })
                    });
                }
            }
            return {
                type: "match"
            };
        },
        searchContent: function (key, quick, pg) {
            const result = {
                list: [],
                pagecount: getPageCount(pg)
            };
            result.list = getSearchVodList();
            return result;
        }
    };
}