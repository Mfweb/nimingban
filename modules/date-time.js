import moment from 'moment'
import { UISetting } from './config'
import 'moment/locale/zh-cn';

function converDateTime(timein) {
    if(UISetting.timeFormat == 1) { // 原始格式
        return timein;
    }
    timein = timein.replace(/\([\s\S]*?\)/ig, ' ');
    timestamp = moment(timein, 'YYYY-MM-DD HH:mm:ss')
    if(UISetting.timeFormat == 2) { // 绝对时间
        return moment(timestamp).format("YYYY/MM/DD HH:mm:ss");
    }
    if(UISetting.timeFormat == 3) { // 简化时间
        return moment(timestamp).format("YY/MM/DD HH:mm");
    }
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