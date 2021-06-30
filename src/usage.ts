import { Store } from '.';

const s = new Store({
  count: 0,
});

const increment = s.action<number>('increment');
const decrement = s.action<number>('decrement');

s.case(increment, ({ setState, state, payload }) => {
  setState({ count: state.count + payload });
});

s.case(decrement, ({ setState, state, payload }) => {
  setState({ count: state.count - payload });
});

console.log(s.getState());

increment(1);

console.log(s.getState());

decrement(10);

console.log(s.getState());
