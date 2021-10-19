export interface DispatchAction<Type, Payload> {
  type: Type;
  payload: Payload;
}

export interface ActionType<Type, Payload> {
  (payload?: Payload extends Function | never ? never : Payload): DispatchAction<Type, Payload>;
  type: Type;
}

// @ts-ignore
export type GetActionPayload<Action> = ReturnType<Action>['payload'];

export interface Builder<State, Payload> {
  state: State;
  payload: Payload;
  setState(
    state: Partial<State> | (({ state: State, payload: Payload }) => Partial<State>)
  ): Builder<State, Payload>;
  dispatch(action: DispatchAction<any, any>): Builder<State, Payload>;
}

export interface Effector<State, Payload> {
  payload: Payload;
  state: State;
  dispatch(action: DispatchAction<any, any>): void;
}

export type Case<State, Payload> = (builder: Builder<State, Payload>) => void;
export type Effect<State, Payload> = (props: Effector<State, Payload>) => void;

export enum ExecutionType {
  ACTION = 'action',
  EFFECT = 'effect',
  STATE = 'state',
  DISPATCH = 'dispatch',
}

export interface ExecutedAction {
  type: ExecutionType.ACTION;
  name: string;
  source: DispatchSource;
  payload: any;
}

export interface ExecutedEffect {
  type: ExecutionType.EFFECT;
  name: string;
  payload: any;
}

export interface ExecutedState<State> {
  type: ExecutionType.STATE;
  name: string;
  previousState: State;
  nextState: State;
}

export interface ExecutedDispatch {
  type: ExecutionType.DISPATCH;
  name: string;
  payload: any;
  source: DispatchSource;
}

export type Executed<State> =
  | ExecutedAction
  | ExecutedEffect
  | ExecutedState<State>
  | ExecutedDispatch;

export interface ExecutedMeta<State> {
  list: Executed<State>[];
  state(executed: Omit<ExecutedState<State>, 'type'>): void;
  action(executed: Omit<ExecutedAction, 'type'>): void;
  effect(executed: Omit<ExecutedEffect, 'type'>): void;
  dispatch(executed: Omit<ExecutedDispatch, 'type'>): void;
}

export interface DispatchSource {
  name: any;
  type: ExecutionType;
}
