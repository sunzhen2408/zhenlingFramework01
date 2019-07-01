const moment = require("moment");

// const TIME_FORMAT = require("../utils/TimeUtils").TIME_FORMAT;
// const {insertUE} = require('./DBRouter');
// var HashMap = require("hashmap");
// var ueList = new HashMap;
//const ueList = new Map();
const siteUeList = new Map();
module.exports = {
    /**
     * 增加ue信息到消息队列中
     * @pa
     * ram userid
     * @param ueInfo
     */

    add(ueList,userid, ueInfo) {
        if (ueList.has(userid)) {
            ueList.get(userid).push(ueInfo);
           // console.log(ueList);
        } else {
            ueList.set(userid, [ueInfo]);
        }
    },
    addBySiteId(site_id, ueInfo) {
        if (siteUeList.has(site_id)) {
            siteUeList.get(site_id).push(ueInfo);
        } else {
            siteUeList.set(site_id, [ueInfo]);
        }
    },
    /**
     * 移除消息队列中的指定用户的信息
     * @param userid
     */
    remove(userid) {
        if (ueList.has(userid)) {
            ueList.delete(userid);
        }
    },

    startSend() {
        const {emit} = require('./LTENATSRouter');
        setInterval(function () {
            let savingData = [];
            ueList.forEach((value, key) => {
                let userid = key;
                let ueInfos = ueList.get(userid);
                savingData = savingData.concat(ueInfos);
                if (ueInfos.length === 0) {
                    return;
                } else if (ueInfos.length > 1000) {
                    ueInfos = ueInfos.slice(0, 1000);
                }
                emit('sendCurrentUE', {userid: userid, data: ueInfos});
                ueList.set(userid, []);
            });
            if (savingData.length !== 0) {
                insertUE(savingData);
            }
        }, 5 * 1000);
        setInterval(function () {
            siteUeList.forEach((value, key) => {
                let site_id = key;
                let ueInfos = siteUeList.get(site_id);
                if (ueInfos.length === 0) {
                    return;
                } else if (ueInfos.length > 1000) {
                    ueInfos = ueInfos.slice(0, 1000);
                }
                emit('CurrentSiteData', {
                    userid: 0,
                    data: {
                        site_id: site_id,
                        site_type: 'ElectricFence',
                        time: moment().format(TIME_FORMAT),
                        data: {dataType: 'IMSIList', ueInfos}
                    }
                });
                siteUeList.set(site_id, []);
            });

        }, 5 * 1000);
    }
};
