import Ember from 'ember';

export default Ember.HTMLBars.makeBoundHelper(function(indexNum){  
  debugger;
  return indexNum[0] + 1;
});