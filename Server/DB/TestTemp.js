const DBRouter = require('./DBRouter');

let conditions = {
    userid: 0,
    timeIntervals: [{
        start: '2018-06-04 00:00:00',
        end: '2018-06-05 00:00:00',
        label: '时间点1'
    }, {
        start: '2018-06-03 00:00:00',
        end: '2018-06-04 00:00:00',
        label: '时间点2'
    }, {
        start: '2018-06-02 00:00:00',
        end: '2018-06-03 00:00:00',
    }, {
        start: '2018-05-03 00:00:00',
        end: '2018-06-04 00:00:00',
        label: '时间点3'
    }, {
        start: '2018-04-03 00:00:00',
        end: '2018-05-04 00:00:00',
        label: '时间点4'
    }, {
        start: '2018-03-03 00:00:00',
        end: '2018-04-04 00:00:00',
        label: '时间点5'
    }]
};
DBRouter.getAnalysisDataByTimeInterval(conditions).then(dbRes => {
    let dataSource = [];
    if (dbRes[2].rowCount > 0) {
        dataSource = dbRes[2].rows;
        dataSource = dataSource.map(item => {
            let detailInfo = [];
            let totalNum = 0;
            /** @namespace item.matchNum 匹配次数*/
            for (let i = 0; i < item.matchNum; i++) {
                let timeItvl = item.timeIntervals[i].split(',');
                totalNum += item.repNums[i];
                detailInfo.push({
                    start: timeItvl[0],
                    end: timeItvl[1],
                    repNum: item.repNums[i]
                });
            }
            return {
                imsi: item.imsi,
                totalNum: totalNum,
                detailInfo: detailInfo
            };
        });
    }
});


