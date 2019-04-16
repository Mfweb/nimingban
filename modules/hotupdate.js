import { Platform, Alert } from 'react-native';
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
    if(isFirstTime) { // 这个版本首次运行
        markSuccess();
    }
    if(isRolledBack) { // 已回滚
        Alert.alert('提示', '热更新失败，已回滚上一个版本。');
    }
    let checkRes = await checkUpdate(appKey)
    if(checkRes.expired) { // 原生包需要更新
        // Alert.alert('提示', 'debug: 原生包已过期或处于DEBUG模式');
    }
    else if(checkRes.upToDate) { // 原生包和JS包都已经最新
        // Alert.alert('提示', 'debug: 原生包与JS包已经是最新');
    }
    else { // JS包需要更新
        Alert.alert('提示', `检查到热更新版本:${checkRes.name},是否下载更新？\n${checkRes.description}`, [{
                text: '是', 
                onPress: ()=>{
                    downloadUpdate(checkRes).then(hash => {
                        switchVersion(hash);
                    }).catch(err => { 
                        alert('提示', '更新失败');
                        console.error(err);
                    });
                }
            }, {
                text: '否',
            },
        ]);
    }
}
export { pinkCheckUpdate };