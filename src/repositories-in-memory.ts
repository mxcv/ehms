import { Employee, HolidayRequest, HolidayRequestStatus, HolidayRules } from './models.js';
import { EmployeeRepository, HolidayRequestRepository, HolidayRulesRepository, HolidayManagmentRepositoryFactory } from './repositories.js';

class EmployeeRepositoryInMemory implements EmployeeRepository {
    private employees: Employee[] = [];
    private lastId = 0;

    getAll(): Employee[] {
        return this.employees;
    }

    getById(id: number): Employee {
        return this.employees.find(e => e.id === id);
    }

    add(employee: Employee): void {
        employee.id = ++this.lastId;
        this.employees.push(employee);
    }
}

class HolidayRequestRepositoryInMemory implements HolidayRequestRepository {
    private holidayRequests: HolidayRequest[] = [];
    private lastId = 0;

    getPending(): HolidayRequest[] {
        return this.holidayRequests.filter(r => r.status === 'pending');
    }

    getApprovedByEmployeeId(employeeId: number): HolidayRequest[] {
        return this.holidayRequests.filter(r => r.employeeId === employeeId && r.status === 'approved');
    }

    add(holidayRequest: HolidayRequest): void {
        holidayRequest.id = ++this.lastId;
        this.holidayRequests.push(holidayRequest);
    }

    setStatus(id: number, status: HolidayRequestStatus): void {
        this.holidayRequests.find(r => r.id === id).status = status;
    }
}

class HolidayRulesRepositoryInMemory implements HolidayRulesRepository {
    private holidayRules: HolidayRules = null;

    get(): HolidayRules {
        return this.holidayRules;
    }

    set(holidayRules: HolidayRules): void {
        this.holidayRules = holidayRules;
    }
}

class HolidayManagmentRepositoryInMemoryFactory implements HolidayManagmentRepositoryFactory {
    createEmployeeRepository(): EmployeeRepository {
        return new EmployeeRepositoryInMemory();
    }
    createHolidayRequestRepository(): HolidayRequestRepository {
        return new HolidayRequestRepositoryInMemory();
    }
    createHolidayRulesRepository(): HolidayRulesRepository {
        return new HolidayRulesRepositoryInMemory();
    }
}

export { HolidayManagmentRepositoryInMemoryFactory }
