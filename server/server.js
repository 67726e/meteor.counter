
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
Counter.Observer.publish = async function(meteorContext, documentName, mongoCursor, options) {
    const collectionName = options?.collectionName ?? 'reactive-counter';

    let initializing = true;
    let handle = null;
    let count = 0;

    let observer = {
        added: function (document) {
            count += 1;

            if (!initializing)
                meteorContext.changed(collectionName, documentName, { count: count });
        },
        removed: function (document) {
            count -= 1;

            if (!initializing)
                meteorContext.changed(collectionName, documentName, { count: count });
        },        
    };

    // Cursor.count is officially deprecated, so reuse Meteor's stored cursor options, like
    // https://github.com/meteor/meteor/blob/release-3.0/packages/mongo/mongo_driver.js#L876,
    // but we reuse the method countDocuments available here
    // https://github.com/meteor/meteor/blob/release-3.0/packages/mongo/mongo_driver.js#L772
    // given that it applies the internal methods replaceTypes and replaceMeteorAtomWithMongo
    // to the `selector` and `options` arguments
    const cursorDescription = mongoCursor._cursorDescription;

    // Note: Unsure why in the original code there is a shadowed `var count` and then an assignment...
    //	We eliminated the shadow `count` which results in an double-count scenario..
    //	On initialization, we get flooded with `observer.added` calls which hydrates the count... 
    //  This is possibly related to our elimination of the `options.nonReactive` ???
    // count = await mongoCursor._mongo.countDocuments(collectionName, selector, options);
    await mongoCursor._mongo.countDocuments(cursorDescription.collectionName, cursorDescription.selector, cursorDescription.options);

    handle = await mongoCursor.observe(observer);

    meteorContext.added(collectionName, documentName, { count: count });

    meteorContext.ready();

    meteorContext.onStop(function() {
        if (handle) {
            handle.stop();
            handle = null;
        }
    });

    initializing = false;

    return {
        stop: function() {
            if (handle) {
                handle.stop();
                handle = null;
            }
        }
    };
};
