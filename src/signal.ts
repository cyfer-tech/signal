import { immut, newVal } from "@cyftec/jsmut";
import type { MaybeSignal, Signal, SignalSubscriber } from "./types";

let subscriber: SignalSubscriber = null;

export const signal = <T>(value: T): Signal<T> => {
  let _value = immut(value);
  const subscriptions = new Set<SignalSubscriber>();

  return {
    type: "signal",
    get value() {
      if (subscriber) subscriptions.add(subscriber);
      return newVal(_value);
    },
    set value(newValue: T) {
      if (newValue === _value) return;
      _value = immut(newValue);
      subscriptions.forEach((callback) => callback && callback());
    },
  };
};

export const effect = (fn: () => void): void => {
  subscriber = fn;
  fn();
  subscriber = null;
};

export const derived = <T>(signalValueGetter: () => T): Signal<T> => {
  const derivedSignal = signal<T>(null as T);
  effect(() => {
    derivedSignal.value = signalValueGetter();
  });

  return derivedSignal;
};

export const valueIsSignal = (value: MaybeSignal<any>): boolean =>
  !!(value?.type === "signal");
