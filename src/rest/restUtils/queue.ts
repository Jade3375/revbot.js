interface DeferredPromise {
  resolve(): void;
  promise: Promise<void>;
}

export class Queue extends Array<DeferredPromise> {
  get remaining(): number {
    return this.length;
  }

  wait(): Promise<void> {
    const next = this[this.length - 1]?.promise ?? Promise.resolve();

    let resolve: () => void;

    const promise = new Promise<void>((res) => (resolve = res));

    this.push({ resolve: resolve!, promise });

    return next;
  }

  next(): void {
    this.shift()?.resolve();
  }
}
