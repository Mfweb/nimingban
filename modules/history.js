import SQLite from 'react-native-sqlite-storage'

var __historySQLite = null;
function init() {
    __historySQLite = SQLite.openDatabase({name: 'history.db', location: 'default'}, ()=>{
        console.log('success');
    }, (e)=>{
        console.log(e);
    });
}

const history = {
    init: init
}
export { history }