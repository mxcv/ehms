import { Employee, HolidayRequest, HolidayRequestStatus, HolidayRules } from './models.js'

interface EmployeeRepository {
    getAll(): Employee[];
    getById(id: number): Employee;
    add(employee: Employee): void;
}

interface HolidayRequestRepository {
    getPending(): HolidayRequest[];
    getApprovedByEmployeeId(employeeId: number): HolidayRequest[];
    add(holidayRequest: HolidayRequest): void;
    setStatus(id: number, status: HolidayRequestStatus): void;
}

interface HolidayRulesRepository {
    get(): HolidayRules;
    set(holidayRules: HolidayRules) : void;
}

interface HolidayManagmentRepositoryFactory {
    createEmployeeRepository(): EmployeeRepository;
    createHolidayRequestRepository(): HolidayRequestRepository;
    createHolidayRulesRepository(): HolidayRulesRepository;
}

export {
    EmployeeRepository,
    HolidayRequestRepository,
    HolidayRulesRepository,
    HolidayManagmentRepositoryFactory
}
