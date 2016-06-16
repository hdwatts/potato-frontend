import Ember from 'ember';

export default Ember.Route.extend({
  activate: function(){
    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser', 
      { preload: preload,
        create: create,
        update: update,
        render: render
      });
    
    // Asset loading, including sprites and tilemap
    function preload(){
      game.load.tilemap(    'map',        '/assets/images/tilemaps/collision_tilemap.json', null, Phaser.Tilemap.TILED_JSON);
      game.load.image(      'ground_1x1', '/assets/images/tiles/ground_1x1.png');
      game.load.image(      'walls_1x2',  '/assets/images/tiles/walls_1x2.png');
      game.load.image(      'tiles2',     '/assets/images/tiles/tiles2.png');
      game.load.spritesheet('ship',       '/assets/images/sprites/humstar.png', 32, 32);
    }

    var map;
    var layer;
    var cursors;
    var ship;
    var round;

    // Instantiating gameworld, applying physics, animations
    // and sprites to map
    function create(){
      round = 1;
      // P2 physics engine
      game.physics.startSystem(Phaser.Physics.P2JS);

      map = game.add.tilemap('map');

      map.addTilesetImage('ground_1x1');
      map.addTilesetImage('walls_1x2');
      map.addTilesetImage('tiles2');

      layer = map.createLayer('Tile Layer 1');

      layer.resizeWorld();

      // Tiles are collidable
      map.setCollisionBetween(1, 12);

      // Convert the tilemap layer into collision bodies
      game.physics.p2.convertTilemap(map, layer);

      // Sets bounciness of game physics
      // Lower values are less bouncy
      game.physics.p2.restitution = 0.25;

      // Add player sprite to gameworld
      ship = game.add.sprite(200, 200, 'ship');
      ship.scale.set(2);
      ship.smoothed = false;

      // Add idle animations to the player sprite
      ship.animations.add('fly', [0,1,2,3,4,5], 10, true);
      ship.play('fly');

      // Apply physics and camera to the ship
      game.physics.p2.enable(ship);
      game.camera.follow(ship);

      ship.body.setCircle(28);
      
      // The first 4 parameters control if you need a boundary
      // on the left, right, top and bottom of your world.
      // The final parameter (false) controls if the boundary 
      // should use its own collision group or not.
      game.physics.p2.setBoundsToWorld(true, true, true, true, false);

      // Set game input to arrow keys
      cursors = game.input.keyboard.createCursorKeys();

      //add timer for 60 seconds, calling gameOver() when finished
      game.time.events.add(Phaser.Timer.SECOND * 15, nextRound, this);
    }

    function nextRound() {
      round++;
      game.time.events.add(Phaser.Timer.SECOND * 15, nextRound, this);
    }

    function update() {

      // Set rotation to left and right arrow keys
      // Higher values relate to faster rotation
      if (cursors.left.isDown)
      {
        ship.body.rotateLeft(100);
      }
      else if (cursors.right.isDown)
      {
        ship.body.rotateRight(100);
      }
      else
      {
        ship.body.setZeroRotation();
      }

      // Set forward and reverse thrust to up and down arrow keys
      // Higher values relate to faster acceleration
      if (cursors.up.isDown)
      {
        ship.body.thrust(275);
      }
      else if (cursors.down.isDown)
      {
        ship.body.reverse(125);
      }

    }

    function render() {
      game.debug.text("Round " + round + " time: " + parseInt((game.time.events.duration / 1000) + 1), 32, 20);
    }
  }
});
