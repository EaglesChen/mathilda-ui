// src/utils/date.ts
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/zh-cn' // 中文本地化

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('zh-cn')


export const formatDate = {
    // 完整日期时间
    datetime: (value: string | Date) =>
        dayjs(value).isValid()
            ? dayjs(value).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
            : '无效时间',

    // 日期简写（今天显示时间）
    smartDate: (value: string | Date) => {
        if (!dayjs(value).isValid()) return '无效时间'

        const today = dayjs().startOf('day')
        const targetDate = dayjs(value)

        return targetDate.isSame(today, 'd')
            ? targetDate.format('HH:mm')
            : targetDate.format('MM-DD HH:mm')
    },

    // 相对时间（3天前）
    fromNow: (value: string | Date) =>
        dayjs(value).isValid() ? dayjs(value).fromNow() : '无效时间'
}