import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    enter(params){
      if ( params != "" ) {
        this.transitionTo('game',{queryParams: {username: params}})
      }
    }
  }
});
