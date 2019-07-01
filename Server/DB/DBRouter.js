const _DBUtils = require('./DBUtils');
const _BufferUtils = require('../utils/BufferUtils');
const moment = require('moment');
const {getPhoneNum} = require('../utils/ImsiUtils');

module.exports = {
    /**
     * 获取用户名为userName的用户信息
     * @param userName
     * @returns {*}  返回Promise结果
     */
    getUserInfoByName: (userName) => {
        return _DBUtils.queryWithAsync('SELECT * from public."userInfo" where username = $1', [userName]);
    },

    /**
     * 获取用户id为userId的用户信息
     * @param userid 用户ID（唯一标识某一用户）
     * @returns {*} 返回查询promise结果
     */
    getUserInfoById: (userid) => {
        return _DBUtils.queryWithAsync('SELECT * from public."userInfo" where userid = $1', [userid]);
    },

    /**
     * 插入用户信息
     * @param userInfo{username,password,currentAuthority}
     * @returns {*} 查询结构type：promise
     */
    insertUserInfo: (userInfo) => {
        return _DBUtils.queryWithAsync(
            'INSERT INTO public."userInfo"(username, password, "currentAuthority") ' +
            'VALUES ($1, $2, $3) returning userid',
            [userInfo.username, userInfo.password, userInfo.currentAuthority]);
    },

    /**
     * 根据LTE板子的序列号获取groupId
     * @param boardsn LTE板子序列号
     * @returns {*} Promise
     */
    getGroupIdFromBoardsn: (boardsn) => {
        boardsn = _BufferUtils.clearNullChar(boardsn);
        return _DBUtils.queryWithAsync(
            'SELECT "groupId" FROM public."LteDevTable" where boardsn = $1', [boardsn]
        );
    },

    /**
     * 根据groupId获取对应的设备信息
     * @param groupId 组号
     * @returns {*} Promise
     */
    getLteDevsFromGroupId: (groupId) => {
        return _DBUtils.queryWithAsync(
            'SELECT "LteDevTable".boardsn, "LteDevTable".name, "LteDevTable"."workMode", "LteDevTable"."groupId","groupTable"."groupName"\n' +
            '\tFROM public."groupTable"\n' +
            '\tLEFT JOIN "LteDevTable" ON "LteDevTable"."groupId" = "groupTable"."groupId"\n' +
            '\tWHERE "groupTable"."groupId" = $1\n' +
            ' ORDER BY "LteDevTable".name', [groupId]);
    },

    /**
     * 获取所有4G设备信息
     * @returns {*} Promise
     */
    getLTEDevices: () => {
        return _DBUtils.queryWithAsync('SELECT boardsn, "name", "workMode",  "groupId" FROM public."LteDevTable" order by boardsn');
    },

    /**
     * 根据groupId获取站点信息
     * @param groupId 站点Id
     * @returns {*}
     */
    getGroupInfoFromId: (groupId) => {
        return _DBUtils.queryWithAsync(
            'SELECT * FROM public."groupTable" where "groupTable"."groupId" = $1;', [groupId]);
    },

    /**
     * 获取站点详细信息
     * @returns {*}
     */
    getAllGroupInfo: () => {
        return _DBUtils.queryWithAsync('SELECT * FROM public."groupTable"');
    },

    /**
     * 获取站点简略信息
     * @returns {*}
     */
    getAllGroupName: () => {
        return _DBUtils.queryWithAsync('SELECT "groupId","groupName" FROM public."groupTable"');
    },

    getAllGroupNameByUserid: (userid) => {
        return _DBUtils.queryWithAsync('SELECT "groupId","groupName" FROM public."groupTable" WHERE userid=$1', [userid]);
    },

    /**
     * 插入4G设备信息
     * @param devInfo {boardsn,workMode,}
     */
    insertLTEDevInfo: (devInfo) => {
        return _DBUtils.queryWithAsync('INSERT INTO public."LteDevTable" ' +
            '(boardsn, name, "workMode", "groupId", "creatTime") ' +
            'VALUES ($1,$2,$3,$4,now())', [devInfo.boardsn, devInfo.name, devInfo.workMode, devInfo.groupId]);
    },

    /**
     * 修改4G设备的所属站点
     * @returns {*}
     * @param groupId
     * @param boardsn
     */
    changeLteDevGroup: (groupId, boardsn) => {
        return _DBUtils.queryWithAsync(
            'UPDATE public."LteDevTable" SET  "groupId"=$1  WHERE boardsn=$2',
            [+groupId, boardsn]);
    },
    /**
     * 修改wifi设备的所属站点
     * @returns {*}
     * @param groupId
     * @param ap_mac
     */
    changeWifiDevGroup: (groupId, ap_mac) => {
        return _DBUtils.queryWithAsync(
            'UPDATE public.wifi_devs SET  "groupId"=$1  WHERE ap_mac=$2',
            [+groupId, ap_mac]);
    },

    /**
     * 查询所有站点及设备信息
     * @returns {*} 查询结果的Promise
     */
    getAllGroupInfoWithDevs: () => {
        return _DBUtils.queryWithAsync(
            `SELECT "groupTable"."groupId", "groupTable"."groupName",  "groupTable"."groupDistrict",
                "groupTable"."groupAddress", "groupTable".coordinate, "groupTable"."creatTime", "groupTable".userid, "groupTable".comments,
                "LteDevTable".boardsn,"LteDevTable".name,"LteDevTable"."workMode","LteDevTable"."carrieroperator",
                wifi_devs.ap_mac, wifi_devs.update_time, wifi_devs.name AS wifi_name
                FROM public."groupTable" 
                LEFT OUTER JOIN public."LteDevTable" ON "groupTable"."groupId" = "LteDevTable"."groupId" 
                LEFT OUTER JOIN wifi_devs ON "groupTable"."groupId" = wifi_devs."groupId" 
                WHERE "groupTable"."groupId" != 0 
                ORDER BY "groupTable"."groupId";`);
    },

    /**
     * 查询当前用户所拥有的所有站点信息
     * @param userid 用户ID
     * @returns {*} 查询结果Promise
     */
    getGroupInfoByUserid: (userid) => {
        return _DBUtils.queryWithAsync(
            `SELECT "groupTable"."groupId", "groupTable"."groupName",  "groupTable"."groupDistrict",
                "groupTable"."groupAddress", "groupTable".coordinate, "groupTable"."creatTime", "groupTable".userid, "groupTable".comments,
                "LteDevTable".boardsn,"LteDevTable".name,"LteDevTable"."workMode","LteDevTable"."carrieroperator",
                wifi_devs.ap_mac, wifi_devs.update_time, wifi_devs.name AS wifi_name
                FROM public."groupTable" 
                LEFT OUTER JOIN public."LteDevTable" ON "groupTable"."groupId" = "LteDevTable"."groupId" 
                LEFT OUTER JOIN wifi_devs ON "groupTable"."groupId" = wifi_devs."groupId" 
                WHERE ("groupTable"."groupId" != 0 AND "groupTable".userid = ${userid})
                ORDER BY "groupTable"."groupId";`);
    },

    /**
     * 增加站点，默认将站点分配给admin
     * @param groupInfo
     * @returns {*}
     */
    insertGroupInfo: (groupInfo) => {
        return _DBUtils.queryWithAsync('INSERT INTO public."groupTable"(' +
            ' "groupName", "groupAddress", "creatTime", userid, comments, "groupDistrict")' +
            ' VALUES ($1, $2, now(), $3, $4, $5)'
            , [groupInfo.groupName, groupInfo.groupAddress, groupInfo.userid === undefined ? 0 : groupInfo.userid, groupInfo.comments, groupInfo.groupDistrict]);
    },

    /**
     * 删除指定站点
     * @param groupId 站点Id
     * @returns {*} 删除结果Promise
     */
    deleteGroup: (groupId) => {
        let sql = `DELETE FROM public."groupTable" WHERE "groupId" = ${+groupId};
        UPDATE public.wifi_devs SET "groupId"=0	WHERE "groupId"=${+groupId};
        UPDATE public."LteDevTable" SET "groupId"=0	WHERE "groupId"=${+groupId};
        `;
        return _DBUtils.queryWithAsync(sql)
    },

    /**
     * 更新站点信息
     * @returns {*}
     */
    updateGroupInfo: (groupInfo) => {
        return _DBUtils.queryWithAsync('UPDATE public."groupTable"' +
            ' SET "groupName"=$1, "groupAddress"=$2, comments=$3, "groupDistrict"=$4 WHERE "groupId"=$5;'
            , [groupInfo.groupName, groupInfo.groupAddress, groupInfo.comments, groupInfo.groupDistrict, groupInfo.groupId]);
    },

    /**
     * 更新4G板子的命名
     * @param lteDevInfo 板子信息{boardsn,devName}
     * @returns {*} 更新结果
     */
    updateLteDevName: (lteDevInfo) => {
        return _DBUtils.queryWithAsync('UPDATE public."LteDevTable" SET name=$1 WHERE boardsn=$2',
            [lteDevInfo.devName, lteDevInfo.boardsn])
    },

    /**
     * 更新4G板子的工作模式
     * @param lteDevInfo 板子信息{boardsn,workMode}
     * @returns {*} 更新结果
     */
    updateLteDevWorkMode: (lteDevInfo) => {
        return _DBUtils.queryWithAsync('UPDATE public."LteDevTable" SET "workMode"=$1 WHERE boardsn=$2',
            [lteDevInfo.workMode, lteDevInfo.boardsn])
    },

    getUE: (params) => {
        let carrieroperators;
        let groupIds;
        if (params.carrieroperator !== undefined) {
            params.carrieroperator = params.carrieroperator.split(',');
            params.carrieroperator = params.carrieroperator.map(item => {
                return `'${item}'`;
            });
            carrieroperators = params.carrieroperator.join(',');
        }
        if (params.groupId !== undefined) {
            params.groupId = params.groupId.map(item => {
                return parseInt(item);
            });
            groupIds = params.groupId.join(',');
        }
        let sql = `SELECT to_char("ueInfo"."time",'YYYY-MM-DD HH24:MI:SS') AS "time","ueInfo".location,"ueInfo".predicted_phone_num, "ueInfo".boardsn, "ueInfo".imsi, "ueInfo".carrieroperator,"LteDevTable"."groupId","groupTable"."groupName","groupTable".userid 
        FROM public."ueInfo" 
        LEFT OUTER JOIN "LteDevTable" ON "ueInfo".boardsn = "LteDevTable".boardsn
        LEFT OUTER JOIN "groupTable" ON "LteDevTable"."groupId" = "groupTable"."groupId"
        WHERE ${params.timeRange !== undefined ? `("ueInfo".time BETWEEN '${params.timeRange[0]}' AND '${params.timeRange[1]}')` : ' '} 
        ${params.imsi !== undefined ? `AND ("ueInfo".imsi LIKE '%${params.imsi}%' )` : ' '} 
        ${params.boardsn !== undefined ? `AND ("ueInfo".boardsn LIKE '%${params.boardsn}%')` : ' '} 
        ${carrieroperators !== undefined ? `AND ("ueInfo".carrieroperator IN (${carrieroperators}))` : ' '}
        ${groupIds !== undefined ? `AND ("LteDevTable"."groupId" IN (${groupIds}))` : ' '} 
        ${params.location !== undefined ? `AND ("ueInfo".location like '%${params.location}%')` : ' '} 
        ORDER BY "ueInfo".time DESC`;
        if (params.timeRanger === undefined && params.imsi !== undefined && params.boardsn !== undefined && carrieroperators !== undefined && groupIds !== undefined) {
            sql.replace('WHERE', ' ');
        }
        return _DBUtils.queryWithAsync(sql);
    },

    getUEByUserid: (params, userid) => {
        let carrieroperators;
        let groupIds;
        if (params.carrieroperator !== undefined) {
            params.carrieroperator = params.carrieroperator.split(',');
            params.carrieroperator = params.carrieroperator.map(item => {
                return `'${item}'`;
            });
            carrieroperators = params.carrieroperator.join(',');
        }
        if (params.groupId !== undefined) {
            params.groupId = params.groupId.map(item => {
                return parseInt(item);
            });
            groupIds = params.groupId.join(',');
        }
        let sql = `SELECT to_char("ueInfo"."time",'YYYY-MM-DD HH24:MI:SS')  AS "time","ueInfo".predicted_phone_num,"ueInfo".location, "ueInfo".boardsn, "ueInfo".imsi, "ueInfo".carrieroperator,"LteDevTable"."groupId","groupTable"."groupName","groupTable".userid 
        FROM public."ueInfo" 
        LEFT OUTER JOIN "LteDevTable" ON "ueInfo".boardsn = "LteDevTable".boardsn
        LEFT OUTER JOIN "groupTable" ON "LteDevTable"."groupId" = "groupTable"."groupId"
        WHERE "groupTable".userId = ${parseInt(userid)}
        ${params.timeRange !== undefined ? `AND ("ueInfo".time BETWEEN '${params.timeRange[0]}' AND '${params.timeRange[1]}')` : ' '} 
        ${params.imsi !== undefined ? `AND ("ueInfo".imsi LIKE '%${params.imsi}%' )` : ' '} 
        ${params.boardsn !== undefined ? `AND ("ueInfo".boardsn LIKE '%${params.boardsn}%')` : ' '} 
        ${carrieroperators !== undefined ? `AND ("ueInfo".carrieroperator IN (${carrieroperators}))` : ' '}
        ${groupIds !== undefined ? `AND ("LteDevTable"."groupId" IN (${groupIds}))` : ' '}         
        ${params.location !== undefined ? `AND ("ueInfo".location like '%${params.location}%')` : ' '}
         ORDER BY "ueInfo".time DESC`;
        if (params.timeRanger === undefined && params.imsi !== undefined && params.boardsn !== undefined && carrieroperators !== undefined && groupIds !== undefined) {
            sql.replace('WHERE', ' ');
        }
        return _DBUtils.queryWithAsync(sql);
    },

    getMACHistory: (params) => {
        let carrieroperators;
        let groupIds;
        if (params.groupId !== undefined) {
            params.groupId = params.groupId.map(item => {
                return parseInt(item);
            });
            groupIds = params.groupId.join(',');
        }
        let sql = `SELECT to_char(mac_info."time",'YYYY-MM-DD HH24:MI:SS') AS "time", mac_info.ap_mac, mac_info.source_mac, wifi_devs."groupId","groupTable"."groupName","groupTable".userid 
        FROM public.mac_info 
        LEFT OUTER JOIN wifi_devs ON mac_info.ap_mac = wifi_devs.ap_mac
        LEFT OUTER JOIN "groupTable" ON wifi_devs."groupId" = "groupTable"."groupId"
        WHERE ${params.timeRange !== undefined ? `(mac_info.time BETWEEN '${params.timeRange[0]}' AND '${params.timeRange[1]}')` : ' '} 
        ${params.sourceMAC !== undefined ? `AND (mac_info.source_mac LIKE '%${params.imsi}%' )` : ' '} 
        ${params.APMAC !== undefined ? `AND (mac_info.ap_mac LIKE '%${params.APMAC}%')` : ' '} 
        ${groupIds !== undefined ? `AND (wifi_devs."groupId" IN (${groupIds}))` : ' '} 
        ORDER BY mac_info.time DESC`;
        if (params.timeRanger === undefined && params.sourceMAC !== undefined && params.APMAC !== undefined && groupIds !== undefined) {
            sql.replace('WHERE', ' ');
        }
        return _DBUtils.queryWithAsync(sql);
    },

    getMACHistoryByUserid: (params, userid) => {
        let carrieroperators;
        let groupIds;
        if (params.groupId !== undefined) {
            params.groupId = params.groupId.map(item => {
                return parseInt(item);
            });
            groupIds = params.groupId.join(',');
        }
        let sql = `SELECT to_char(mac_info."time",'YYYY-MM-DD HH24:MI:SS') AS "time", mac_info.ap_mac, mac_info.source_mac, wifi_devs."groupId","groupTable"."groupName","groupTable".userid 
        FROM public.mac_info 
        LEFT OUTER JOIN wifi_devs ON mac_info.ap_mac = wifi_devs.ap_mac
        LEFT OUTER JOIN "groupTable" ON wifi_devs."groupId" = "groupTable"."groupId"
        WHERE "groupTable".userId = ${parseInt(userid)}
        ${params.timeRange !== undefined ? `AND (mac_info.time BETWEEN '${params.timeRange[0]}' AND '${params.timeRange[1]}')` : ' '} 
        ${params.sourceMAC !== undefined ? `AND (mac_info.source_mac LIKE '%${params.imsi}%' )` : ' '} 
        ${params.APMAC !== undefined ? `AND (mac_info.ap_mac LIKE '%${params.APMAC}%')` : ' '} 
        ${groupIds !== undefined ? `AND (wifi_devs."groupId" IN (${groupIds}))` : ' '} 
        ORDER BY mac_info.time DESC`;
        if (params.timeRanger === undefined && params.sourceMAC !== undefined && params.APMAC !== undefined && groupIds !== undefined) {
            sql.replace('WHERE', ' ');
        }
        return _DBUtils.queryWithAsync(sql);
    },

    getSigUEInfo: (params) => {
        let sql = `SELECT to_char("ueInfo"."time",'YYYY-MM-DD HH24:MI:SS')  AS "time",rssi FROM public."ueInfo" 
        WHERE imsi= '${params.imsi}' 
        ${params.timeRange !== undefined ?
            `AND ("ueInfo".time BETWEEN '${params.timeRange[0]}' AND '${params.timeRange[1]}')` : ' '}`;
        return _DBUtils.queryWithAsync(sql);
    },

    getSigUEInfoById: (params, userid) => {
        let sql = `SELECT to_char("ueInfo"."time",'YYYY-MM-DD HH24:MI:SS') AS "time","ueInfo".rssi FROM public."ueInfo" 
        LEFT OUTER JOIN "LteDevTable" ON "ueInfo".boardsn = "LteDevTable".boardsn
        LEFT OUTER JOIN "groupTable" ON "LteDevTable"."groupId" = "groupTable"."groupId"
        WHERE imsi= '${params.imsi}' AND  "groupTable".userid = ${params.userid}
        ${params.timeRange !== undefined ?
            `AND ("ueInfo".time BETWEEN '${params.timeRange[0]}' AND '${params.timeRange[1]}')` : ' '}`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 说去所有管理员用户Id
     * @returns {*} userid[] Promise
     */
    getAllAdminUserId: () => {
        return _DBUtils.queryWithAsync(
            `SELECT userid 
                FROM public."userInfo" 
                WHERE "userInfo"."currentAuthority" = 'admin'`);
    },

    /**
     * 获取指定板子所属用户的userid
     * @param boardsn 板子序列号
     * @returns {*} groupId Promise
     */
    getUseridByBoardsn: (boardsn) => {
        return _DBUtils.queryWithAsync(`
        SELECT "groupTable".userid 
            FROM public."LteDevTable" 
            INNER JOIN "groupTable" 
            ON "LteDevTable"."groupId" = "groupTable"."groupId" 
            WHERE boardsn = '${boardsn}'`);
    },
    /**
     * 获取板子所属用户的userid
     * @param APMAC 采集设备的mac
     * @returns {*}
     */
    getUseridByAPMAC: (APMAC) => {
        return _DBUtils.queryWithAsync(`
        SELECT "groupTable".userid 
            FROM public.wifi_devs 
            INNER JOIN "groupTable" 
            ON wifi_devs."groupId" = "groupTable"."groupId" 
            WHERE ap_mac = '${APMAC}'`);
    },

    /**
     * 根据多个时间段分析出数据碰撞集合
     * @param conditions {userid:,timeIntervals:[{start:,end:}]}
     * @returns {*} analyzed data Promise
     */
    getAnalysisDataByTimeInterval(conditions) {
        let SQL_CREATE_temp_boardsn =
            `CREATE temporary table temp_boardsn AS
                SELECT boardsn from "LteDevTable" 
                    join "groupTable" on "groupTable"."groupId" = "LteDevTable"."groupId" 
                    WHERE "groupTable".userid = ${conditions.userid}; `;

        let SQL_SELECT_datasource = [];
        let time_intervals = conditions.timeIntervals;
        if (time_intervals) {
            time_intervals.forEach(time_interval => {
                SQL_SELECT_datasource.push(`
                SELECT  imsi,carrieroperator,location,predicted_phone_num,COUNT(imsi),'${time_interval.start}'||'_'||'${time_interval.end}' AS times
                ,'${time_interval.label}' AS label
				    FROM public."ueInfo"
				    WHERE "time" BETWEEN '${time_interval.start}' AND '${time_interval.end}' 
				        AND boardsn = any (SELECT * FROM temp_boardsn)
				    GROUP BY imsi,carrieroperator,location,predicted_phone_num`);
            });
        }
        let SQL_CREATE_temp_imsi = `
        CREATE temporary TABLE temp_imsi AS 
        ${SQL_SELECT_datasource.join(' UNION ALL ')};`;

        let SQL_SELECT_imsis = `
        SELECT imsis.imsi,imsis.carrieroperator,location,predicted_phone_num,count(imsis.imsi) AS "matchNum",array(
            SELECT temp_detail."count"||','||temp_detail."times"||','||temp_detail.label FROM  temp_imsi AS temp_detail  WHERE temp_detail.imsi=imsis.imsi) as details
            from temp_imsi imsis
            group by imsi,carrieroperator,location,predicted_phone_num
            order by "matchNum" desc;`;

        let SQL = SQL_CREATE_temp_boardsn + SQL_CREATE_temp_imsi + SQL_SELECT_imsis;
        return _DBUtils.queryShutDownNow(SQL);
    },

    /**
     * 插入wifi设备
     * @param devInfo wifi设备的具体信息{APMAC,groupId,name}
     * @returns {*}
     */
    insertGetWifiDev: (devInfo) => {
        return _DBUtils.queryWithAsync(`INSERT INTO public.wifi_devs(
	ap_mac, update_time, "groupId", name)
	VALUES ('${devInfo.APMAC}', now(), ${devInfo.groupId}, '${devInfo.name}')
	ON CONFLICT (ap_mac) do nothing;
	Select "groupTable"."groupId","groupName" 
from public.wifi_devs 
inner join "groupTable" on "groupTable"."groupId" = wifi_devs."groupId"
where ap_mac='${devInfo.APMAC}'; `);
    },

    /**
     * 插入新的MAC信息
     * @param macInfo mac信息
     * @returns {*}
     */
    insertNewMAC: (macInfo) => {
        return _DBUtils.queryWithAsync(`INSERT INTO public.mac_info(
        "time", source_mac, channel, mac_type, rssi, ap_mac)
        VALUES ('${macInfo.Time}', '${macInfo.SourceMAC}', ${macInfo.Channel}, ${macInfo.MACType}, ${macInfo.RSSI}, '${macInfo.APMAC}');`);
    },

    /**
     * 获取一个月的ue量
     */
    getUEPerMonthByuserid: (condition) => {
        let sql = `
            CREATE temporary table if not exists temp_boardsn AS
                    SELECT boardsn from "LteDevTable" 
                        join "groupTable" on "groupTable"."groupId" = "LteDevTable"."groupId" 
                        WHERE "groupTable".userid = ${condition.userid};
        
                CREATE temporary table if not exists temp_time_series AS
                    select 
                        generate_series(to_date('${condition.start1}','yyyy-mm-dd hh24:mi:ss'),to_date('${condition.start2}','yyyy-mm-dd hh24:mi:ss'),'1 day') AS start,
                        generate_series(to_date('${condition.end1}','yyyy-mm-dd hh24:mi:ss'),to_date('${condition.end2}','yyyy-mm-dd hh24:mi:ss'),'1 day') AS end;

        select temp_time_series."start",count("imsi") from temp_time_series
        left join "ueInfo" on (("ueInfo".imsi = '${condition.imsi}') AND "ueInfo"."time" between temp_time_series."start" AND temp_time_series."end" AND boardsn in (select * from temp_boardsn))
        group by "start"
        order by "start";`;
        return _DBUtils.queryWithAsync(sql);
    },

    getUEPerMonth: (condition) => {
        let sql = `
        CREATE temporary table if not exists temp_time_series AS
            select 
                generate_series(to_date('${condition.start1}','yyyy-mm-dd hh24:mi:ss'),to_date('${condition.start2}','yyyy-mm-dd hh24:mi:ss'),'1 day') AS start,
                generate_series(to_date('${condition.end1}','yyyy-mm-dd hh24:mi:ss'),to_date('${condition.end2}','yyyy-mm-dd hh24:mi:ss'),'1 day') AS end;

    select temp_time_series."start",count("imsi") 
        from temp_time_series
        left join "ueInfo" on (("ueInfo".imsi = '${condition.imsi}') AND"ueInfo"."time" between temp_time_series."start" AND temp_time_series."end")
        group by "start"
        order by "start";`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 插入日志
     * @param eventId 事件ID
     * @param userid 用户ID
     * @param content log内容
     * @returns {*}
     */
    insertLog: (eventId, userid, content) => {
        let sql = `INSERT INTO public.log(
	record_time, content, userid, event_id)
	VALUES (now(), '${content}', ${+userid}, ${+eventId});`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 获取所有用户的指定时间内的log
     * @param condition 指定时间段内（start（YYYY-MM-DD），end（YYYY-MM-DD））
     * @returns {*}
     */
    getALlLog(condition) {
        let sql = `SELECT record_time AS time, content, userid, log.event_id,event_list.event_level,explaination
	FROM public.log
	inner join event_list 
	on log.event_id=event_list.event_id
	where record_time between to_timestamp('${condition.start}','YYYY-MM-DD') AND to_timestamp('${condition.end}','YYYY-MM-DD')
	order by record_time desc;`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 获取指定时间指定用户的log
     * @param condition 指定时间段内（start（YYYY-MM-DD），end（YYYY-MM-DD））
     * @param userid 指定用户ID
     * @returns {*}
     */
    getLogByUserid(condition, userid) {
        let sql = `SELECT record_time AS time, content, userid, log.event_id,event_list.event_level,explaination
	FROM public.log
	inner join event_list 
	on log.event_id=event_list.event_id
	where userid = ${+userid} AND record_time between to_timestamp('${condition.start}','YYYY-MM-DD') AND to_timestamp('${condition.end}','YYYY-MM-DD')
	order by record_time desc;`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 获取指定时间段内指定用户的ue统计信息
     * @param condition 指定时间段内（start（YYYY-MM-DD），end（YYYY-MM-DD））
     * @param userid 指定用户id
     */
    getUETotalByUserid(condition, userid) {
        let sql = `SELECT count(imsi),"groupTable"."groupId","groupTable"."groupName","ueInfo".carrieroperator
	FROM public."groupTable"
	left outer join "LteDevTable" on "groupTable"."groupId" = "LteDevTable"."groupId"
	left outer join "ueInfo" on "LteDevTable".boardsn = "ueInfo".boardsn
	where userid = 0 AND "ueInfo".time between to_timestamp('${condition.start}','YYYY-MM-DD') AND to_timestamp('${condition.end}','YYYY-MM-DD')
	group by "groupTable"."groupId" ,"ueInfo".carrieroperator
	order by "groupTable"."groupId";`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 获取指定时间段内的所有UE统计信息
     * @param condition 指定时间段内（start（YYYY-MM-DD），end（YYYY-MM-DD））
     * @param userid
     */
    getUETotal(condition, userid) {
        let sql = `SELECT count(imsi),"groupTable"."groupId","groupTable"."groupName","ueInfo".carrieroperator
	FROM public."groupTable"
	left outer join "LteDevTable" on "groupTable"."groupId" = "LteDevTable"."groupId"
	left outer join "ueInfo" on "LteDevTable".boardsn = "ueInfo".boardsn
	where "ueInfo".time between to_timestamp('${condition.start}','YYYY-MM-DD') AND to_timestamp('${condition.end}','YYYY-MM-DD')
	group by "groupTable"."groupId" ,"ueInfo".carrieroperator
	order by "groupTable"."groupId";`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 获取所有用户信息及其所拥有的站点信息
     * @returns {*}
     */
    getALLUserDetails() {
        let sql = `SELECT "userInfo".userid, username, password, "currentAuthority",logincount
        ,lastlogintime,"groupName","groupId","groupTable"."groupAddress","groupTable"."groupDistrict","groupTable"."creatTime"
	FROM public."userInfo"
	left join "groupTable" on "groupTable".userid = "userInfo".userid
	order by "userInfo".userid;`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 更新用户登陆次数和最后登陆时间
     * @param userid 用户id
     * @returns {*}
     */
    updateUserLoginInfo(userid) {
        let sql = `UPDATE public."userInfo"
	SET  logincount = (select COALESCE("userInfo".logincount, 0) AS logincount from "userInfo" where userid = 0)+1 ,lastlogintime = now()
	WHERE userid = ${+userid};`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 将站点移至默认管理员用户
     * @param groupId 站点ID
     * @returns {*}
     */
    moveGroupToAdmin(groupId) {
        let sql = `UPDATE public."groupTable"
	SET  userid=0
	WHERE "groupId" = ${+groupId};`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 将站点分配给指定用户
     * @param userid
     * @param groupId 站点ID
     * @returns {*}
     */
    allotGroup(userid, groupId) {
        let sql = `UPDATE public."groupTable"
	SET  userid=${+userid}
	WHERE "groupId" = ${+groupId};`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 删除指定用户
     * @param userid 将要删除的用户ID
     * @returns {*}
     */
    deleteUser(userid) {
        let sql = `UPDATE public."groupTable"
	SET  userid=0
	WHERE userid = ${+userid};
	DELETE FROM public."userInfo"
	WHERE userid=${+userid};
	`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 增加新用户
     * @param newUserInfo 新用户信息{username,password,currentAuthority}
     * @returns {*}
     */
    insertNewUser(newUserInfo) {
        let sql = `INSERT INTO public."userInfo"(
	username, password, logincount, "currentAuthority", lastlogintime)
	VALUES ('${newUserInfo.username}', '${newUserInfo.password}', 0, '${newUserInfo.currentAuthority}', now());`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 插入多条ue数据
     * @param ueList
     * @returns {*}
     */
    insertUE(ueList) {
        let data = ueList.map(item => {
            let phoneNum = getPhoneNum(item.IMSI);
            return `('now()','${item.boardsn}','${item.IMSI}','${item.IMEI}','${item.Rssi}','${item.carrieroperator}',
            (select province ||' '|| city from attribution where phone_num = '${phoneNum}'),
            '${phoneNum !== '' ? phoneNum + '****' : ''}')`;
        });
        let values = data.join(',');
        let sql = `INSERT INTO public."ueInfo"(
	"time", boardsn, imsi, imei, rssi, carrieroperator,location,predicted_phone_num)
	VALUES ${values};`;
        return _DBUtils.queryWithAsync(sql);
    },

    getToBeAssigned() {
        let getLTESql = `SELECT boardsn,"workMode","creatTime"
FROM public."LteDevTable"
where "groupId" =0;`;
        let getWIFISql = `SELECT ap_mac, update_time
	FROM public.wifi_devs
	where "groupId" = 0;`;
        return _DBUtils.queryWithAsync(getLTESql + getWIFISql);
    },

    /**
     * 获取指定LTE设备的站点信息
     * @param boardsn
     * @returns {*}
     */
    getGroupInfoByBoardsn(boardsn) {
        let sql = `SELECT "groupTable"."groupId", "groupName", "groupAddress", coordinate, "groupTable"."creatTime", userid, comments, "groupDistrict"
	FROM public."groupTable"
	inner join "LteDevTable" on "groupTable"."groupId" = "LteDevTable"."groupId"
	where boardsn = '${boardsn}';`;
        return _DBUtils.queryWithAsync(sql);
    },

    getTotalStatistics(condition, userid) {
        let timeFormat = '';
        let interval = '';
        let limit = '';
        let extraCon = '';
        if (userid !== undefined) {
            extraCon += `AND userid = ${+userid}`;
        }
        if (+condition.groupId !== 0) {
            extraCon += `AND "groupTable"."groupId" = ${+condition.groupId}`;
        }
        switch (condition.rangeType) {
            case 'today': {
                timeFormat = 'YYYY-MM-DD hh24';
                interval = 'hours';
                limit = 'limit 24';
                condition.end = moment(condition.start).add(1, 'day').format('YYYY-MM-DD hh:mm:ss');
                break;
            }
            case 'week': {
                timeFormat = 'YYYY-MM-DD';
                interval = 'days';
                break;
            }
            case 'month': {
                timeFormat = 'YYYY-MM-DD';
                interval = 'days';
                break;
            }
            case 'year': {
                timeFormat = 'YYYY-MM';
                interval = 'months';
                break;
            }
            default: {
                timeFormat = 'YYYY-MM-DD';
                interval = 'days';
                break;
            }
        }
        let sql = `
 CREATE temporary table if not exists temp_time_series AS	
  	select 
	to_char(generate_series(to_date('${condition.start}','${timeFormat}'),to_date('${condition.end}','${timeFormat}'),'1 ${interval}'),'${timeFormat}') AS index_time ${limit};
--ue上号统计	
CREATE temporary table if not exists ue_statistic AS	
	select "ueInfo".carrieroperator,to_char("time", '${timeFormat}') as rep_time,count(*) AS "ueCount" from "ueInfo"
	inner join "LteDevTable" on "ueInfo".boardsn = "LteDevTable".boardsn
	inner join "groupTable" on "groupTable"."groupId" = "LteDevTable"."groupId"
 	where ("time" between  '${condition.start}' and  '${condition.end}') ${extraCon}
 	group by rep_time,"ueInfo".carrieroperator;
 	
--mac上号统计	
CREATE temporary table if not exists mac_statistic AS	
	select to_char("time", '${timeFormat}') as rep_time,count(*) AS "macCount" from "mac_info"
	inner join "wifi_devs" on "mac_info".ap_mac = "wifi_devs".ap_mac
	inner join "groupTable" on "groupTable"."groupId" = "wifi_devs"."groupId"
 	where ("time" between  '${condition.start}' and  '${condition.end}') ${extraCon} 
 	group by rep_time;

select temp_time_series.index_time,ue_statistic."ueCount",carrieroperator from temp_time_series 
	left join ue_statistic on temp_time_series.index_time = ue_statistic.rep_time;
	
select temp_time_series.index_time,mac_statistic."macCount" from temp_time_series 
	left join mac_statistic on temp_time_series.index_time = mac_statistic.rep_time;`;
        return _DBUtils.queryShutDownNow(sql);
    },

    getGroupsStatistics(condition, userid) {
        let extraCondition = '';
        if (userid !== undefined) {
            extraCondition = `AND userid = ${userid}`
        }
        let sql = `	
CREATE temporary table if not exists ue_statistic AS	
	select boardsn,count(*) AS ue_count from "ueInfo"
 		where "time" between  '${condition.start}' and  '${condition.end}'
		group by boardsn;
	
CREATE temporary table if not exists mac_statistic AS	
	select ap_mac,count(*) AS mac_count from "mac_info"
 		where "time" between  '${condition.start}' and  '${condition.end}'
		group by ap_mac;
	
select "groupTable"."groupId","groupTable"."groupName",sum(ue_count) 


AS ue_total_count,sum(mac_count) AS mac_total_count from public."groupTable"
	left outer join "LteDevTable" on "groupTable"."groupId" = "LteDevTable"."groupId"
	left outer join "ue_statistic" on "ue_statistic".boardsn = "LteDevTable".boardsn
	left outer join "wifi_devs" on "groupTable"."groupId" = "wifi_devs"."groupId"
	left outer join "mac_statistic" on "mac_statistic".ap_mac = "wifi_devs".ap_mac
	where "groupTable"."groupId" != 0 ${extraCondition}
	group by "groupTable"."groupId","groupTable"."groupName";
`;
        return _DBUtils.queryShutDownNow(sql);
    },

    /**
     * 获取所有站点和房间对应信息
     * @returns {*}
     */
    getRoomList() {
        let sql = `SELECT "groupTable"."groupId", "groupName", "groupAddress", coordinate, "creatTime", userid, comments, "groupDistrict",
		room_name,actuation_duration,room.create_time,aerial.create_time AS aerial_create_time,update_time,room_no,aerial_no,aerial.aerial_sn,
		array(select boardsn from "LteDevTable" where "LteDevTable"."groupId" = "groupTable"."groupId") 
	FROM public."groupTable" 
	left outer join room on "groupTable"."groupId" = room."groupId"
	left outer join aerial on "groupTable"."groupId" = aerial."groupId"
	where "groupTable"."groupId" != 0
	order by aerial_no;`;
        return _DBUtils.queryWithAsync(sql);
    },

    /**
     * 获取当前站点的所有房间信息
     * @param groupId 当前站点Id
     */
    getRoomInfo(groupId) {
        let sql = `SELECT room_no, room_name, create_time, update_time, actuation_duration, "groupId", aerial_no
	FROM public.room
	where "groupId" = ${groupId}
	order by room_no;`;
        return _DBUtils.queryShutDownNow(sql);
    },

    /**
     * 修改房间信息
     * @param condition 修改条件{room_name,actuationDuration,aerialNo,roomNo}
     * @return {*|{promise, client}}返回peomise和client
     */
    editRoomInfo(condition) {
        let sql = `UPDATE public.room
	SET room_name='${condition.roomName}', update_time=now(), actuation_duration=${condition.actuationDuration}, aerial_no=${condition.aerialNo}
	WHERE room_no=${condition.roomNo};`;
        return _DBUtils.queryShutDownNow(sql);
    },

    /**
     * 获取当前用户所拥有的所有站点信息，管理员返回所有站点信息
     * @param userid 用户ID
     * @return {*|{promise, client}}
     */
    getAllRoomInfo(userid) {
        let sql = '';
        if (userid === undefined) {
            sql = `SELECT room_no, room_name, create_time,room."groupId"
	FROM public.room order by room_no`
        } else {
            sql = `SELECT room_no, room_name, create_time
	FROM public.room
	inner join "groupTable" on room."groupId" = "groupTable"."groupId"
	where userid = ${+userid}
	order by room_no
;`
        }
        return _DBUtils.queryShutDownNow(sql);
    },

    /**
     * 获取天线的用户id
     * @param aerialSn 天线编号
     * @return {*|{promise, client}}
     */
    getUseridOfAerial(aerialSn) {
        let sql = `SELECT userid
	FROM public.aerial
	inner join "groupTable" on "groupTable"."groupId" = aerial."groupId"
	where aerial_sn = '${aerialSn}';`;
        return _DBUtils.queryShutDownNow(sql);
    },

    getGroupIdOfAerial(aerialSn) {
        let sql = `SELECT "groupId"
	FROM public.aerial
	where aerial_sn ='${aerialSn}';`;
        return _DBUtils.queryShutDownNow(sql);
    },

    getGroupIdOfRoomNo(roomNo) {
        let sql = `SELECT "groupId"
	FROM public.room
	where room_no ='${roomNo}';`;
        return _DBUtils.queryShutDownNow(sql);
    }
};

