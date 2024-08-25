
import { Meteor } from 'meteor/meteor';

export const Counter = {};

// Note: Since the `cursor.observe(...)` style is non-performant at large-N collection sizes, we offer a version inspired by `meteorhacks:counts`
// See: https://github.com/bulletproof-meteor/bullet-counter/blob/17377f5272c82d9c4fd9dca7e4f780db0a9e3b7f/lib/server.js
Counter.Polling = {};
Counter.Polling.publish = async function(meteorContext, documentName, mongoCursor, options) {
    // Note: Default `10 * 1000 Milliseconds` = `10 Seconds` 
    const interval = options?.interval ?? (10 * 1000);
    const collectionName = options?.collectionName ?? 'reactive-counter';

    // Publish Initial Count...
    let count = await mongoCursor.countAsync();

    meteorContext.added(collectionName, documentName, { count: count });

    // Publish Count on Recurring Timer...
    let handler = Meteor.setTimeout(async function setTimeout() {
        count = await mongoCursor.countAsync();

        meteorContext.changed(collectionName, documentName, { count: count });

        handler = Meteor.setTimeout(setTimeout, interval);
    }, interval);

    meteorContext.onStop(() => {
        Meteor.clearTimeout(handler);
    })

    return {
        stop: function() {
            Meteor.clearTimeout(handler);
        }
    }
};




// Note: The original `cursor.observe(...)` style used in many Meteor 2.0 applications, i.e. `tmeasday:publish-counts`
// See: https://github.com/percolatestudio/publish-counts/blob/3fec0655bdd1dcf59c97e2762a8520e884254eb8/server/publish-counts.js
Counter.Observer = {};
