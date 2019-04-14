import { Platform } from 'react-native';
import {
    isFirstTime,
    isRolledBack,
    packageVersion,
    currentVersion,
    checkUpdate,
    downloadUpdate,
    switchVersion,
    switchVersionLater,
    markSuccess,
} from 'react-native-update';
import { configBase } from './config';
const { appKey } = configBase.updateKey[Platform.OS];

async function pinkCheckUpdate() {
    let updateRes = await checkUpdate(appKey)
    return updateRes;
}

function pinkDoHotUpdate(info) {
    alert('已开始下载，完成后将自动重新加载。');
    downloadUpdate(info).then(hash => {
        switchVersion(hash);
    }).catch(err => { 
        alert('提示', '更新失败');
        console.error(err);
    });
}
export { pinkCheckUpdate, pinkDoHotUpdate };