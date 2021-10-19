import * as readline from 'readline';
import { Store } from '../src';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

{
  /**
   * Store creation
   */
  const store = new Store({
    rand: 0,
  });

  /**
   * Actions
   */
  const generateRandom = store.action('randomize');
  const check = store.action<number>('check');
  const loop = store.action('loop');

  /**
   * Effects
   */
  const print = store.effect<string>('print', ({ payload }) => {
    console.log(payload);
  });
  const askInput = store.effect<string>('ask-input', ({ payload, dispatch }) => {
    rl.question(payload, (input) => {
      dispatch(check(parseInt(input, 10)));
    });
  });
  const askContinuation = store.effect('ask-continue', ({ dispatch }) => {
    rl.question('Do you want to continue?', (input) => {
      if (input.toLowerCase() === 'y') {
        dispatch(loop());
      } else {
        rl.close();
        console.log(store.getExecutions());
        rl.on('close', () => {
          process.exit(0);
        });
      }
    });
  });

  /**
   * Cases
   */
  store
    .case(loop, (builder) => {
      builder.setState({ rand: 0 }).dispatch(generateRandom());
    })
    .case(generateRandom, (builder) => {
      builder.setState({ rand: Math.round(Math.random() * (6 - 1) + 1) });
      askInput('What is the number? ');
    })
    .case(check, ({ state, payload }) => {
      if (state.rand === payload) {
        print('Your answer was correct!');
      } else {
        print(`Your answer was incorrect. Guessed: ${payload}, number: ${state.rand}`);
      }

      askContinuation();
    });

  /**
   * Start
   */
  store.dispatch(loop());
}
