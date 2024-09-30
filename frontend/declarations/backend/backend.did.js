export const idlFactory = ({ IDL }) => {
  const Article = IDL.Record({
    'id' : IDL.Nat,
    'url' : IDL.Text,
    'title' : IDL.Text,
    'source' : IDL.Text,
    'body' : IDL.Text,
    'publishedAt' : IDL.Int,
    'category' : IDL.Text,
  });
  return IDL.Service({
    'addArticle' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Int, IDL.Text, IDL.Text],
        [IDL.Nat],
        [],
      ),
    'getAllArticles' : IDL.Func([], [IDL.Vec(Article)], ['query']),
    'getArticlesByCategory' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(Article)],
        ['query'],
      ),
    'getCategories' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
