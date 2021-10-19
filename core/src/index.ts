import {
  Case,
  ExecutedMeta,
  ExecutionType,
  DispatchAction,
  Builder,
  DispatchSource,
  GetActionPayload,
  ActionType,
  Effect,
} from './interface';

export class Store<State = any> {
  private readonly cases: Map<any, Case<State, any>> = new Map();
  private state: State;
  private executed: ExecutedMeta<State> = {
    list: [],
    state(executed) {
      this.list.push({
        type: ExecutionType.STATE,
        ...executed,
      });
    },
    action(executed) {
      this.list.push({
        type: ExecutionType.ACTION,
        ...executed,
      });
    },
    effect(executed) {
      this.list.push({
        type: ExecutionType.EFFECT,
        ...executed,
      });
    },
    dispatch(executed) {
      this.list.push({
        type: ExecutionType.DISPATCH,
        ...executed,
      });
    },
  };

  constructor(state?: State, cases?: Map<any, Case<State, any>>) {
    this.state = state;

    if (cases) {
      this.cases = cases;
    }
  }

  protected setState(state: Partial<State> | void) {
    const newState = {
      ...this.state,
      ...state,
    };
    this.state = newState;
    return newState;
  }

  protected builder<Type, Payload>(action: DispatchAction<Type, Payload>): Builder<State, Payload> {
    const $this = this;

    return {
      setState(state: Partial<State> | (({ state: State, payload: Payload }) => Partial<State>)) {
        let newState: Partial<State>;

        if (typeof state === 'function') {
          newState = state({ state: $this.state, payload: action.payload });
        } else {
          newState = state;
        }

        const previousState = { ...this.state };
        const nextState = $this.setState(newState);

        $this.executed.state({
          name: action.type as unknown as string,
          previousState,
          nextState,
        });

        $this.setState(newState);
        return this;
      },
      state: this.state,
      payload: action.payload,
      dispatch(actionToDispatch: DispatchAction<any, any>) {
        $this._dispatch(
          {
            name: action.type,
            type: ExecutionType.ACTION,
          },
          actionToDispatch
        );
        return this;
      },
    };
  }

  public getState() {
    return this.state;
  }

  public getCases() {
    return this.cases;
  }

  public dispatch = <Type, Payload>(action: DispatchAction<Type, Payload>) => {
    this.executed.dispatch({
      name: action.type as unknown as string,
      payload: action.payload,
      source: {
        name: 'store',
        type: ExecutionType.DISPATCH,
      },
    });
    this._dispatch(null, action);
  };

  private _dispatch = <Type, Payload>(
    source: DispatchSource | null,
    action: DispatchAction<Type, Payload>
  ) => {
    const actionCase = this.cases.get(action.type);
    if (actionCase) {
      actionCase(this.builder<typeof action.type, GetActionPayload<typeof action>>(action));
      if (source !== null) {
        this.executed.action({
          name: action.type as unknown as string,
          payload: action.payload,
          source,
        });
      }
    } else {
      throw new Error(`No action for case: "${action.type}". Please add a case to the store.`);
    }
  };

  public action = <Payload = never>(type: string) => {
    const createdAction = (payload: Payload) => {
      let newPayload: any;

      if (typeof payload === 'function') {
        newPayload = payload(this.state);
      } else {
        newPayload = payload;
      }

      const dispatchAction = {
        type,
        payload: newPayload,
      } as DispatchAction<typeof type, Payload>;

      return dispatchAction;
    };

    createdAction.type = type;
    return createdAction as ActionType<typeof type, Payload>;
  };

  public effect = <Payload = never>(name: string, effect: Effect<State, Payload>) => {
    const $this = this;
    return function CreatedEffect(payload?: Payload) {
      $this.executed.effect({
        name,
        payload,
      });

      effect({
        payload,
        state: $this.state,
        dispatch: $this._dispatch.bind($this, {
          source: name,
          type: ExecutionType.EFFECT,
        }),
      });
    };
  };

  public case = <Action>(action: Action, effect: Case<State, GetActionPayload<Action>>) => {
    this.cases.set((action as any).type, effect);
    return this;
  };

  public combine = <StoreType extends Store<any>>(store: StoreType, override = true) => {
    const newState = {
      ...this.getState(),
      ...store.getState(),
    };

    const newCases = new Map();

    this.getCases().forEach((effect, type) => {
      newCases.set(type, effect);
    });

    if (override) {
      store.getCases().forEach((effect, type) => {
        newCases.set(type, effect);
      });
    }

    return new Store(newState, newCases as Map<any, Case<typeof newState, any>>);
  };

  public getExecutions = () => {
    return this.executed.list;
  };
}
