import { PythonFunction } from '../../nodes/PythonFunction/PythonFunction.node';

test('Hello', async () => {
	expect('Hello').toStrictEqual('Hello');
});

test('Node has two outputs', () => {
	const node = new PythonFunction();
	expect(node.description.outputs).toHaveLength(2);
	expect(node.description.outputs[0]).toBe('main');
	expect(node.description.outputs[1]).toBe('error');
});
