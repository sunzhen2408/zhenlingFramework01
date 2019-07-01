const moment = require('moment');
const silly_dateTime = require('silly-datetime');
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

module.exports = {
    /**
     * 将毫秒转换为日期格式 2010-10-20 10:00:00
     * @param ns 毫秒
     */
    getLocalTime: (ns) => {
        return silly_dateTime.format(ns, dataStyle);
    },

    /**
     * 获取当前时间  格式为2010-10-20 10:00:00
     */
    getCurrentTime: () => {
        return silly_dateTime.format(new Date(), dataStyle);
    },

    TIME_FORMAT: TIME_FORMAT,

    getTimeEnum(type, start) {
        let intervals = [];
        switch (type) {
            case 'today': {
                for (let i = 0; i <= 23; i++) {
                    intervals.push(`${i}时`);
                }
                break;
            }
            case 'week': {
                intervals = ['周一', '周二', '周三', '周四', '周五', '周六', '周日',];
                break;
            }
            case 'month': {
                let m_start = moment(start);
                start = m_start.format('MM-DD');
                for (let i = 0; i < m_start.daysInMonth(); i++) {
                    if (i !== 0) {
                        intervals.push(m_start.add(1, 'day').format('MM-DD'));
                    } else {
                        intervals.push(m_start.format('MM-DD'));
                    }
                }
                break;
            }
            case 'year': {
                intervals = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
                break;
            }
            default: {
                let m_start = moment(start);
                start = m_start.format('MM-DD');
                for (let i = 0; i < m_start.daysInMonth(); i++) {
                    if (i !== 0) {
                        intervals.push(m_start.add(1, 'day').format('MM-DD'));
                    } else {
                        intervals.push(m_start.format('MM-DD'));
                    }
                }
                break;
            }
        }
        return intervals;
    }
};