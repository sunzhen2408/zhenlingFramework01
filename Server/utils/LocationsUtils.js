const DBUtils = require('../DB/DBUtils');
const {getPhoneNum} = require('./ImsiUtils');
let sql = `
select imsi from "ueInfo"
where location is not null
group by imsi;`;
DBUtils.queryWithAsync(sql).then(res => {
    let succ_count = 0;
    let cmccCount_succ = 0;
    let cuccCount_succ = 0;
    let ctccCount_succ = 0;
    res.rows.forEach((item, index) => {
        let phone_num = getPhoneNum(item.imsi);
        switch (item.carrieroperator) {
            case '中国移动':
                if (phone_num !== '') {
                    cmccCount_succ += 1;
                }
                cmccCount += 1;
                break;
            case '中国联通':
                if (phone_num !== '') {
                    cuccCount_succ += 1;
                }
                cuccCount += 1;
                break;
            case '中国电信':
                if (phone_num !== '') {
                    ctccCount_succ += 1;
                }
                ctccCount += 1;
                break;
        }

        DBUtils.queryWithAsync(`UPDATE public."ueInfo"
	SET predicted_phone_num='${phone_num + '****'}'
	WHERE imsi = '${item.imsi}';`).then(dbRes => {
            succ_count += 1;
            if (index > res.rowCount - 4) {
                console.log(`共计${res.rowCount}条`);
                console.log(`更新成功${succ_count}条`);
                console.log(`移动分析成功${cmccCount_succ}条`);
                console.log(`联通分析成功${cuccCount_succ}条`);
                console.log(`电信分析成功${ctccCount_succ}条`);
            }
        });
    });
});