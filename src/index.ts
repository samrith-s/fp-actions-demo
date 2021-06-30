interface ActionType<Type, Payload> {
  (
    payload?: Payload extends Function | never ? never : Payload // | PayloadFunction<State, Payload>
  ): DispatchAction<Type, Payload>;
  type: Type;
}

interface DispatchAction<Type, Payload> {
  type: Type;
  payload: Payload;
}

// @ts-ignore
type GetActionPayload<Action> = ReturnType<Action>['payload'];

interface CaseEffectArgs<State, Action> {
  state: State;
  payload: GetActionPayload<Action>;
  setState: (state?: Partial<State>) => void;
}

type CaseEffect<State, Action> = (args: CaseEffectArgs<State, Action>) => void;

export class Store<State = any> {
  private readonly cases: Map<any, CaseEffect<State, any>> = new Map();
  private state: State;

  constructor(state?: State, cases?: Map<any, CaseEffect<State, any>>) {
    this.state = state;

    if (cases) {
      this.cases = cases;
    }
  }

  protected setState(state: Partial<State> | void) {
    this.state = {
      ...this.state,
      ...state,
    };
  }

  public getState() {
    return this.state;
  }

  public getCases() {
    return this.cases;
  }

  public dispatch = <Type, Payload>(action: DispatchAction<Type, Payload>) => {
    const effect = this.cases.get(action.type);
    if (effect) {
      effect({
        state: this.state,
        payload: action.payload,
        setState: this.setState.bind(this),
      });
    } else {
      throw new Error(`No effect for case: "${action.type}". Please add a case to the store.`);
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
      this.dispatch(dispatchAction);

      return dispatchAction;
    };

    createdAction.type = type;
    return createdAction as ActionType<typeof type, Payload>;
  };

  public case = <Action>(action: Action, effect: CaseEffect<State, Action>) => {
    this.cases.set((action as any).type, effect);
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

    store.getCases().forEach((effect, type) => {
      if (newCases.get(type) && override) {
        newCases.set(type, effect);
      }
    });

    return new Store(newState, newCases as Map<any, CaseEffect<typeof newState, any>>);
  };
}
