Package.describe({
  name: '67726e:counter',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Reactive Counter with Mongo Observer and Meteor Timeout Patterns',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/67726e/meteor.counter',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('3.0.1');
  api.use('ecmascript');

  api.mainModule('server/server.js', 'server');
  api.mainModule('client/client.js', 'client');

  api.export(['Counter']);
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('67726e:counter');
});
