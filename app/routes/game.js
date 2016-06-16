import Ember from 'ember';

export default Ember.Route.extend({
  activate: function(){
    var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser', 
      { preload: preload,
        create: create,
        update: update,
        render: render
      });
    
    function preload(){
      // Tilemap
      game.load.tilemap(    'map',        '/assets/images/tilemaps/collision_tilemap.json', null, Phaser.Tilemap.TILED_JSON);
      // Tiles
      game.load.image(      'ground_1x1', '/assets/images/tiles/ground_1x1.png');
      game.load.image(      'walls_1x2',  '/assets/images/tiles/walls_1x2.png');
      game.load.image(      'tiles2',     '/assets/images/tiles/tiles2.png');
      // Enemies
      game.load.image(      'wizball',    '/assets/images/sprites/wizball.png');
      // Player sprite
      game.load.spritesheet('ship',       '/assets/images/sprites/humstar.png', 32, 32);
    }

    var map;
    var layer;
    var cursors;
    var enemy;
    var ship;
    var result = 'Move with the arrow keys';

    // Instantiating gameworld, applying physics, animations
    // and sprites to map
    function create(){

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
      game.physics.p2.setImpactEvents(true);
      game.physics.p2.restitution = 0.25;

      // Add enemy sprites to gameworld
      enemy = game.add.sprite(175, 300, 'wizball');

      // Add player sprite to gameworld
      ship = game.add.sprite(200, 200, 'ship');
      ship.scale.set(2);
      ship.smoothed = false;

      // Add idle animations to the player sprite
      ship.animations.add('fly', [0,1,2,3,4,5], 10, true);
      ship.play('fly');

      // Apply physics and camera, second argument is debug mode
      game.physics.p2.enable([ship, enemy], false);
      game.camera.follow(ship);

      enemy.body.setCircle(45);
      ship.body.setCircle(28);
      
      // The first 4 parameters control if you need a boundary
      // on the left, right, top and bottom of your world.
      // The final parameter (false) controls if the boundary 
      // should use its own collision group or not.
      game.physics.p2.setBoundsToWorld(true, true, true, true, false);

      // Set game input to arrow keys
      cursors = game.input.keyboard.createCursorKeys();

      // Check for player sprite hitting an enemy
      ship.body.onBeginContact.add(enemyHit, this);
    }

    function enemyHit(body, bodyB, shapeA, shapeB, equation) {
      //  The block hit something.
      //  
      //  This callback is sent 5 arguments:
      //  
      //  The Phaser.Physics.P2.Body it is in contact with. 
      //  *This might be null* if the Body was created directly 
      //  in the p2 world.
      //  The p2.Body this Body is in contact with.
      //  The Shape from this body that caused the contact.
      //  The Shape from the contact body.
      //  The Contact Equation data array.
      //  
      //  The first argument may be null or not have a sprite 
      //  property, such as when you hit the world bounds.

      if (body)
      {
        if (body.sprite) 
        {
          result = 'You last hit: ' + body.sprite.key;
        }
        else 
        {
          result = 'You last hit: the wall'
        }
      }
      else
      {
        result = 'Move with the arrow keys';
      }

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
      game.debug.text(result, 50, 50);
    }
  }
});
