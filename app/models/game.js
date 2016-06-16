import DS from 'ember-data';

export default DS.Model.extend({
  gameState: DS.attr('string'),
  winner: DS.attr()
});
