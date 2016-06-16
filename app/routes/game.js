import Ember from 'ember';

export default Ember.Route.extend({
  activate: function(){
    var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser', 
                                { preload: preload,
                                  create: create,
                                  update: update,
                                  render: render
                                });
    var circle;
    var cursors;
    var ship;


    function preload(){
      game.load.spritesheet('ship', '/assets/images/humstar.png', 32, 32);
    }

    function create(){
      game.physics.startSystem(Phaser.Physics.P2JS);

      game.physics.p2.restitution = 0.8;
      ship = game.add.sprite(200, 200, 'ship');
      ship.scale.set(2);
      ship.smoothed = false;
      ship.animations.add('fly', [0,1,2,3,4,5], 10, true);
      ship.play('fly');

      game.physics.p2.enable(ship);
      ship.body.setCircle(28);
      ship.body.collideWorldBounds = true;

      cursors = game.input.keyboard.createCursorKeys();
    }

    function update() {
      ship.body.setZeroVelocity();

      if (cursors.left.isDown)
      {
        ship.body.moveLeft(200);
      }
      else if (cursors.right.isDown)
      {
        ship.body.moveRight(200);
      }

      if (cursors.up.isDown)
      {
        ship.body.moveUp(200);
      }
      else if (cursors.down.isDown)
      {
        ship.body.moveDown(200);
      }

    }

    function render() {
    }
  }
});
