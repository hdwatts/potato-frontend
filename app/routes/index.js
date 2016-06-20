import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    enter(params){
      if ( params != "" ) {
        window.location = "/game?username="+params
      }
    }
  }
});
