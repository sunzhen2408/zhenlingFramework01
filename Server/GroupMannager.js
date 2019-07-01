const {getRoomList, getGroupIdOfRoomNo} = require('./DB/DBRouter');
//const {activeAerial} = require('./Aerial/AerialMsgHandler');
const moment = require('moment');
const {TIME_FORMAT} = require('./utils/TimeUtils');
const GroupMap = {};
let lastTime = moment();
let activeRoomList = [];

//初始化所有站点信息
function initGroups() {
    getRoomList().then(res => {
        if (res.rowCount > 0) {
            let dataSource = res.rows;
            dataSource.forEach(item => {
                let roomInfo = item.room_no === null ? undefined : {
                    //唯一标识房间
                    roomNo: item.room_no,
                    //房间名称
                    roomName: item.room_name,
                    //指定房间的激活时长
                    actuationDuration: item.actuation_duration,
                    //天线打开的开关编号 0，1，2，3
                    aerialNo: item.aerial_no,
                };
                if (GroupMap.hasOwnProperty(item.groupId)) {
                    let group = GroupMap[item.groupId];
                    group.roomInfos.push(roomInfo);
                } else {
                    GroupMap[item.groupId] = {
                        groupId: item.groupId,
                        groupName: item.groupName,
                        //当前站点拥有的LTE板子boardsn
                        boardsns: item.array,
                        //当前激活的天线
                        activeRoomNo: undefined,
                        //时间序列 根据站点房间个数来生成的对应每个房间的心跳个数
                        timeSequence: item.array.length === 0 ? [] : Array.apply(null, Array(item.array.length)).map(item => 0),
                        //当前站点配置的房间
                        roomInfos: roomInfo === undefined ? [] : [roomInfo],
                        //当前站点配置的天线sn
                        AerialSN: item.aerial_sn,
                        //是否有效时间
                        ifValidTime: false
                    };
                }
            });
        }
    });
}

function activeRoom(groupId, aerialNo) {
    //todo 激活aerialNo相对应的天线
    let AerialSN = GroupMap[groupId].AerialSN;
    console.log('切换时间' + moment().diff(lastTime));
    lastTime = moment();
    activeAerial(AerialSN, aerialNo);
}

// const baordsns = ['13020000881773P0262', '130200023717CBP0039', '130200023717CBP0934'];

// setInterval(function () {
//     module.exports.updateState(baordsns[0], 34);
//     module.exports.updateState(baordsns[1], 34);
//     module.exports.updateState(baordsns[2], 34);
// }, 5 * 1000);

function updateActiveRoomList() {
    let activeRooms = [];
    let groupList = Object.values(GroupMap);
    for (let group of groupList) {
        if (group.activeRoomNo !== undefined) {
            activeRooms.push(group.activeRoomNo);
        }
    }
    activeRoomList = [...activeRooms];
    console.log(`当前激活房间列表为[${activeRoomList}]`);
}

module.exports = {
    initGroups: initGroups,

    /**
     * 根据每个板子上报的心跳包数量来判断是否激活下一个房间对应的天线
     * @param boardsn 板子序列号
     * @param groupId 站点Id
     */
    updateState: function (boardsn, groupId) {
        if (Object.values(GroupMap).length === 0) {
            return;
        }
        let group = GroupMap[groupId];
        if (group.roomInfos.length === 0) {
            return;
        }
        let index = group.boardsns.indexOf(boardsn);
        group.timeSequence[index] += 1;
        let currRoomInfo = group.roomInfos.find(item => item.roomNo === group.activeRoomNo);
        let currRoomIndex = group.roomInfos.indexOf(currRoomInfo);
        let maxSequence = Math.max.apply(Math, group.timeSequence);
        group.ifValidTime = maxSequence * 5 >= 20;
        if (currRoomInfo === undefined || maxSequence * 5 > currRoomInfo.actuationDuration) {
            if (currRoomIndex !== -1 && currRoomIndex < group.roomInfos.length - 1) {
                currRoomIndex += 1;
            } else {
                currRoomIndex = 0;
            }
            group.activeRoomNo = group.roomInfos[currRoomIndex].roomNo;
            group.timeSequence = group.timeSequence.map(item => 0);
            //切换到新房间将此标志位置为false，不添加上号信息
            group.ifValidTime = false;
            updateActiveRoomList();
            activeRoom(groupId, group.roomInfos[currRoomIndex].aerialNo);
        }
    },

    /**
     * 为指定站点增加一个房间
     * @param groupId 站点id
     * @param roomInfo 房间具体信息{roomName,actuationDuration,aerialNo},defaultValue:{actuationDuration:30,aerialNo:0}
     * @return {boolean}
     */
    addRoom: function (groupId, roomInfo) {
        //todo 检测天线no是否合法，insert into database
        return true;
    },

    /**
     * 删除房间
     * @param roomNo 房间序列号
     * @return {boolean}
     */
    deleteRoom: function (roomNo) {
        return true;
    },

    /**
     * 获取天线对应的站点ID
     * @param AerialSN
     * @return {*}
     */
    getGroupId: function (AerialSN) {
        let values = Object.values(GroupMap);
        let group = values.find(item => item.AerialSN === AerialSN);
        if (group === undefined) {
            return 0;
        }
        return group.groupId;
    },

    /**
     * 获取当前站点激活的房间
     * @param groupId 站点Id
     * @return {*} 当前站点激活房间的信息
     */
    getActiveRoomInfo: function (groupId) {
        let group = GroupMap[+groupId];
        let roomInfo = group.roomInfos.find(item => item.roomNo === group.activeRoomNo);
        return roomInfo;
    },

    /**
     * 返回当前站点是否处于有效时间
     * @param groupId
     * @return {boolean}
     */
    ifInvalid: function (groupId) {
        let group = GroupMap[+groupId];
        let ifValidTime = group.ifValidTime;
        return ifValidTime;
    },

    updateRoomInfo(roomInfo) {
        let dbRes = getGroupIdOfRoomNo(roomInfo.roomNo);
        dbRes.promise.then(res => {
            if (res.rowCount > 0) {
                let groupId = res.rows[0].groupId;
                GroupMap[groupId].roomInfos.forEach(item => {
                    if (item.roomNo === roomInfo.roomNo) {
                        item.roomName = roomInfo.roomName;
                        //指定房间的激活时长
                        item.actuationDuration = roomInfo.actuationDuration;
                        //天线打开的开关编号 0，1，2，3
                        item.aerialNo = roomInfo.aerialNo;
                        console.log(`更新房间信息成功${JSON.stringify(roomInfo)}`);
                    }
                });
            }
        });
    },

    getActiveRoomList() {
        return activeRoomList;
    }
};
