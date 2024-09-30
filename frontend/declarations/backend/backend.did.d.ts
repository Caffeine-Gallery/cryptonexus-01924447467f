import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Article {
  'id' : bigint,
  'url' : string,
  'title' : string,
  'source' : string,
  'body' : string,
  'publishedAt' : bigint,
  'category' : string,
}
export interface _SERVICE {
  'addArticle' : ActorMethod<
    [string, string, string, bigint, string, string],
    bigint
  >,
  'getAllArticles' : ActorMethod<[], Array<Article>>,
  'getArticlesByCategory' : ActorMethod<[string], Array<Article>>,
  'getCategories' : ActorMethod<[], Array<string>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
