export const idlFactory = ({ IDL }) => {
  const Comment = IDL.Record({
    'id' : IDL.Nat,
    'articleId' : IDL.Text,
    'content' : IDL.Text,
    'timestamp' : IDL.Int,
  });
  return IDL.Service({
    'addComment' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'getAllComments' : IDL.Func([], [IDL.Vec(Comment)], ['query']),
    'getComments' : IDL.Func([IDL.Text], [IDL.Vec(Comment)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
