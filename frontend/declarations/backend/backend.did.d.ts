import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Comment {
  'id' : bigint,
  'content' : string,
  'articleId' : string,
  'timestamp' : bigint,
}
export interface _SERVICE {
  'addComment' : ActorMethod<[string, string], bigint>,
  'getAllComments' : ActorMethod<[], Array<Comment>>,
  'getComments' : ActorMethod<[string], Array<Comment>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
