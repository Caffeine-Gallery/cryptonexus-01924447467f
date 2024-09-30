import Hash "mo:base/Hash";

import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

actor News {
    type ArticleId = Text;
    type Comment = Text;

    let comments = HashMap.HashMap<ArticleId, [Comment]>(0, Text.equal, Text.hash);

    public func addComment(articleId : ArticleId, comment : Comment) : async () {
        switch (comments.get(articleId)) {
            case (null) {
                comments.put(articleId, [comment]);
            };
            case (?existingComments) {
                comments.put(articleId, Array.append(existingComments, [comment]));
            };
        };
    };

    public query func getComments(articleId : ArticleId) : async [Comment] {
        switch (comments.get(articleId)) {
            case (null) { [] };
            case (?existingComments) { existingComments };
        };
    };
};
