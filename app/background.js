'use strict';

let flagString = 'fromExtension=true';

let callback = function (details) {
    if (locateCoursePdfFromUrl(details)) {
        let responseHeaders = details.responseHeaders;

        // responseHeaders由数组转换为map
        let responseHeaderMap = responseHeaders.reduce(function (map, i) {
            map[i.name] = i.value;

            return map;
        });

        // 如果Content-Type为application/pdf
        if (responseHeaderMap['Content-Type'] == 'application/pdf') {
            // 如果url包含插件的触发标识
            if (details.url.indexOf('?' + flagString) != -1
                || details.url.indexOf('&' + flagString) != -1) {
                return;
            }

            let filename = getFilename(details.url);

            let url = addFlagToUrl(details.url);

            let options = {
                url: url,
                filename: filename
            };

            // console.log(url);

            // 进行下载
            chrome.downloads.download(options, null);
        }
    }
};

// 根据url判断是否是学习文档的地址
function locateCoursePdfFromUrl(details) {
    let urlToLowerCase = details.url.toLowerCase();

    return urlToLowerCase.indexOf('huawei') != -1
        && urlToLowerCase.indexOf('courseware') != -1;
}

// 获取文件名
function getFilename(url) {
    // 获取url中的文件名
    let fileId = url.substring(url.lastIndexOf('/') + 1, url.indexOf('?'));

    // 去掉文件名前33个字符，即'uuid'与'_'
    let filename = fileId.substring(33);

    return decodeURIComponent(filename);
}

// 对url增加标识，用于区分触发下载的来源
// 因为针对所有url监听webRequest，下载也会产生新的webRequest
// 如果url中有此标志，则跳过解析与下载的步骤，避免循环
function addFlagToUrl(url) {
    return url + (url.indexOf('?') == -1 ? '?' : '&') + flagString;
}

let filter = {urls: ["*://*/*"]};

let opt_extraInfoSpec = ["responseHeaders"];

chrome.webRequest.onCompleted.addListener(
    callback, filter, opt_extraInfoSpec);
