import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js'
import inquirer from 'inquirer';
import { HolidayManagmentRepositoryFactory } from './repositories.js';
import { HolidayManagmentRepositoryInMemoryFactory } from './repositories-in-memory.js';
import { HolidayRequest, HolidayRules, Period } from './models.js';

let repositoryFactory: HolidayManagmentRepositoryFactory = new HolidayManagmentRepositoryInMemoryFactory();
let employeeRepository = repositoryFactory.createEmployeeRepository();
let holidayRequestRepository = repositoryFactory.createHolidayRequestRepository();
let holidayRulesRepository = repositoryFactory.createHolidayRulesRepository();
let actions = [addEmployee, viewEmployees, submitHolidayRequest, viewHolidayRequests, validateHolidayRequests]

dayjs.extend(utc);
holidayRulesRepository.set({
    maxConsecutiveDays: 20,
    blackoutPeriods: [
        { from: dayjs.utc('2024-03-01'), to: dayjs.utc('2024-03-31') },
        { from: dayjs.utc('2024-09-01'), to: dayjs.utc('2024-09-01') }
    ]
})
displayMainMenu();

function displayMainMenu() {
    inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'Choose an action',
            choices: [
                { value: 0, name: 'Add a new employee' },
                { value: 1, name: 'View a list of employees with their remaining holidays' },
                { value: 2, name: 'Submit a holiday request' },
                { value: 3, name: 'View a list of pending holiday requests' },
                { value: 4, name: 'Approve or reject a pending holiday request' }
            ]
        }])
        .then(answers => actions[answers.action]());
}

function addEmployee() {
    inquirer.prompt([{ name: 'name', message: 'Name:' }])
        .then(answers => {
            employeeRepository.add({name: answers.name});
            displayMainMenu();
        });
}

function viewEmployees() {
    let employees = employeeRepository.getAll();
    if (!employees.length)
        console.log('Nothing to display');
    for (let employee of employees) {
        console.log(employee.name);
        for (let holiday of holidayRequestRepository.getApprovedByEmployeeId(employee.id))
            console.log(`\t${formatPeriod(holiday.period)}`);
    }
    displayMainMenu();
}

function submitHolidayRequest() {
    let employees = employeeRepository.getAll();
    if (!employees.length) {
        console.log('Nothing to display');
        displayMainMenu();
        return;
    }
    inquirer.prompt([ 
            {
                type: 'list',
                name: 'employeeId',
                message: 'Choose an employee',
                choices: employees.map(e => ({ value: e.id,nname: e.name }))
            },
            { name: 'startDate', message: 'Start date (yyyy-mm-dd):' },
            { name: 'endDate', message: 'End date (yyyy-mm-dd):' }
        ])
        .then(answers => {
            let holidayRequest: HolidayRequest = {
                period: {
                    from: dayjs.utc(answers.startDate),
                    to: dayjs.utc(answers.endDate)
                },
                status: 'pending',
                employeeId: answers.employeeId
            };
            holidayRequest.status = checkHolidayRequest(holidayRequest, holidayRulesRepository.get()) ? 'approved' : 'pending';
            holidayRequestRepository.add(holidayRequest);
            displayMainMenu();
        })
}

function validateHolidayRequests() {
    let pending = holidayRequestRepository.getPending();
    if (!pending.length) {
        console.log('Nothing to validate');
        displayMainMenu();
        return;
    }
    inquirer.prompt([
            {
                type: 'list',
                name: 'requestId',
                message: 'Choose a holiday request',
                choices: pending.map(r => ({
                    value: r.id,
                    name: `$${formatPeriod(r.period)} (${employeeRepository.getById(r.employeeId).name})`
                }))
            },
            {
                type: 'list',
                name: 'status',
                message: 'Choose status',
                choices: [
                    { value: 'approved', name: 'Approve' },
                    { value: 'rejected', name: 'Reject' }
                ]
            }
        ])
        .then(answers => {
            holidayRequestRepository.setStatus(answers.requestId, answers.status);
            displayMainMenu();
        })
}

function viewHolidayRequests() {
    let pending = holidayRequestRepository.getPending();
    if (!pending.length)
        console.log('Nothing to display');
    for (let request of pending)
        console.log(`${formatPeriod(request.period)} (${employeeRepository.getById(request.employeeId).name})`)
    displayMainMenu();
}

function checkHolidayRequest(holidayRequest: HolidayRequest, holidayRules: HolidayRules): boolean {
    if (holidayRequest.period.to.diff(holidayRequest.period.from, 'day') > holidayRules.maxConsecutiveDays)
        return false;
    for (let blackout of holidayRules.blackoutPeriods)
        if (holidayRequest.period.from.isAfter(blackout.from) &&
            holidayRequest.period.from.isBefore(blackout.to) || 
            holidayRequest.period.to.isAfter(blackout.from) &&
            holidayRequest.period.to.isBefore(blackout.to))
            return false;
    return true;
}

function formatPeriod(period: Period) {
    return `${period.from.format('YYYY-MM-DD')} ~ ${period.to.format('YYYY-MM-DD')}`;
}
