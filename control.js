const fs = require('fs');
const pipe = '\\\\.\\pipe\\TTF2SDK';
setTimeout(() => {
    fs.writeFileSync(pipe, 'CGetLocalClientPlayer().ClientCommand("+offhand0")')
    setTimeout(() => fs.writeFileSync(pipe, 'CGetLocalClientPlayer().ClientCommand("-offhand0")'), 500)
}, 1000)


setTimeout(() => {
    const f = fs.openSync(pipe, 'w');
    fs.writeSync(f, 'CGetLocalClientPlayer().ClientCommand("+offhand0")');
    setTimeout(() => fs.writeSync(f, 'CGetLocalClientPlayer().ClientCommand("-offhand0")'), 500)
}, 1000)
