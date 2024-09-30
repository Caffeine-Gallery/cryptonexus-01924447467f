import Bool "mo:base/Bool";
import Hash "mo:base/Hash";
import Int "mo:base/Int";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor {
    // Define the structure for a news article
    public type Article = {
        id: Nat;
        title: Text;
        body: Text;
        category: Text;
        publishedAt: Int;
        source: Text;
        url: Text;
    };

    private stable var nextId: Nat = 0;
    private stable var articlesEntries: [(Nat, Article)] = [];
    private var articles = HashMap.HashMap<Nat, Article>(0, Nat.equal, Nat.hash);

    system func preupgrade() {
        articlesEntries := Iter.toArray(articles.entries());
    };

    system func postupgrade() {
        articles := HashMap.fromIter<Nat, Article>(articlesEntries.vals(), 1, Nat.equal, Nat.hash);
    };

    // Add a new article
    public func addArticle(title: Text, body: Text, category: Text, publishedAt: Int, source: Text, url: Text) : async Nat {
        let id = nextId;
        nextId += 1;
        let article: Article = {
            id;
            title;
            body;
            category;
            publishedAt;
            source;
            url;
        };
        articles.put(id, article);
        id
    };

    // Get all articles
    public query func getAllArticles() : async [Article] {
        Iter.toArray(articles.vals())
    };

    // Get articles by category
    public query func getArticlesByCategory(category: Text) : async [Article] {
        let filtered = Buffer.Buffer<Article>(0);
        for (article in articles.vals()) {
            if (Text.equal(article.category, category)) {
                filtered.add(article);
            };
        };
        Buffer.toArray(filtered)
    };

    // Get categories
    public query func getCategories() : async [Text] {
        let categoriesSet = HashMap.HashMap<Text, Bool>(0, Text.equal, Text.hash);
        for (article in articles.vals()) {
            categoriesSet.put(article.category, true);
        };
        Iter.toArray(categoriesSet.keys())
    };
}
