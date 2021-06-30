import * as readline from 'readline';
import { Store } from '.';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

{
  const store = new Store({
    rand: 0,
  });

  const generateRandom = store.action('randomize');
  const setUserGuess = store.action<string>('setUserGuess');
  const check = store.action<number>('check');
  const loop = store.action('loop');
  const exit = store.action('exit');

  store.case(loop, ({ setState }) => {
    setState({ rand: 0 });
    generateRandom();
  });

  store.case(generateRandom, ({ setState }) => {
    setState({ rand: Math.round(Math.random() * (6 - 1) + 1) });
    setUserGuess('What is the number?');
  });

  store.case(setUserGuess, ({ payload }) => {
    rl.question(payload, (input) => {
      check(parseInt(input, 10));
    });
  });

  store.case(check, ({ state, payload }) => {
    if (state.rand === payload) {
      console.log('Your answer was correct!');
    } else {
      console.log(`Your answer was incorrect. Guessed: ${payload}, number: ${state.rand}`);
    }

    rl.question('Do you want to continue? y/n', (input) => {
      if (input.toLowerCase() === 'y') {
        loop();
      } else {
        exit();
      }
    });
  });

  store.case(exit, () => {
    rl.close();
    rl.on('close', () => process.exit(0));
  });

  loop();
}
