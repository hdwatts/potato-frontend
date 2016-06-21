import Ember from 'ember';

export default Ember.HTMLBars.makeBoundHelper(function(indexNum){  
  return indexNum[0] + 1;
});