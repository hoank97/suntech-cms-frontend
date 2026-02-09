import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/vi"

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (date: string | Date | number | null | undefined) => {
    if (!date) return "";
    return dayjs(date).tz("Asia/Bangkok").format("DD-MM-YYYY [lúc] HH:mm:ss");
};