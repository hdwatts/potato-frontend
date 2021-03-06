import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('instructions');
  this.route('scores');
  this.route('contact');
  this.route('game');
});

export default Router;
