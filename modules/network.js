const apiBaseURL = 'https://adnmb1.com';

const apiURLs = {
    getForumList: apiBaseURL + '/Api/getForumList?appid=PinkAdao',
    getForumThread: apiBaseURL + '/Api/showf?appid=PinkAdao',
    getImageCDN: apiBaseURL + '/Api/getCdnPath?appid=PinkAdao'
};


async function getForumList(fid, page) {
    let response = await fetch(apiURLs.getForumThread, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'HavfunClient-WeChatAPP'
        },
        body: 'id=' + fid + '&page=' + page
    });
    let res = await response.text();
    try {
        let resJSON = JSON.parse(res);
        return { status: 'ok', res: resJSON };
    } catch (error) {
        return { status: 'error', errmsg: error };
    }
}

function getImageCDN() {
    return 'https://nmbimg.fastmirror.org/'
}

export { getForumList, getImageCDN};