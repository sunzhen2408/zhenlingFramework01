/*getAnalysisDataByTimeInterval*/
/*
//筛选当前用户id所拥有的boardsn，并存为临时表
CREATE temporary table temp_boardsn AS
                SELECT boardsn from "LteDevTable"
                    join "groupTable" on "groupTable"."groupId" = "LteDevTable"."groupId"
                    WHERE "groupTable".userid = 0;
CREATE temporary TABLE temp_imsi AS
                SELECT  imsi,COUNT(imsi),'2018-06-04 00:00:00'||'2018-06-05 00:00:00' AS times
				    FROM public."ueInfo"
				    WHERE "time" BETWEEN '2018-06-04 00:00:00' AND '2018-06-05 00:00:00' AND boardsn = any (SELECT * FROM temp_boardsn)
				    GROUP BY imsi
				    UNION ALL
                SELECT  imsi,COUNT(imsi),'2018-06-03 00:00:00'||'2018-06-04 00:00:00' AS times
				    FROM public."ueInfo"
				    WHERE "time" BETWEEN '2018-06-03 00:00:00' AND '2018-06-04 00:00:00' AND boardsn = any (SELECT * FROM temp_boardsn)
				    GROUP BY imsi
				    UNION ALL
                SELECT  imsi,COUNT(imsi),'2018-06-02 00:00:00'||'2018-06-03 00:00:00' AS times
				    FROM public."ueInfo"
				    WHERE "time" BETWEEN '2018-06-02 00:00:00' AND '2018-06-03 00:00:00' AND boardsn = any (SELECT * FROM temp_boardsn)
				    GROUP BY imsi;

        SELECT imsis.imsi,count(imsis.imsi) AS counts,array(
            SELECT counts."count" FROM  temp_imsi AS counts  WHERE counts.imsi=imsis.imsi) as name
            ,array(SELECT time_interval."times" FROM  temp_imsi AS time_interval  WHERE time_interval.imsi=imsis.imsi) as times
            from temp_imsi imsis
            group by imsi
            order by counts desc;
*/