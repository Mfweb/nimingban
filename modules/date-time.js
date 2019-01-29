import moment from 'moment'
import 'moment/locale/zh-cn';

function converDateTime(timein) {
    let timestamp = Date.parse(timein);
    let diffMs = moment().diff(timestamp);
    if(diffMs < 0) {
        return '未来';
    }
    else if(diffMs < 1*24*60*60*1000) { // 一天以内
        return moment(timestamp).fromNow();
    }
    if(moment(timestamp).format("YYYY") == moment().format("YYYY")) {
        return moment(timestamp).format("MM/DD HH:mm:ss");
    }
    return moment(timestamp).format("YYYY/MM/DD HH:mm:ss");
}

export {converDateTime}