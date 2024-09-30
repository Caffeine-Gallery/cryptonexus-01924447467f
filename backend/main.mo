import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Order "mo:base/Order";
import Int "mo:base/Int";

actor {
  type Comment = {
    id: Nat;
    articleId: Text;
    content: Text;
    timestamp: Int;
  };

  private stable var nextCommentId : Nat = 0;
  private var comments = HashMap.HashMap<Nat, Comment>(0, Nat.equal, Nat.hash);

  public func addComment(articleId: Text, content: Text) : async Nat {
    let id = nextCommentId;
    let comment : Comment = {
      id = id;
      articleId = articleId;
      content = content;
      timestamp = Time.now();
    };
    comments.put(id, comment);
    nextCommentId += 1;
    id
  };

  public query func getComments(articleId: Text) : async [Comment] {
    let articleComments = Array.filter<Comment>(Iter.toArray(comments.vals()), func (c: Comment) : Bool {
      c.articleId == articleId
    });
    Array.sort(articleComments, func (a: Comment, b: Comment) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    })
  };

  public query func getAllComments() : async [Comment] {
    Iter.toArray(comments.vals())
  };

  system func preupgrade() {
    // Implement if needed
  };

  system func postupgrade() {
    // Implement if needed
  };
}
