
import { Mongo } from 'meteor/mongo';

export const Counter = {
    collection: new Mongo.Collection('reactive-counter'),

    get: function(publishName) {
        const publication = this.collection.findOne(publishName);

        return publication && publication.count || 0; 
    }
};
