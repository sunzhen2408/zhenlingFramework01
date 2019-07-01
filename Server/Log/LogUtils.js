const DBRouter = require('../DB/DBRouter');
const LteFsmFactory = require('../BP/LteFsmFactory');

module.exports = {
    log4G: (eventId, boardsn, content) => {
        DBRouter.getUseridByBoardsn(boardsn).then(useridRes => {
            if (useridRes.rowCount > 0) {
                let userInfo = useridRes.rows;
                let userid = userInfo[0].userid;
                let mFsm = LteFsmFactory.getLteFsm(boardsn);
                if (mFsm !== null) {
                    DBRouter.insertLog(eventId, +userid,
                        `站点${mFsm.groupInfo.groupName}的${mFsm.workMode === 0x00ff ? 'TDD' : 'FDD'}设备
                    ${boardsn}${content}`);
                } else {
                    DBRouter.insertLog(eventId, +userid, content);
                }
            }
        });
    },
    logWifi: (eventId, APMAC, content) => {
        DBRouter.getUseridByAPMAC(APMAC).then(useridRes => {
            if (useridRes.rowCount > 0) {
                let userInfo = useridRes.rows;
                let userId = userInfo[0].userid;
                DBRouter.insertLog(eventId, userid, content);
            }
        });
    },

};