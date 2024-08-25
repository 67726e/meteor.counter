
# 67726e:counter

## Installation

```bash
# NOTE: For Meteor 3.0+
meteor add 67726e:counter
```

## Usage

```typescript
// For Small Collections, Using `.observe(...)` on the Mongo Cursor
await Counter.Observer.publish(this, 'administrator.job.search.count', cursor);
// For Large collections, Using `Meteor.setTimeout(...)` to Poll the Mongo Document
await Counter.Polling.publish(this, 'administrator.job.search.count', cursor);
```
