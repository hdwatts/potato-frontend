import Ember from 'ember';

export function inc(params/*, hash*/) {
  return parseInt(params) + 1;
}

export default Ember.Helper.helper(inc);
