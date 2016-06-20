import Ember from 'ember';

export default Ember.Route.extend({
  activate: function(){
    var game = new Phaser.Game(800, 608, Phaser.CANVAS, 'phaser', 
      { preload: preload,
        create: create,
        update: update,
        render: render
      });

    //constants and globals
    var map;
    var mapArr;
    var layer;
    var exitBody;
    var cursors;
    var enemies = [];
    var enemyCount = 3;
    var ship;
    var shadow;
    var enemyShadows = [];
    // Offset for shadow
    var offset = new Phaser.Point(5, 7);
    var enemyOffset = new Phaser.Point(4, 6);
    var result = 'Move with the arrow keys';
    var round;
    var ROUND_LENGTH = 3;
    var animFrame = 0;
    var WATER_ANIM_SPEED = 200;
    var GAME_WIDTH = 50;
    var GAME_HEIGHT = 19;
    var MIN_PREFABS = 6;
    var MAX_PREFABS = 12;
    // Game over variables
    var menu;
    var GAME_WIDTH_PX = 800;
    var GAME_HEIGHT_PX = 608;
    var newGameLabel;
    var finalScore;


    function preload(){

      // Tilemap
      game.load.tilemap('map', null, generateMap(), Phaser.Tilemap.CSV);
      //game.load.tilemap(    'map',      '/assets/images/tilemaps/collision_tilemap.json', null, Phaser.Tilemap.TILED_JSON);
      // Tiles
      game.load.image(      'ground_1x1', '/assets/images/tiles/ground_1x1.png');
      //game.load.image(      'walls_1x2','/assets/images/tiles/walls_1x2.png');
      //game.load.image(      'tiles2',   '/assets/images/tiles/tiles2.png');
      // Enemies
      //game.load.image(      'wizball',  '/assets/images/sprites/wizball.png');
      // Player sprite
      // game.load.spritesheet('ship',    '/assets/images/sprites/humstar.png', 32, 32);
      game.load.image(      'ship',       '/assets/images/sprites/pirate_ship_twomast.png');
      game.load.image(      'enemy',      '/assets/images/sprites/pirate_ship_twomast_white.png');

      // Ship wake emitter
      game.load.image(      'wake',       '/assets/images/sprites/bubble.png');

    }

    // Instantiating gameworld, applying physics, animations
    // and sprites to map
    function create(){

      // Instantiate first round
      round = 1;

      // P2 physics engine
      game.physics.startSystem(Phaser.Physics.P2JS);

      // Helper function containing all placements
      createMapAndObjects();

      // Set game input to arrow keys
      cursors = game.input.keyboard.createCursorKeys();
      exitBody = undefined;

      //add timer for 60 seconds, calling gameOver() when finished
      game.time.events.add(Phaser.Timer.SECOND * ROUND_LENGTH, openExit, this);
      var timer = game.time.create(false);
      timer.loop(WATER_ANIM_SPEED, updateAnim, this);
      timer.start();

      // Place wake behind ship sprites
      game.world.swap(ship, ship.shipWake);
      // enemies.forEach(function(enemy){
      //   game.world.swap(enemy, enemy.enemyWake);
      // })

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
          showFinalScore();
        }
        else 
        {
          result = 'You last hit: the wall';
        }
      }
      else
      {
        result = 'Move with the arrow keys';
      }
    }

    function showFinalScore() {
      game.paused = true;

      var dayPlural;

      if (round === 1) {
        dayPlural = ' day.';
      } else {
        dayPlural = ' days.';
      }

      // Add end game text
      finalScore = game.add.text(0, 0, 
        "You evaded Euron's clutches for " + round + dayPlural,
        { font: '24px Arial', fill: '#fff', align: 'center' });
      newGameLabel = game.add.text(0, 0, 
        "Click anywhere to try again", 
        { font: '40px Arial', fill: '#fff', align: 'center' });

      finalScore.fixedToCamera = true;
      finalScore.cameraOffset.setTo(GAME_WIDTH_PX / 4, (GAME_HEIGHT_PX / 2) - 25);

      newGameLabel.fixedToCamera = true;
      newGameLabel.cameraOffset.setTo(GAME_WIDTH_PX / 4, (GAME_HEIGHT_PX / 2) + 25);

      // Unpause and restart game
      game.input.onDown.add(function() {
        game.paused = false;
        round = 1;
        resetMap();
      });
    }

    function resetMap() {
      //game.world.removeAll(true);
      //map.destroy();
      //game.physics.clear();
      ship.destroy();

      enemies.forEach(function(enemy){
        enemy.destroy();
        // enemy.enemyWake.destroy();
      });

      game.physics.p2.clearTilemapLayerBodies(map, layer);
      layer.destroy();
      if (exitBody) {
        exitBody.destroy();
        exitBody = undefined;
      }
      //console.log(game.physics.p2.getBodies());
      game.physics.reset();
      game.physics.p2.reset();
      createMapAndObjects();

      // Place wake behind ship sprites
      game.world.swap(ship, ship.shipWake);

      game.time.events.add(Phaser.Timer.SECOND * ROUND_LENGTH, openExit, this);

      return true;
    }

    function updateAnim() {
      switch(animFrame) {
        case 0:
        map.replace(0, 26);
        break;
        case 1:
        map.replace(26,27);
        break;
        case 2:
        map.replace(27,28);
        break;
        case 3:
        map.replace(28,29);
        break;
        case 4:
        map.replace(29,30);
        break;
        case 5:
        map.replace(30,31);
        break;
        case 6:
        map.replace(31,32);
        break;
        case 7:
        map.replace(32, 33);
        break;
        case 8:
        map.replace(33, 34);
        break;
        case 9:
        map.replace(34, 35);
        break;
        case 10:
        map.replace(35, 36);
        break;
        case 11:
        map.replace(36, 37);
        break;
        case 12:
        map.replace(37, 38);
        break;
        case 13:
        map.replace(38, 39);
        break;
        case 14:
        map.replace(39, 0);
        animFrame = -1;
        break;
      }
      animFrame++;
    }

    function openExit() {
      if ( !exitBody ) {
        do {
          var point = getEmptyPoint();
        } while(Phaser.Math.distance(point.x * 32, point.y * 32, ship.x, ship.y) < 300)
        map.swap(map.getTile(point.x, point.y).index, 4, point.x, point.y, 1,1 );
        //map.getTile(point.x, point.y).setCollision(true, true, true, true);
        //map.getTile(point.x, point.y).setCollisionCallback(nextRound);
        exitBody = game.physics.p2.createBody(point.x * 32, point.y * 32, 0);
        exitBody.setRectangle(32, 32, 16, 16)
        exitBody.createBodyCallback(ship, nextRound)
        exitBody.addToWorld();
      }
      //map.setCollision(4, true);
      //map.setTileLocationCallback(point.x, point.y, 1, 1, nextRound, ship, 0);
      //round++;
      //game.time.events.add(Phaser.Timer.SECOND * 15, nextRound, this);
    }

    function nextRound(sprite, tile) {
      round++;

      if (round % 2 == 0) {
        enemyCount += 1;
      }

      resetMap();

      return true;
    }

    function moveTowardsPoint(enemy, x, y){
      var speed = 60;
      var angle = Math.atan2(y - enemy.y, x - enemy.x);

      // correct angle of angry bullets (depends on the sprite used)
      enemy.body.rotation = angle + game.math.degToRad(90); 

      // accelerateToObject 
      enemy.body.force.x = Math.cos(angle) * speed; 
      enemy.body.force.y = Math.sin(angle) * speed;
    }

    function makePatrolRoute() {

    }

    function patrolAI(enemy, x, y) {
      // Number of points in patrol, maximum is 5
      var vertices = Math.floor(Math.random() * 7);


      getEmptyPoint();
    }

    function updateAI(enemy){
      if(ship){
        moveTowardsPoint(enemy, ship.x, ship.y);
      }
    }

    function update() {

      // Update wake to follow ship
      ship.shipWake.x = ship.x;
      ship.shipWake.y = ship.y;

      // Update shadow
      shadow.x = ship.x + offset.x;
      shadow.y = ship.y + offset.y;
      shadow.angle = ship.angle;

      // Update target position and shadow for each enemy ship
      enemies.forEach(function(enemy){
        updateAI(enemy);
      });

      enemyShadows.forEach(function(shadow, index){
        shadow.x = enemies[index].x + enemyOffset.x;
        shadow.y = enemies[index].y + enemyOffset.y;
        shadow.angle = enemies[index].angle;
      })

      // filter.update(game.input.activePointer);

      // Set rotation to left and right arrow keys
      // Higher values relate to faster rotation
      if (cursors.left.isDown)
      {
        ship.body.rotateLeft(75);
      }
      else if (cursors.right.isDown)
      {
        ship.body.rotateRight(75);
      }
      else
      {
        ship.body.setZeroRotation();
      }

      // Set forward and reverse thrust to up and down arrow keys
      // Higher values relate to faster acceleration
      if (cursors.up.isDown)
      {
        ship.body.thrust(125);
      }
      else if (cursors.down.isDown)
      {
        ship.body.reverse(100);
      }

    }

    function render() {
      game.debug.text(result, 50, 50);
      if (game.time.events.duration > 0){
        game.debug.text("Round " + round + " time: " + parseInt((game.time.events.duration / 1000) + 1), 50, 75);
      } else {
        game.debug.text("The exit is open! Escape!", 50, 75);
      }
    }

    function place4x4IslandPrefab(mapArr) {
      var point = { x: Math.floor(Math.random() * GAME_WIDTH), y: Math.floor(Math.random() * GAME_HEIGHT) };
      var attempts = 0;
      while (point.y > GAME_HEIGHT - 4 || point.x > GAME_WIDTH - 4 ||
       mapArr[point.y][point.x] !== 0 || mapArr[point.y+1][point.x] !== 0 ||
       mapArr[point.y][point.x+1] !== 0 || mapArr[point.y+1][point.x+1] !== 0 ||
       mapArr[point.y][point.x+2] !== 0 || mapArr[point.y+2][point.x] !== 0 ||  mapArr[point.y+2][point.x+1] !== 0 ||
       mapArr[point.y+1][point.x+2] !== 0 || mapArr[point.y+2][point.x+2] !== 0 ||
       mapArr[point.y][point.x+3] !== 0 || mapArr[point.y+1][point.x+3] !== 0 ||
       mapArr[point.y+2][point.x+3] !== 0 || mapArr[point.y+3][point.x+3] !== 0 ||
       mapArr[point.y+3][point.x+0] !== 0 || mapArr[point.y+3][point.x+1] !== 0 ||
       mapArr[point.y+3][point.x+2] !== 0 ) 
      {
        point.x = Math.floor(Math.random() * GAME_WIDTH);
        point.y = Math.floor(Math.random() * GAME_HEIGHT);
        attempts++;
        if ( attempts > 10 ) {
          break;
        }
      }

      mapArr[point.y][point.x] = Math.floor(Math.random() * 2);
      mapArr[point.y][point.x+1] = Math.floor(Math.random() * 2);
      mapArr[point.y+1][point.x] = Math.floor(Math.random() * 2);
      mapArr[point.y+1][point.x+1] = Math.floor(Math.random() * 2);
      mapArr[point.y+2][point.x] = Math.floor(Math.random() * 2);
      mapArr[point.y][point.x+2] = Math.floor(Math.random() * 2);
      mapArr[point.y+1][point.x+2] = Math.floor(Math.random() * 2);
      mapArr[point.y+2][point.x+1] = Math.floor(Math.random() * 2);
      mapArr[point.y+2][point.x+2] = Math.floor(Math.random() * 2);
      mapArr[point.y][point.x+3] = Math.floor(Math.random() * 2);
      mapArr[point.y+1][point.x+3] = Math.floor(Math.random() * 2);
      mapArr[point.y+2][point.x+3] = Math.floor(Math.random() * 2);
      mapArr[point.y+3][point.x+3] = Math.floor(Math.random() * 2);
      mapArr[point.y+3][point.x] = Math.floor(Math.random() * 2);
      mapArr[point.y+3][point.x+1] = Math.floor(Math.random() * 2);
      mapArr[point.y+3][point.x+2] = Math.floor(Math.random() * 2);

      return mapArr;
    }

    function place3x3IslandPrefab(mapArr) {
      var point = { x: Math.floor(Math.random() * GAME_WIDTH), y: Math.floor(Math.random() * GAME_HEIGHT) };
      var attempts = 0;
      while (point.y > GAME_HEIGHT - 3 || point.x > GAME_WIDTH - 3 ||
       mapArr[point.y][point.x] !== 0 || mapArr[point.y+1][point.x] !== 0 ||
       mapArr[point.y][point.x+1] !== 0 || mapArr[point.y+1][point.x+1] !== 0 ||
       mapArr[point.y][point.x+2] !== 0 || mapArr[point.y+2][point.x] !== 0 ||  mapArr[point.y+2][point.x+1] !== 0 ||
       mapArr[point.y+1][point.x+2] !== 0 || mapArr[point.y+2][point.x+2] !== 0) 
      {
        point.x = Math.floor(Math.random() * GAME_WIDTH);
        point.y = Math.floor(Math.random() * GAME_HEIGHT);
        attempts++;
        if ( attempts > 10 ) 
        {
          break;
        }
      }

      mapArr[point.y][point.x] = Math.floor(Math.random() * 2);
      mapArr[point.y][point.x+1] = Math.floor(Math.random() * 2);
      mapArr[point.y+1][point.x] = Math.floor(Math.random() * 2);
      mapArr[point.y+1][point.x+1] = Math.floor(Math.random() * 2);
      mapArr[point.y+2][point.x] = Math.floor(Math.random() * 2);
      mapArr[point.y][point.x+2] = Math.floor(Math.random() * 2);
      mapArr[point.y+1][point.x+2] = Math.floor(Math.random() * 2);
      mapArr[point.y+2][point.x+1] = Math.floor(Math.random() * 2);
      mapArr[point.y+2][point.x+2] = Math.floor(Math.random() * 2);

      return mapArr;
    }

    function place1x1IslandPrefab(mapArr) {
      var point = { x: Math.floor(Math.random() * GAME_WIDTH), y: Math.floor(Math.random() * GAME_HEIGHT) };

      while (mapArr[point.y][point.x] !== 0 ) {
        point.x = Math.floor(Math.random() * GAME_WIDTH);
        point.y = Math.floor(Math.random() * GAME_HEIGHT);
      }
      mapArr[point.y][point.x] = 1;

      return mapArr;
    }

    function place2x2IslandPrefab(mapArr) {
      var point = { x: Math.floor(Math.random() * GAME_WIDTH), y: Math.floor(Math.random() * GAME_HEIGHT) };
      var attempts = 0;
      while (point.y > GAME_HEIGHT - 2 || point.x > GAME_WIDTH - 2 ||
       mapArr[point.y][point.x] !== 0 || mapArr[point.y+1][point.x] !== 0 ||
       mapArr[point.y][point.x+1] !== 0 || mapArr[point.y+1][point.x+1] !== 0 ) 
      {
        point.x = Math.floor(Math.random() * GAME_WIDTH);
        point.y = Math.floor(Math.random() * GAME_HEIGHT);
        attempts++;
        if ( attempts > 10 ) 
        {
          break;
        }
      }
      mapArr[point.y][point.x] = 1;
      mapArr[point.y][point.x+1] = 1;
      mapArr[point.y+1][point.x] = 1;
      mapArr[point.y+1][point.x+1] = 1;

      return mapArr;
    }

    function getEmptyPoint(){
      var point = { x: Math.floor(Math.random() * GAME_WIDTH), y: Math.floor(Math.random() * GAME_HEIGHT) };
      while (point.y < 2 || point.x < 2 || point.y > GAME_HEIGHT - 2 || point.x > GAME_WIDTH - 2 ||
       mapArr[point.y][point.x] !== 0 || mapArr[point.y-1][point.x] !== 0 ||
       mapArr[point.y][point.x-1] !== 0 || mapArr[point.y-1][point.x-1] !== 0 ) 
      {

        point.x = Math.floor(Math.random() * GAME_WIDTH);
        point.y = Math.floor(Math.random() * GAME_HEIGHT);
      }

      return point;
    }

    function mapArrToString(mapArr){
      var newMapArr = [];
      for(var z = 0; z < mapArr.length; z++) {
        if (mapArr[z] instanceof Array){
          newMapArr[z] = mapArr[z].join(",");
        }
      }

      return newMapArr.join("\n");
    }

    function generateEmptyMap(){
      var mapArr = [];
      for(var y = 0; y < GAME_HEIGHT; y++) {
        mapArr[y] = [];
        for(var x = 0; x < GAME_WIDTH; x++){
          mapArr[y][x] = 0;
        }
      }
      return mapArr;
    }

    function generateMap(){
      //generate empty map
      mapArr = generateEmptyMap();

      //get random prefab objects
      var numPrefabs = Math.floor(Math.random() * MAX_PREFABS + MIN_PREFABS);

      for(var prefs = 0; prefs < numPrefabs; prefs++){
        //place prefabs here
        var prefab_id = Math.floor(Math.random() * 5);
        switch(prefab_id){
          case 0:
          mapArr = place1x1IslandPrefab(mapArr);
          break;
          case 1:
          mapArr = place2x2IslandPrefab(mapArr);
          break;
          case 2:
          mapArr = place3x3IslandPrefab(mapArr);
          break;
          case 3:
          mapArr = place4x4IslandPrefab(mapArr);
          break;
          case 4:
          break;
        }
      }

      return mapArrToString(mapArr);
    }

    function createMapAndObjects(){
      //load tilemap with 32x32 pixel tiles, add the images and resize the world
      map = game.add.tilemap('map', 32, 32);
      game.stage.backgroundColor = '#0077be';
      map.addTilesetImage('ground_1x1');
      layer = map.createLayer(0);
      layer.resizeWorld();

      // Tiles are collidable
      map.setCollisionBetween(1, 12);

      // Convert the tilemap layer into collision bodies
      game.physics.p2.convertTilemap(map, layer);

      // Add player sprite to gameworld
      var point = getEmptyPoint();
      console.log("Ship Point: " + point.x + " - " + point.y);

      // Shadow first
      shadow = game.add.sprite(point.x * 32, point.y * 32, 'ship', 'shadow');
      shadow.anchor.setTo(0.5, 0.5)
      shadow.tint = 0x000000;
      shadow.alpha = 0.6;
      shadow.scale.set(0.75);


      // Then ship
      ship = game.add.sprite(point.x * 32, point.y * 32, 'ship');
      ship.smoothed = false;
      ship.scale.set(0.75);

      // Sets bounciness of game physics
      // Lower values are less bouncy
      game.physics.p2.setImpactEvents(true);
      game.physics.p2.restitution = 0.25;

      // Add ship wake via arcade emitter
      ship.shipWake = game.add.emitter(ship.x, ship.y + 32, 50);
      ship.shipWake.width = 30;
      ship.shipWake.makeParticles('wake');
      ship.shipWake.setXSpeed(50, -50);
      ship.shipWake.setYSpeed(50, -50);
      ship.shipWake.setAlpha(1, 0.01, 500);
      ship.shipWake.setScale(0.05, 0.5, 0.05, 0.5, 5000, Phaser.Easing.Quintic.Out);
      ship.shipWake.start(false, 1500, 10);


      // Add idle animations to the player sprite
      //ship.animations.add('fly', [0,1,2,3,4,5], 10, true);
      //ship.play('fly');

      // Add enemy sprites to gameworld
      for(var x = 0; x < enemyCount; x++ ) {
        do {
          point = getEmptyPoint();
        }
        while(Phaser.Math.distance(point.x * 32, point.y * 32, ship.x, ship.y) < 300);

        enemyShadows.push(game.add.sprite(point.x * 32, point.y * 32, 'enemy', 'shadow'));
        enemies.push(game.add.sprite(point.x * 32, point.y * 32, 'enemy'));
      }

      // Add enemy wake via arcade emitter
      // enemies.forEach(function(enemy) {
      //   enemy.enemyWake = game.add.emitter(enemy.x, enemy.y + 32, 50);
      //   enemy.enemyWake.width = 20;
      //   enemy.enemyWake.makeParticles('wake');
      //   enemy.enemyWake.setXSpeed(50, -50);
      //   enemy.enemyWake.setYSpeed(50, -50);
      //   enemy.enemyWake.setAlpha(1, 0.01, 500);
      //   enemy.enemyWake.setScale(0.05, 0.5, 0.05, 0.5, 5000, Phaser.Easing.Quintic.Out);
      //   enemy.enemyWake.start(false, 1250, 20);
      // })

      // Apply physics and camera, second argument is debug mode
      game.physics.p2.enable(ship, false);
      game.camera.follow(ship);

      // Set bounding boxes of enemies and player
      // Arguments are (width, height, offsetX, offsetY, and rotation)
      ship.body.setRectangle(25, 64, -2, 5);

      enemyShadows.forEach(function(shadow) {
        // Apply position to enemy shadows
        shadow.anchor.setTo(0.5, 0.5);
        shadow.tint = 0x000000;
        shadow.alpha = 0.6;
        shadow.scale.set(0.5);
      });

      enemies.forEach(function(enemy){
        //apply physics to enemy
        game.physics.p2.enable(enemy, false);
        enemy.scale.set(0.5);
        enemy.body.setRectangle(18, 48, -1, 7);
      });

      enemies.forEach(function(enemy){

      });

      // The first 4 parameters control if you need a boundary
      // on the left, right, top and bottom of your world.
      // The final parameter (false) controls if the boundary 
      // should use its own collision group or not.
      game.physics.p2.setBoundsToWorld(true, true, true, true, false);

      // The first 4 parameters control if you need a boundary
      // on the left, right, top and bottom of your world.
      // The final parameter (false) controls if the boundary 
      // should use its own collision group or not.
      // Check for player sprite hitting an enemy
      ship.body.onBeginContact.add(enemyHit, this);

    }
  }
});
