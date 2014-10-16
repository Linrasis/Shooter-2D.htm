function draw(){
    if(game_running){
        player_dx = 0;
        player_dy = 0;

        // add player key movments to dx and dy, if still within level boundaries
        if(key_left
          && player_x - 2 > -level_settings[2]){
            player_dx -= 2;
        }

        if(key_right
          && player_x + 2 < level_settings[2]){
            player_dx += 2;
        }

        if(key_down
          && player_y + 2 < level_settings[3]){
            player_dy += 2;
        }

        if(key_up
          && player_y - 2 > -level_settings[3]){
            player_dy -= 2;
        }

        // check if player weapon can be fired, else update reload
        if(weapon_reload >= settings['weapon-reload']){
            // if weapon being fired
            if(mouse_lock_x > 0){
                weapon_reload = 0;

                // calculate bullet movement
                j = m(
                  player_x,
                  player_y,
                  player_x + mouse_x - x,
                  player_y + mouse_y - y
                );

                // add bullet with movement pattern, tied to player
                bullets.push([
                  player_x,
                  player_y,
                  (mouse_x > x ? j[0] : -j[0]),
                  (mouse_y > y ? j[1] : -j[1]),
                  0
                ]);

                // if level != Zombie Surround, update AI destinations
                if(mode < 3){
                  enemies[0][2] = random_number(500) - 250;
                  enemies[0][3] = random_number(500) - 250;
                }
            }

        }else{
            weapon_reload += 1;
        }

        // if level != Zombie Surround
        if(mode < 3){
            // if enemy can fire weapon, fire it. else update reload
            if(enemy_reload >= settings['weapon_reload']){
                enemy_reload = 0;

                // calculate bullet destination based on player destination
                j = m(
                  enemies[0][0],
                  enemies[0][1],
                  player_x + player_dx,
                  player_y + player_dy
                );

                // add bullet with movement pattern, tied to enemy
                bullets.push([
                  enemies[0][0],
                  enemies[0][1],
                  (enemies[0][0] > player_x ? -j[0] : j[0]),
                  (enemies[0][1] > player_y ? -j[1] : j[1]),
                  1
                ]);

            }else{
                enemy_reload += 1;
            }
        }

        // check for player collision with foreground obstacles
        var loop_counter = foreground_rect.length - 1;
        if(loop_counter >= 0){
            do{
                if(!(player_x + player_dx - 17 > foreground_rect[loop_counter][0] + foreground_rect[loop_counter][2]
                  || player_x + player_dx + 17 < foreground_rect[loop_counter][0]
                  || player_y + player_dy - 17 > foreground_rect[loop_counter][1] + foreground_rect[loop_counter][3]
                  || player_y + player_dy + 17 < foreground_rect[loop_counter][1])){
                    if(player_y != foreground_rect[loop_counter][1] - 18
                      && player_y != foreground_rect[loop_counter][1] + foreground_rect[loop_counter][3] + 18){
                        if(key_left
                          && player_y + player_dy + 17 > foreground_rect[loop_counter][1]
                          && player_y + player_dy - 17 < foreground_rect[loop_counter][1] + foreground_rect[loop_counter][3]
                          && player_x + player_dx - 17 < foreground_rect[loop_counter][0] + foreground_rect[loop_counter][2]){
                            player_dx = 0;
                        }

                        if(key_right
                          && player_y + player_dy + 17 > foreground_rect[loop_counter][1]
                          && player_y + player_dy - 17 < foreground_rect[loop_counter][1] + foreground_rect[loop_counter][3]
                          && player_x + player_dx + 17 > foreground_rect[loop_counter][0]){
                            player_dx = 0;
                        }
                    }

                    if(key_down
                      && player_x + player_dx + 17 > foreground_rect[loop_counter][0]
                      && player_x + player_dx - 17 < foreground_rect[loop_counter][0] + foreground_rect[loop_counter][2]
                      && player_y + player_dy + 17 > foreground_rect[loop_counter][1]){
                        player_dy = 0;
                    }

                    if(key_up
                      && player_x + player_dx + 17 > foreground_rect[loop_counter][0]
                      && player_x + player_dx - 17 < foreground_rect[loop_counter][0] + foreground_rect[loop_counter][2]
                      && player_y + player_dy - 17 < foreground_rect[loop_counter][1] + foreground_rect[loop_counter][3]){
                        player_dy = 0;
                    }
                }
            }while(loop_counter--);
        }

        // update actual player position
        player_x += player_dx;
        player_y += player_dy;
    }

    buffer.clearRect(
      0,
      0,
      width,
      height
    );

    // draw visible background stuffs
    loop_counter = background_rect.length - 1;
    if(loop_counter >= 0){
        do{
            if(background_rect[loop_counter][0] + background_rect[loop_counter][2] + x - player_x > 0
              && background_rect[loop_counter][0] + x - player_x < width
              && background_rect[loop_counter][1] + background_rect[loop_counter][3] + y - player_y > 0
              && background_rect[loop_counter][1] + y - player_y < height){
                buffer.fillStyle = background_rect[loop_counter][4];
                buffer.fillRect(
                  x - player_x + background_rect[loop_counter][0],
                  y - player_y + background_rect[loop_counter][1],
                  background_rect[loop_counter][2],
                  background_rect[loop_counter][3]
                );
            }
        }while(loop_counter--);
    }

    // draw visible foreground environment stuffs
    loop_counter = foreground_rect.length - 1;
    if(loop_counter >= 0){
        do{
            if(foreground_rect[loop_counter][0] + foreground_rect[loop_counter][2] + x - player_x > 0
              && foreground_rect[loop_counter][0] + x - player_x < width
              && foreground_rect[loop_counter][1] + foreground_rect[loop_counter][3] + y - player_y > 0
              && foreground_rect[loop_counter][1] + y - player_y < height){
                buffer.fillStyle = foreground_rect[loop_counter][4];
                buffer.fillRect(
                  x - player_x + foreground_rect[loop_counter][0],
                  y - player_y + foreground_rect[loop_counter][1],
                  foreground_rect[loop_counter][2],
                  foreground_rect[loop_counter][3]
                );
            }
        }while(loop_counter--);
    }

    // handle enemies
    loop_counter = enemies.length - 1;
    if(loop_counter >= 0){
        buffer.fillStyle = '#f66';
        do{
            if(game_running){
                // if level == Zombie Surround
                if(mode === 3){
                    // calculate enemy movement based on player location
                    j = m(
                      enemies[loop_counter][0],
                      enemies[loop_counter][1],
                      player_x,
                      player_y
                    );

                    // move enemies towards player
                    enemies[loop_counter][0] += player_x > enemies[loop_counter][0]
                      ? j[0]
                      : -j[0];
                    enemies[loop_counter][1] += player_y > enemies[loop_counter][1]
                      ? j[1]
                      : -j[1];

                // if level != Zombie Surround
                }else{
                    // calculate enemy movement based on destination
                    j = m(
                      enemies[loop_counter][0],
                      enemies[loop_counter][1],
                      enemies[loop_counter][2],
                      enemies[loop_counter][3]
                    );
                    j[0] *= 2;
                    j[1] *= 2;

                    // move enemies towards destination
                    enemies[loop_counter][0] += enemies[loop_counter][2] > enemies[loop_counter][0]
                      ? j[0]
                      : -j[0];
                    enemies[loop_counter][1] += enemies[loop_counter][3] > enemies[loop_counter][1]
                      ? j[1]
                      : -j[1];

                    // check if enemy AI should pick new destination
                    if(enemies[loop_counter][2] > enemies[loop_counter][0] - 5
                      && enemies[loop_counter][2] < enemies[loop_counter][0] + 5
                      && enemies[loop_counter][3] > enemies[loop_counter][1] - 5
                      && enemies[loop_counter][3] < enemies[loop_counter][1] + 5){
                        enemies[loop_counter][2] = random_number(500) - 250;
                        enemies[loop_counter][3] = random_number(500) - 250;
                    }
                }

                // check if player collides with enemy
                if(enemies[loop_counter][0] + 15 - player_x > -17
                  && enemies[loop_counter][0] - 15 - player_x < 17
                  && enemies[loop_counter][1] + 15 - player_y > -17
                  && enemies[loop_counter][1] - 15 - player_y < 17){
                    game_running = 0;
                }
            }

            // draw enemies
            if(enemies[loop_counter][0] + 15 + x - player_x > 0
              && enemies[loop_counter][0] - 15 + x - player_x < width
              && enemies[loop_counter][1] + 15 + y - player_y > 0
              && enemies[loop_counter][1] - 15 + y - player_y < height){
                buffer.fillRect(
                  x - player_x + enemies[loop_counter][0] - 15,
                  y - player_y + enemies[loop_counter][1] - 15,
                  30,
                  30
                );
            }
        }while(loop_counter--);

    }else{
        game_running = 0;
    }

    // draw player
    buffer.fillStyle = '#090';
    buffer.fillRect(
      x - 17,
      y - 17,
      34,
      34
    );

    // handle bullets
    loop_counter = bullets.length - 1;
    if(loop_counter >= 0){
        if(game_running){
            // check if bullets collide with player or enemies
            do{
                bullets[loop_counter][0] += 5 * bullets[loop_counter][2];
                bullets[loop_counter][1] += 5 * bullets[loop_counter][3];

                if(bullets[loop_counter][0] < -level_settings[2]
                  || bullets[loop_counter][1] < -level_settings[3]
                  || bullets[loop_counter][0] > level_settings[2]
                  || bullets[loop_counter][1] > level_settings[3]){
                    bullets.splice(
                      loop_counter,
                      1
                    );

                }else{
                    j = foreground_rect.length - 1;
                    var temp_hit = 0;

                    if(j >= 0){
                        do{
                            if(foreground_rect[j][5]
                              && bullets[loop_counter][0] > foreground_rect[j][0]
                              && bullets[loop_counter][0] < foreground_rect[j][0] + foreground_rect[j][2]
                              && bullets[loop_counter][1] > foreground_rect[j][1]
                              && bullets[loop_counter][1] < foreground_rect[j][1] + foreground_rect[j][3]){
                                bullets.splice(
                                  loop_counter,
                                  1
                                );
                                temp_hit = 1;
                                break;
                            }
                        }while(j--);
                    }

                    if(!temp_hit){
                        j = enemies.length - 1;
                        if(j >= 0){
                            do{
                                if(!bullets[loop_counter][4]){
                                    if(bullets[loop_counter][0] > enemies[j][0] - 15
                                      && bullets[loop_counter][0] < enemies[j][0] + 15
                                      && bullets[loop_counter][1] > enemies[j][1] - 15
                                      && bullets[loop_counter][1] < enemies[j][1] + 15){
                                        bullets.splice(
                                          loop_counter,
                                          1
                                        );

                                        // if mode != Zombie Surround, pick new enemy location
                                        if(mode < 3){
                                            do{
                                                ii = random_number(level_settings[2] * 2) - level_settings[2];
                                                jj = random_number(level_settings[2] * 2) - level_settings[2];
                                            }while(ii > player_x - 50
                                              && ii < player_x + 50
                                              && jj > player_y - 50
                                              && jj < player_y + 50);

                                            enemies[j][0] = ii;
                                            enemies[j][1] = jj;

                                        // else delete enemy
                                        }else{
                                            enemies.splice(
                                              j,
                                              1
                                            );
                                        }

                                        hits += 1;
                                        break;
                                    }

                                }else if(bullets[loop_counter][0] > player_x - 17
                                  && bullets[loop_counter][0] < player_x + 17
                                  && bullets[loop_counter][1] > player_y - 17
                                  && bullets[loop_counter][1] < player_y + 17){
                                    game_running = 0;
                                    break;
                                }
                            }while(j--);
                        }
                    }
                }
            }while(loop_counter--);
        }

        // draw bullets
        loop_counter = bullets.length - 1;
        if(loop_counter >= 0){

            // get player position camera offset
            var temp_viewoffset = [
              x - player_x - 5,
              y - player_y - 5
            ];

            do{
                buffer.fillStyle = bullets[loop_counter][4] == 0
                  ? '#0f0'
                  : '#f00';

                if(bullets[loop_counter][0] + 15 + temp_viewoffset[0] > 0
                  && bullets[loop_counter][0] + x - player_x < width
                  && bullets[loop_counter][1] + 15 + temp_viewoffset[1] > 0
                  && bullets[loop_counter][1] + y - player_y < height){
                    buffer.fillRect(
                      bullets[loop_counter][0] + temp_viewoffset[0],
                      bullets[loop_counter][1] + temp_viewoffset[1],
                      10,
                      10
                    );
                }
            }while(loop_counter--);
        }
    }

    // setup text display
    buffer.fillStyle = '#fff';
    buffer.font = '23pt sans-serif';
    buffer.textAlign = 'left';

    // draw reload and hits
    buffer.fillText(
      'Reload: ' + weapon_reload + '/' + settings['weapon-reload'],
      5,
      29
    );
    buffer.fillText(
      'Hits: ' + hits,
      5,
      64
    );

    if(!game_running){
        // draw game over or win message
        // depends upon if enemies remain
        buffer.textAlign = 'center';
        buffer.fillText(
          settings['restart-key'] + ' = Restart',// restart key
          x,
          y / 2 + 42
        );
        buffer.fillText(
          'ESC = Main Menu',
          x,
          y / 2 + 75
        );
        buffer.fillStyle = enemies.length > 0
          ? '#f00'
          : '#0f0';
        buffer.font = '42pt sans-serif';
        buffer.fillText(
          enemies.length > 0
            ? 'YOU ARE DEAD'
            : 'You Win!',
          x,
          y / 2
        );
    }

    canvas.clearRect(
      0,
      0,
      width,
      height
    );
    canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );
}

function m(x0,y0,x1,y1){
    var j0 = Math.abs(x0 - x1);
    var j1 = Math.abs(y0 - y1);

    if(j0 > j1){
        return [1, j1 / j0];

    }else if(j1 > j0){
        return [j0 / j1, 1];

    }else{
        return [.5, .5];
    }
}

function play_audio(i){
    if(settings['audio-volume'] > 0){
        document.getElementById(i).currentTime = 0;
        document.getElementById(i).play();
    }
}

function random_number(i){
    return Math.floor(Math.random() * i);
}

function reset(){
    if(confirm('Reset settings?')){
        document.getElementById('audio-volume').value = 1;
        document.getElementById('movement-keys').value = 'WASD';
        document.getElementById('ms-per-frame').value = 25;
        document.getElementById('restart-key').value = 'H';
        document.getElementById('weapon-reload').value = 50;
        document.getElementById('zombie-amount').value = 25;
        save();
    }
}

function resize(){
    if(mode > 0){
        height = window.innerHeight;
        document.getElementById('buffer').height = height;
        document.getElementById('canvas').height = height;
        y = height / 2;

        width = window.innerWidth;
        document.getElementById('buffer').width = width;
        document.getElementById('canvas').width = width;
        x = width / 2;
    }
}

function save(){
    // Save audio-volume setting.
    if(document.getElementById('audio-volume').value === 1){
        window.localStorage.removeItem('Shooter-2D.htm-audio-volume');
        settings['audio-volume'] = 1;

    }else{
        settings['audio-volume'] = parseFloat(document.getElementById('audio-volume').value);
        window.localStorage.setItem(
          'Shooter-2D.htm-audio-volume',
          settings['audio-volume']
        );
    }

    // Save movement-keys setting.
    if(document.getElementById('movement-keys').value == 'WASD'){
        window.localStorage.removeItem('Shooter-2D.htm-movement-keys');
        settings['movement-keys'] = 'WASD';

    }else{
        settings['movement-keys'] = document.getElementById('movement-keys').value;
        window.localStorage.setItem(
          'Shooter-2D.htm-movement-keys',
          settings['movement-keys']
        );
    }

    // Save ms-per-frame setting.
    if(document.getElementById('ms-per-frame').value == 25
      || isNaN(document.getElementById('ms-per-frame').value)
      || document.getElementById('ms-per-frame').value < 1){
        window.localStorage.removeItem('Shooter-2D.htm-ms-per-frame');
        document.getElementById('ms-per-frame').value = 25;
        settings['ms-per-frame'] = 25;

    }else{
        settings['ms-per-frame'] = parseInt(document.getElementById('ms-per-frame').value);
        window.localStorage.setItem(
          'Shooter-2D.htm-ms-per-frame',
          settings['ms-per-frame']
        );
    }

    // Save restart-key setting.
    if(document.getElementById('restart-key').value == 'AD'){
        window.localStorage.removeItem('Shooter-2D.htm-restart-key');
        settings['restart-key'] = 'H';

    }else{
        settings['restart-key'] = document.getElementById('restart-key').value;
        window.localStorage.setItem(
          'Shooter-2D.htm-restart-key',
          settings['restart-key']
        );
    }

    // Save weapon-reload setting.
    if(document.getElementById('weapon-reload').value == 50
      || isNaN(document.getElementById('weapon-reload').value)
      || document.getElementById('weapon-reload').value < 1){
        window.localStorage.removeItem('Shooter-2D.htm-weapon-reload');
        document.getElementById('weapon-reload').value = 50;
        settings['weapon-reload'] = 50;

    }else{
        settings['weapon-reload'] = parseInt(document.getElementById('weapon-reload').value);
        window.localStorage.setItem(
          'Shooter-2D.htm-weapon-reload',
          settings['weapon-reload']
        );
    }

    // Save zombie-amount setting.
    if(document.getElementById('zombie-amount').value == 25
      || isNaN(document.getElementById('zombie-amount').value)
      || document.getElementById('zombie-amount').value < 1){
        window.localStorage.removeItem('Shooter-2D.htm-zombie-amount');
        document.getElementById('zombie-amount').value = 25;
        settings['zombie-amount'] = 25;

    }else{
        settings['zombie-amount'] = parseInt(document.getElementById('zombie-amount').value);
        window.localStorage.setItem(
          'Shooter-2D.htm-zombie-amount',
          settings['zombie-amount']
        );
    }
}

function setmode(newmode, newgame){
    clearInterval(interval);

    bullets.length = 0;
    enemies = [];
    game_running = 1;
    mode = newmode;
    mouse_lock_x = -1;

    // game mode
    if(mode > 0){
        if(newgame){
            save();
        }

        hits = 0;
        key_down = 0;
        key_left = 0;
        key_right = 0;
        key_up = 0;

        load_level(mode);

        if(newgame){
            document.getElementById('page').innerHTML = '<canvas id=canvas oncontextmenu="return false"></canvas>';
            buffer = document.getElementById('buffer').getContext('2d');
            canvas = document.getElementById('canvas').getContext('2d');
            resize();
        }

        interval = setInterval(
          'draw()',
          settings['ms-per-frame']// ms-per-frame
        );

    // main menu mode
    }else{
        buffer = 0;
        canvas = 0;

        document.getElementById('page').innerHTML = '<div style=display:inline-block;text-align:left;vertical-align:top><div class=c><b>Shooter-2D.htm</b></div><hr><div class=c><b>Duel vs AI:</b><ul><li><a onclick=setmode(1,1)>Empty Square Arena</a><li><a onclick=setmode(2,1)>Final Destination</a></ul></div><hr><div class=c><input id=zombie-amount value='
          + settings['zombie-amount'] + '><a onclick=setmode(3,1)>Zombie Surround</a></div></div><div style="border-left:8px solid #222;display:inline-block;text-align:left"><div class=c><input disabled style=border:0 value=ESC>Main Menu<br><input id=movement-keys maxlength=4 value='
          + settings['movement-keys'] + '>Move ↑←↓→<br><input id=restart-key maxlength=1 value='
          + settings['restart-key'] + '>Restart<br><input disabled style=border:0 value=Click>Shoot</div><hr><div class=c><input id=audio-volume max=1 min=0 step=.01 type=range value='
          + settings['audio-volume'] + '>Audio<br><input id=ms-per-frame value='
          + settings['ms-per-frame'] + '>ms/Frame<br><input id=weapon-reload value='
          + settings['weapon-reload'] + '>Weapon Reload<br><a onclick=reset()>Reset Settings</a></div></div>';
    }
}

var background_rect = [];
var buffer = 0;
var bullets = [];
var canvas = 0;
var enemies = [];
var enemy_reload = 0;
var foreground_rect = [];
var game_running = 1;
var height = 0;
var hits = 0;
var interval = 0;
var j = 0;
var key_down = 0;
var key_left = 0;
var key_right = 0;
var key_up = 0;
var level_settings = [];
var mode = 0;
var mouse_lock_x = 0;
var mouse_lock_y = 0;
var mouse_x = 0;
var mouse_y = 0;
var player_dx = 0;
var player_dy = 0;
var player_x = 0;
var player_y = 0;
var settings = {
  'audio-volume': window.localStorage.getItem('Shooter-2D.htm-audio-volume') === null
    ? 1
    : parseFloat(window.localStorage.getItem('Shooter-2D.htm-audio-volume')),
  'movement-keys': window.localStorage.getItem('Shooter-2D.htm-movement-keys') === null
    ? 'WASD'
    : window.localStorage.getItem('Shooter-2D.htm-movement-keys'),
  'ms-per-frame': window.localStorage.getItem('Shooter-2D.htm-ms-per-frame') === null
    ? 25
    : parseInt(window.localStorage.getItem('Shooter-2D.htm-ms-per-frame')),
  'restart-key': window.localStorage.getItem('Shooter-2D.htm-restart-key') === null
    ? 'H'
    : window.localStorage.getItem('Shooter-2D.htm-restart-key'),
  'weapon-reload': window.localStorage.getItem('Shooter-2D.htm-weapon-reload') === null
    ? 50
    : parseInt(window.localStorage.getItem('Shooter-2D.htm-weapon-reload')),
  'zombie-amount': window.localStorage.getItem('Shooter-2D.htm-zombie-amount') === null
    ? 25
    : parseFloat(window.localStorage.getItem('Shooter-2D.htm-zombie-amount')),
};
var weapon_reload = 0;
var width = 0;
var x = 0;
var y = 0;

setmode(0, 1);

window.onkeydown = function(e){
    if(mode > 0){
        var key = window.event ? event : e;
        key = key.charCode ? key.charCode : key.keyCode;

        if(key === 27){// ESC
            setmode(0, 1);

        }else{
            key = String.fromCharCode(key);

            if(key === settings['movement-keys'][1]){
                key_left = 1;

            }else if(key === settings['movement-keys'][3]){
                key_right = 1;

            }else if(key === settings['movement-keys'][2]){
                key_down = 1;

            }else if(key === settings['movement-keys'][0]){
                key_up = 1;

            }else if(key === settings['restart-key']){
                setmode(mode, 0);
            }
        }
    }
};

window.onkeyup = function(e){
    var key = window.event ? event : e;
    key = String.fromCharCode(key.charCode ? key.charCode : key.keyCode);

    if(key === settings['movement-keys'][1]){
        key_left = 0;

    }else if(key === settings['movement-keys'][3]){
        key_right = 0;

    }else if(key === settings['movement-keys'][2]){
        key_down = 0;

    }else if(key === settings['movement-keys'][0]){
        key_up = 0;
    }
};

window.onmousedown = function(e){
    if(mode > 0){
        e.preventDefault();
        mouse_lock_x = mouse_x;
        mouse_lock_y = mouse_y;
    }
};

window.onmousemove = function(e){
    if(mode > 0){
        mouse_x = e.pageX;
        if(mouse_x < 0){
            mouse_x = 0;
        }else if(mouse_x > width){
            mouse_x = width;
        }

        mouse_y = e.pageY;
        if(mouse_y < 0){
            mouse_y = 0;
        }else if(mouse_y > height){
            mouse_y = height;
        }
    }
};

window.onmouseup = function(e){
    mouse_lock_x = -1;
};

window.onresize = resize;
