import JSONAPIAdapter from 'ember-data/adapters/json-api';

export default JSONAPIAdapter.extend({
  host: 'https://potato-backend.herokuapp.com',
  namespace: 'api/v1'
});