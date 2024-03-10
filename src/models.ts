import { Dayjs } from "dayjs"

interface Employee {
    id?: number,
    name: string
}

interface HolidayRequest {
    id?: number,
    period: Period,
    status: HolidayRequestStatus,
    employeeId: number
}

interface HolidayRules {
    maxConsecutiveDays: number,
    blackoutPeriods: Period[]
}

interface Period {
    from: Dayjs,
    to: Dayjs
}

type HolidayRequestStatus = 'pending' | 'approved' | 'rejected';

export {
    Employee,
    HolidayRequest,
    HolidayRules,
    Period,
    HolidayRequestStatus
}
