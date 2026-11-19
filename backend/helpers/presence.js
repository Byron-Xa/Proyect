const online = new Map(); 

exports.add = (id, sid) => {
    const set = online.get(id) || new Set();
    const primera = set.size === 0;
    set.add(sid);
    online.set(id, set);
    return primera;                 
};

exports.remove = (id, sid) => {
    const set = online.get(id);
    if (!set) return false;
    set.delete(sid);
    if (set.size === 0) {
        online.delete(id);
        return true;                
    }
    return false;
};

exports.isOnline = (id) => online.has(id);
exports.countUsers = () => online.size;
exports.countSessions = () =>
    [...online.values()].reduce((n, s) => n + s.size, 0);