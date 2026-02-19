import { Builder, Sync } from "@purifyjs/core";

export type PromiseOrValue<T> = Promise<T> | T;
export type BuilderOrNode<T extends Node> = Builder<T> | T;
export type SyncOrValue<T> = Sync<T> | T;
