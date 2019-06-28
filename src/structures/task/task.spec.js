const { Task, TaskStatus, TaskEvents } = require('./task');

describe('Task', () => {
    test('task creation', () => {
        const task = new Task({ id: 1, type: 'test' });
        expect(task.id).toBe(1);
        expect(task.type).toBe('test');
        expect(task.data).toBe(undefined);
    });

    test('task created with waiting status', () => {
        const task = new Task({ id: 1, type: 'test' });
        expect(task.status).toBe(TaskStatus.waiting);
    });

    test('task start', () => {
        const task = new Task({ id: 1, type: 'test' });
        const spy = jest.spyOn(task, 'emit');
        task.start();
        expect(task.status).toBe(TaskStatus.running);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(TaskEvents.start, task);
    });

    test('task finish', () => {
        const task = new Task({ id: 1, type: 'test' });
        const spy = jest.spyOn(task, 'emit');
        const data = { r: 1 };
        task.start();
        task.end(null, data);
        expect(task.status).toBe(TaskStatus.finished);
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith(TaskEvents.success, task, null, data);
    });

    test('task finish', () => {
        const task = new Task({ id: 1, type: 'test' });
        const spy = jest.spyOn(task, 'emit');
        const err = new Error();
        task.start();
        task.end(err, null);
        expect(task.status).toBe(TaskStatus.error);
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith(TaskEvents.fail, task, err, null);
    });
});
