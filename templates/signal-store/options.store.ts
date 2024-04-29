import { linkedSignal } from '@angular/core';
import { signalMethod, signalStore, withLinkedState, withState } from '@ngrx/signals';

type Option = { id: number; label: string };

// withLinkedState: state that follows its source and stays writable, replacing a hand-written effect.
export const OptionsStore = signalStore(
  withState({ options: [] as Option[] }),
  withLinkedState(({ options }) => ({
    selectedOption: linkedSignal<Option[], Option | undefined>({
      source: options,
      computation: (next, previous) => next.find(o => o.id === previous?.value?.id) ?? next[0],
    }),
  })),
);

// signalMethod: react to a signal without pulling in rxMethod when no operators are needed.
export const logFilter = signalMethod<string>(filter => console.info(filter));
