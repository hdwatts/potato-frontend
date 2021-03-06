import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    username: ['username']
  },
  model: function(params){
    if (params["username"]) {
      return this.store.createRecord('game', {
        username:params["username"],
        score:"0",
        days:"0"
      });
    }else{
      this.transitionTo('index');
    }
  },
  deactivate: function(){
    Phaser.GAMES[0].destroy();
    Phaser.GAMES = [];
  },
  actions: {
    didTransition: function(){
      var _self = this;
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
      var health = 1000;
      var ship;
      var shadow;
      var enemyShadows = [];
      var explosion;
      // Offset for shadow
      var offset = new Phaser.Point(5, 7);
      var enemyOffset = new Phaser.Point(4, 6);
      var result = 'Health: ' + health;
      var round;
      var score = 0;
      var ROUND_LENGTH = 15;
      var animFrame = 0;
      var WATER_ANIM_SPEED = 200;
      var GAME_WIDTH = 50;
      var GAME_HEIGHT = 19;
      var MIN_PREFABS = 6;
      var MAX_PREFABS = 12;
      // Game over variables
      var GAME_WIDTH_PX = 800;
      var GAME_HEIGHT_PX = 608;
      var newGameLabel;
      var finalScore;

      function preload(){
        window.scrollTo(0,document.body.scrollHeight);
        
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

        // Explosion splinters
        game.load.image(      'splinter1',       '/assets/images/splinter1.png');
        game.load.image(      'splinter2',       '/assets/images/splinter2.png');        
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

      }

      function enemyHit(body) {
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

            var v1 = new Phaser.Point(ship.body.velocity.x, ship.body.velocity.y);
            var v2 = new Phaser.Point(body.velocity.x, body.velocity.y);

            // calculate difference 
            var v = Math.floor(Math.abs( v1.x - v2.x ) + Math.abs( v1.y - v2.y ));

            playExplosion(ship.x, ship.y, v);
            health = Math.max(health - v, 0);
            result = 'Health: ' + health;
            if (health === 0){
              showFinalScore();
            }
          }
          else
          {
            //result = 'You last hit: the wall';
          }
        }
        else
        {
          //result = 'Move with the arrow keys';
        }
      }

      function playExplosion(x, y, healthLoss) {
        explosion = game.add.emitter(x, y, 6);

        // Splinter 1
        explosion.makeParticles('splinter1');
        explosion.width = 35;
        explosion.height = 35;
        explosion.minParticleScale = 0.1;
        explosion.maxParticleScale = 0.2;
        explosion.minParticleSpeed.set(0, 30);
        explosion.maxParticleSpeed.set(0, 100);
        explosion.gravity = 0;

        var splinterCount = 0;

        if (healthLoss < 200) {
          splinterCount = 1;
        } else if (healthLoss < 400) {
          splinterCount = 3;
        } else if (healthLoss < 600) {
          splinterCount = 4;
        } else if (healthLoss < 800) {
          splinterCount = 5;
        } else {
          splinterCount = 6;
        }

        explosion.start(false, 1000, 50, splinterCount);  
      }

      function showFinalScore() {
        game.paused = true;

        var username = _self.currentModel.get('username');
        var dayPlural;

        if (round === 1) {
          dayPlural = ' day.';
        } else {
          dayPlural = ' days.';
        }

        // score = round; //TODO: add sore calculator

        _self.currentModel.set("score", score);
        _self.currentModel.set("days", round);
        _self.currentModel.save().then(function(){
          _self.currentModel.deleteRecord();
          _self.currentModel = _self.model({username: username});
        });
        //console.log(this.currentModel)

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
        game.input.onDown.add(unpauseGame);
      }
      function unpauseGame() {
        game.paused = false;
        score = 0;
        health = 1000;
        enemyCount = 3;
        result = 'Health: ' + health;
        round = 1;
        resetMap();
      }

      function resetMap() {
        //game.world.removeAll(true);
        //map.destroy();
        //game.physics.clear();
        game.time.events.removeAll();
        game.input.onDown.remove(unpauseGame);
        ship.destroy();

        enemies.forEach(function(enemy){
          enemy.destroy();
        });

        game.physics.p2.clearTilemapLayerBodies(map, layer);
        layer.destroy();
        if (exitBody) {
          exitBody.destroy();
          exitBody = undefined;
        }
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
          map.replace(4, 5);
          break;
          case 1:
          map.replace(26,27);
          map.replace(5, 6);
          break;
          case 2:
          map.replace(27,28);
          map.replace(6, 7);
          break;
          case 3:
          map.replace(28,29);
          map.replace(7, 8);
          break;
          case 4:
          map.replace(29,30);
          map.replace(8, 9);
          break;
          case 5:
          map.replace(30,31);
          map.replace(9, 10);
          break;
          case 6:
          map.replace(31,32);
          map.replace(10, 11);
          break;
          case 7:
          map.replace(32, 33);
          map.replace(11, 4);
          break;
          case 8:
          map.replace(33, 34);
          map.replace(4, 5);
          break;
          case 9:
          map.replace(34, 35);
          map.replace(5, 6);
          break;
          case 10:
          map.replace(35, 36);
          map.replace(6, 7);
          break;
          case 11:
          map.replace(36, 37);
          map.replace(7, 8);
          break;
          case 12:
          map.replace(37, 38);
          map.replace(8, 9);
          break;
          case 13:
          map.replace(38, 39);
          map.replace(9, 10);
          break;
          case 14:
          map.replace(39, 0);
          map.replace(10, 4);
          animFrame = -1;
          break;
        }
        animFrame++;
      }

      function openExit() {
        if ( !exitBody ) {
          var point;
          do {
            point = getEmptyPoint();
          } while(Phaser.Math.distance(point.x * 32, point.y * 32, ship.x, ship.y) < 300);
          map.swap(map.getTile(point.x, point.y).index, 4, point.x, point.y, 1,1 );
          //map.getTile(point.x, point.y).setCollision(true, true, true, true);
          //map.getTile(point.x, point.y).setCollisionCallback(nextRound);
          exitBody = game.physics.p2.createBody(point.x * 32, point.y * 32, 0);
          exitBody.setRectangle(32, 32, 16, 16);
          exitBody.createBodyCallback(ship, nextRound);
          exitBody.addToWorld();
        }
        //map.setCollision(4, true);
        //map.setTileLocationCallback(point.x, point.y, 1, 1, nextRound, ship, 0);
        //round++;
        //game.time.events.add(Phaser.Timer.SECOND * 15, nextRound, this);
      }

      function nextRound() {
        round++;
        score += health;
        console.log(score)

        if (round % 2 === 0) {
          enemyCount += 1;
        }

        resetMap();

        return true;
      }

      function moveTowardsPoint(enemy, x, y){
        var speed = 60;
        var angle = Math.atan2(y - enemy.y, x - enemy.x);

        // correct angle of angry ships
        enemy.body.rotation = angle + game.math.degToRad(90); 

        // accelerateToObject 
        enemy.body.force.x = Math.cos(angle) * speed; 
        enemy.body.force.y = Math.sin(angle) * speed;
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
        });

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

      function createMapAndObjects(){
        //load tilemap with 32x32 pixel tiles, add the images and resize the world
        game.cache.addTilemap('map', null, generateMap(), Phaser.Tilemap.CSV);
        console.log(game.cache);
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
        shadow = game.add.sprite(point.x * 32, point.y * 32, 'ship');
        shadow.anchor.setTo(0.5, 0.5);
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

        // Add enemy sprites to gameworld
        for(var x = 0; x < enemyCount; x++ ) {
          do {
            point = getEmptyPoint();
          }
          while(Phaser.Math.distance(point.x * 32, point.y * 32, ship.x, ship.y) < 300);

          enemyShadows.push(game.add.sprite(point.x * 32, point.y * 32, 'enemy'));
          enemies.push(game.add.sprite(point.x * 32, point.y * 32, 'enemy'));
        }

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

        // The first 4 parameters control if you need a boundary
        // on the left, right, top and bottom of your world.
        // The final parameter (false) controls if the boundary 
        // should use its own collision group or not.
        game.physics.p2.setBoundsToWorld(true, true, true, true, false);

        // Check for player sprite hitting an enemy
        ship.body.onBeginContact.add(enemyHit, this);
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
    }
  }
});
