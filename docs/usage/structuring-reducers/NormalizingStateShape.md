---
id: normalizing-state-shape
title: Normalizing State Shape
description: 'Structuring Reducers > Normalizing State Shape: Why and how to store data items for lookup based on ID'
---

# Normalizing State Shape

Many applications deal with data that is nested or relational in nature. For example, a blog editor could have many Posts, each Post could have many Comments, and both Posts and Comments would be written by a User. Data for this kind of application might look like:

```js
const blogPosts = [
  {
    id: 'post1',
    author: { username: 'user1', name: 'User 1' },
    body: '......',
    comments: [
      {
        id: 'comment1',
        author: { username: 'user2', name: 'User 2' },
        comment: '.....'
      },
      {
        id: 'comment2',
        author: { username: 'user3', name: 'User 3' },
        comment: '.....'
      }
    ]
  },
  {
    id: 'post2',
    author: { username: 'user2', name: 'User 2' },
    body: '......',
    comments: [
      {
        id: 'comment3',
        author: { username: 'user3', name: 'User 3' },
        comment: '.....'
      },
      {
        id: 'comment4',
        author: { username: 'user1', name: 'User 1' },
        comment: '.....'
      },
      {
        id: 'comment5',
        author: { username: 'user3', name: 'User 3' },
        comment: '.....'
      }
    ]
  }
  // and repeat many times
]
```

Notice that the structure of the data is a bit complex, and some of the data is repeated. This is a concern for several reasons:

- When a piece of data is duplicated in several places, it becomes harder to make sure that it is updated appropriately.
- Nested data means that the corresponding reducer logic has to be more nested and therefore more complex. In particular, trying to update a deeply nested field can become very ugly very fast.
- Since immutable data updates require all ancestors in the state tree to be copied and updated as well, and new object references will cause connected UI components to re-render, an update to a deeply nested data object could force totally unrelated UI components to re-render even if the data they're displaying hasn't actually changed.

Because of this, the recommended approach to managing relational or nested data in a Redux store is to treat a portion of your store as if it were a database, and keep that data in a _normalized_ form.

## Designing a Normalized State

The basic concepts of normalizing data are:

- Each type of data gets its own "table" in the state.
- Each "data table" should store the individual items in an object, with the IDs of the items as keys and the items themselves as the values.
- Any references to individual items should be done by storing the item's ID.
- Arrays of IDs should be used to indicate ordering.

An example of a normalized state structure for the blog example above might look like:

```js
{
    posts: {
        byId: {
            post1: {
                id: "post1",
                author: "user1",
                body: "......",
                comments: ["comment1", "comment2"]
            },
            post2: {
                id: "post2",
                author: "user2",
                body: "......",
                comments: ["comment3", "comment4", "comment5"]
            }
        },
        allIds: ["post1", "post2"]
    },
    comments: {
        byId: {
            comment1: {
                id: "comment1",
                author: "user2",
                comment: "....."
            },
            comment2: {
                id: "comment2",
                author: "user3",
                comment: "....."
            },
            comment3: {
                id: "comment3",
                author: "user3",
                comment: "....."
            },
            comment4: {
                id: "comment4",
                author: "user1",
                comment: "....."
            },
            comment5: {
                id: "comment5",
                author: "user3",
                comment: "....."
            }
        },
        allIds: ["comment1", "comment2", "comment3", "comment4", "comment5"]
    },
    users: {
        byId: {
            user1: {
                username: "user1",
                name: "User 1"
            },
            user2: {
                username: "user2",
                name: "User 2"
            },
            user3: {
                username: "user3",
                name: "User 3"
            }
        },
        allIds: ["user1", "user2", "user3"]
    }
}
```

This state structure is much flatter overall. Compared to the original nested format, this is an improvement in several ways:

- Because each item is only defined in one place, we don't have to try to make changes in multiple places if that item is updated.
- The reducer logic doesn't have to deal with deep levels of nesting, so it will probably be much simpler.
- The logic for retrieving or updating a given item is now fairly simple and consistent. Given an item's type and its ID, we can directly look it up in a couple simple steps, without having to dig through other objects to find it.
- Since each data type is separated, an update like changing the text of a comment would only require new copies of the "comments > byId > comment" portion of the tree. This will generally mean fewer portions of the UI that need to update because their data has changed. In contrast, updating a comment in the original nested shape would have required updating the comment object, the parent post object, the array of all post objects, and likely have caused _all_ of the Post components and Comment components in the UI to re-render themselves.

Note that a normalized state structure generally implies that more components are connected and each component is responsible for looking up its own data, as opposed to a few connected components looking up large amounts of data and passing all that data downwards. As it turns out, having connected parent components simply pass item IDs to connected children is a good pattern for optimizing UI performance in a React Redux application, so keeping state normalized plays a key role in improving performance.

## Organizing Normalized Data in State

A typical application will likely have a mixture of relational data and non-relational data. While there is no single rule for exactly how those different types of data should be organized, one common pattern is to put the relational "tables" under a common parent key, such as "entities". A state structure using this approach might look like:

```js
{
    simpleDomainData1: {....},
    simpleDomainData2: {....},
    entities: {
        entityType1 : {....},
        entityType2 : {....}
    },
    ui: {
        uiSection1 : {....},
        uiSection2 : {....}
    }
}
```

This could be expanded in a number of ways. For example, an application that does a lot of editing of entities might want to keep two sets of "tables" in the state, one for the "current" item values and one for the "work-in-progress" item values. When an item is edited, its values could be copied into the "work-in-progress" section, and any actions that update it would be applied to the "work-in-progress" copy, allowing the editing form to be controlled by that set of data while another part of the UI still refers to the original version. "Resetting" the edit form would simply require removing the item from the "work-in-progress" section and re-copying the original data from "current" to "work-in-progress", while "applying" the edits would involve copying the values from the "work-in-progress" section to the "current" section.

## Relationships and Tables

Because we're treating a portion of our Redux store as a "database", many of the principles of database design also apply here as well. There is no single required way to store relationships. Choose the shape that makes the reads and updates your application needs straightforward.

### Storing related IDs on an entity

If you usually navigate a relationship in one direction and the relationship has no data of its own, an array of related IDs on the entity is often the simplest option. For example, an author record can store the IDs of that author's books:

```js
{
    authors: {
        byId: {
            5: {
                id: 5,
                name: "Ada Lovelace",
                bookIds: [22, 15]
            }
        },
        allIds: [5]
    },
    books: {
        byId: {
            22: { id: 22, title: "Notes" },
            15: { id: 15, title: "Sketches" }
        },
        allIds: [22, 15]
    }
}
```

Looking up an author's books is then a direct mapping from `bookIds` to the corresponding records in `books.byId`. This is a good fit for one-to-many relationships or when one direction is the main query your UI needs.

### Using a join table

For many-to-many relationships, or when the relationship itself has data that must be stored, use an intermediate table that stores the IDs of the corresponding items. This is often known as a "join table" or an "associative table". For example, an `authorBook` record can also describe the author's role for that specific book:

```js
{
    entities: {
        authors: {
            byId: {},
            allIds: []
        },
        books: {
            byId: {},
            allIds: []
        },
        authorBook: {
            byId: {
                1: {
                    id: 1,
                    authorId: 5,
                    bookId: 22,
                    role: "author"
                },
                2: {
                    id: 2,
                    authorId: 5,
                    bookId: 15,
                    role: "editor"
                },
                3: {
                    id: 3,
                    authorId: 42,
                    bookId: 12,
                    role: "author"
                }
            },
            allIds: [1, 2, 3]
        }
    }
}
```

Operations like "look up all books by this author" can then be accomplished with a loop over the join table, filtering for the desired `authorId` and retrieving each matching `bookId`. Given the typical amounts of data in a client application and the speed of JavaScript engines, this is likely to be sufficiently fast for most use cases.

If profiling shows that a particular relationship lookup is a bottleneck, you can maintain an additional index such as `bookIdsByAuthorId`. Keep that index derived from the same actions that update the relationship records so it cannot become inconsistent. Start with the simpler shape that matches your use case, and add indexes only when a measured read pattern needs them.

## Normalizing Nested Data

Because APIs frequently send back data in a nested form, that data needs to be transformed into a normalized shape before it can be included in the state tree.

For most applications, [Redux Toolkit's `createEntityAdapter`](https://redux-toolkit.js.org/api/createEntityAdapter) is the recommended way to store and update normalized entity collections in your slices. It provides a standard `{ ids, entities }` state shape along with generated reducers and selectors. See [Performance and Normalizing Data](../../tutorials/essentials/part-6-performance-normalization.md) for a walkthrough.

If you need to transform deeply nested API responses with complex relational schemas into normalized data, the [Normalizr](https://github.com/paularmstrong/normalizr) library is still a common option. You can define schema types and relations, feed the schema and the response data to Normalizr, and it will output a normalized transformation of the response. That output can then be included in an action and used to update the store (including slices that use `createEntityAdapter`). Normalizr is stable and feature-rich for relational normalization, but it is [no longer actively maintained](https://github.com/paularmstrong/normalizr/discussions/493#discussioncomment-2395540).
