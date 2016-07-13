'use strict';

function draw_logic(){
    // Save and translate buffer canvas.
    canvas_buffer.save();
    canvas_buffer.translate(
      canvas_x,
      canvas_y
    );

    // Draw visible background stuffs.
    for(var rect in background_rect){
        if(background_rect[rect]['x'] + background_rect[rect]['width'] + canvas_x - player['x'] <= 0
          || background_rect[rect]['x'] + canvas_x - player['x'] >= canvas_width
          || background_rect[rect]['y'] + background_rect[rect]['height'] + canvas_y - player['y'] <= 0
          || background_rect[rect]['y'] + canvas_y - player['y'] >= canvas_height){
            continue;
        }

        canvas_buffer.fillStyle = background_rect[rect]['color'];
        canvas_buffer.fillRect(
          -player['x'] + background_rect[rect]['x'],
          -player['y'] + background_rect[rect]['y'],
          background_rect[rect]['width'],
          background_rect[rect]['height']
        );
    }

    // Draw visible foreground environment stuffs.
    for(rect in foreground_rect){
        if(foreground_rect[rect]['x'] + foreground_rect[rect]['width'] + canvas_x - player['x'] <= 0
          || foreground_rect[rect]['x'] + canvas_x - player['x'] >= canvas_width
          || foreground_rect[rect]['y'] + foreground_rect[rect]['height'] + canvas_y - player['y'] <= 0
          || foreground_rect[rect]['y'] + canvas_y - player['y'] >= canvas_height){
            continue;
        }

        canvas_buffer.fillStyle = foreground_rect[rect]['color'];
        canvas_buffer.fillRect(
          -player['x'] + foreground_rect[rect]['x'],
          -player['y'] + foreground_rect[rect]['y'],
          foreground_rect[rect]['width'],
          foreground_rect[rect]['height']
        );
    }

    // Draw enemies.
    canvas_buffer.fillStyle = '#f66';
    for(var enemy in enemies){
        if(enemies[enemy]['x'] + 15 + canvas_x - player['x'] > 0
          && enemies[enemy]['x'] - 15 + canvas_x - player['x'] < canvas_width
          && enemies[enemy]['y'] + 15 + canvas_y - player['y'] > 0
          && enemies[enemy]['y'] - 15 + canvas_y - player['y'] < canvas_height){
            canvas_buffer.fillRect(
              -player['x'] + enemies[enemy]['x'] - 15,
              -player['y'] + enemies[enemy]['y'] - 15,
              30,
              30
            );
        }
    }

    // Draw player and targeting direction.
    canvas_buffer.fillStyle = settings_settings['color'];
    canvas_buffer.fillRect(
      -17,
      -17,
      34,
      34
    );
    var endpoint = math_fixed_length_line(
      0,
      0,
      mouse_x - canvas_x,
      mouse_y - canvas_y,
      25
    );
    canvas_buffer.beginPath();
    canvas_buffer.moveTo(
      0,
      0
    );
    canvas_buffer.lineTo(
      endpoint['x'],
      endpoint['y']
    );
    canvas_buffer.closePath();
    canvas_buffer.strokeStyle = '#fff';
    canvas_buffer.stroke();

    // Restore buffer.
    canvas_buffer.restore();

    // Get player position camera offset.
    var temp_viewoffset = [
      canvas_x - player['x'] - 5,
      canvas_y - player['y'] - 5,
    ];

    // Draw bullets.
    for(var bullet in bullets){
        canvas_buffer.fillStyle = bullets[bullet]['player'] === 0
          ? settings_settings['color']
          : '#f66';

        if(bullets[bullet]['x'] + 15 + temp_viewoffset[0] <= 0
          || bullets[bullet]['x'] + canvas_x - player['x'] >= canvas_width
          || bullets[bullet]['y'] + 15 + temp_viewoffset[1] <= 0
          || bullets[bullet]['y'] + canvas_y - player['y'] >= canvas_height){
            continue;
        }

        canvas_buffer.fillRect(
          Math.round(bullets[bullet]['x'] + temp_viewoffset[0]),
          Math.round(bullets[bullet]['y'] + temp_viewoffset[1]),
          10,
          10
        );
    }

    // Setup text display.
    canvas_buffer.fillStyle = '#fff';
    canvas_buffer.font = canvas_fonts['medium'];

    // Draw reload and hits.
    canvas_buffer.fillText(
      'Reload: ' + player['reload'] + '/' + settings_settings['weapon-reload'],
      5,
      25
    );
    canvas_buffer.fillText(
      'Hits: ' + hits,
      5,
      50
    );

    if(!game_running){
        // Draw game over or win message,
        //   depending upon if enemies remain.
        canvas_buffer.fillText(
          settings_settings['restart-key'] + ' = Restart',
          5,
          125
        );
        canvas_buffer.fillText(
          'ESC = Main Menu',
          5,
          150
        );
        canvas_buffer.fillStyle = enemies.length > 0
          ? '#f00'
          : '#0f0';
        canvas_buffer.font = canvas_fonts['big'];
        canvas_buffer.fillText(
          enemies.length > 0
            ? 'YOU ARE DEAD'
            : 'You Win!',
          5,
          100
        );
    }
}

function logic(){
    if(enemies.length <= 0){
        game_running = false;
    }

    if(!game_running){
        return;
    }

    var player_dx = 0;
    var player_dy = 0;

    // Add player key movments to dx and dy, if still within level boundaries.
    if(key_left
      && player['x'] - 2 > -level_settings[2]){
        player_dx -= 2;
    }

    if(key_right
      && player['x'] + 2 < level_settings[2]){
        player_dx += 2;
    }

    if(key_down
      && player['y'] + 2 < level_settings[3]){
        if(player_dx != 0){
            player_dx = player_dx / 2 * Math.SQRT2;
            player_dy += Math.SQRT2;

        }else{
            player_dy += 2;
        }
    }

    if(key_up
      && player['y'] - 2 > -level_settings[3]){
        if(player_dx != 0){
            player_dx = player_dx / 2 * Math.SQRT2;
            player_dy -= Math.SQRT2;

        }else{
            player_dy -= 2;
        }
    }

    // Check if player weapon can be fired, else update reload.
    if(player['reload'] >= settings_settings['weapon-reload']){
        // If weapon being fired...
        if(mouse_lock_x > 0){
            player['reload'] = 0;

            // ...calculate bullet movement...
            var speeds = math_movement_speed(
              player['x'],
              player['y'],
              player['x'] + mouse_x - canvas_x,
              player['y'] + mouse_y - canvas_y
            );

            // ...and add bullet with movement pattern, tied to player.
            bullets.push({
              'dx': mouse_x > canvas_x ? speeds[0] : -speeds[0],
              'dy': mouse_y > canvas_y ? speeds[1] : -speeds[1],
              'player': 0,
              'x': player['x'],
              'y': player['y'],
            });

            // If level != Zombie Surround, update AI destinations.
            if(canvas_mode < 3){
                enemies[0]['target-x'] = math_random_integer(500) - 250;
                enemies[0]['target-y'] = math_random_integer(500) - 250;
            }
        }

    }else{
        player['reload'] += 1;
    }

    // If level != Zombie Surround.
    if(canvas_mode < 3){
        // Update reload and fire weapon if possible.
        enemy_reload += 1;
        if(enemy_reload > settings_settings['weapon-reload']){
            enemy_reload = 0;

            // Calculate bullet destination based on player position...
            var speeds = math_movement_speed(
              enemies[0]['x'],
              enemies[0]['y'],
              player['x'],
              player['y']
            );

            // ...and add bullet with movement pattern, tied to enemy.
            bullets.push({
              'dx': enemies[0]['x'] > player['x'] ? -speeds[0] : speeds[0],
              'dy': enemies[0]['y'] > player['y'] ? -speeds[1] : speeds[1],
              'player': 1,
              'x': enemies[0]['x'],
              'y': enemies[0]['y'],
            });
        }
    }

    // Check for player collision with foreground obstacles.
    for(var rect in foreground_rect){
        if(player['x'] + player_dx - 17 > foreground_rect[rect]['x'] + foreground_rect[rect]['width']
          || player['x'] + player_dx + 17 < foreground_rect[rect]['x']
          || player['y'] + player_dy - 17 > foreground_rect[rect]['y'] + foreground_rect[rect]['height']
          || player['y'] + player_dy + 17 < foreground_rect[rect]['y']){
            continue;
        }

        if(player['y'] > foreground_rect[rect]['y'] - 17
          && player['y'] < foreground_rect[rect]['y'] + foreground_rect[rect]['height'] + 17){
            if(key_left
              && player['y'] + player_dy + 17 > foreground_rect[rect]['y']
              && player['y'] + player_dy - 17 < foreground_rect[rect]['y'] + foreground_rect[rect]['height']
              && player['x'] + player_dx - 17 < foreground_rect[rect]['x'] + foreground_rect[rect]['width']){
                player_dx = 0;

            }else if(key_right
              && player['y'] + player_dy + 17 > foreground_rect[rect]['y']
              && player['y'] + player_dy - 17 < foreground_rect[rect]['y'] + foreground_rect[rect]['height']
              && player['x'] + player_dx + 17 > foreground_rect[rect]['x']){
                player_dx = 0;
            }
        }

        if(key_down
          && player['x'] + player_dx + 17 > foreground_rect[rect]['x']
          && player['x'] + player_dx - 17 < foreground_rect[rect]['x'] + foreground_rect[rect]['width']
          && player['y'] + player_dy + 17 > foreground_rect[rect]['y']){
            player_dy = 0;

        }else if(key_up
          && player['x'] + player_dx + 17 > foreground_rect[rect]['x']
          && player['x'] + player_dx - 17 < foreground_rect[rect]['x'] + foreground_rect[rect]['width']
          && player['y'] + player_dy - 17 < foreground_rect[rect]['y'] + foreground_rect[rect]['height']){
            player_dy = 0;
        }
    }

    // Update actual player position.
    player['x'] += player_dx;
    player['y'] += player_dy;

    // Handle enemies.
    for(var enemy in enemies){
        // If level === Zombie Surround,
        //   update zombie target.
        if(canvas_mode === 3){
            enemies[enemy]['target-x'] = player['x'];
            enemies[enemy]['target-y'] = player['y'];
        }

        // Calculate enemy movement.
        var speeds = math_movement_speed(
          enemies[enemy]['x'],
          enemies[enemy]['y'],
          enemies[enemy]['target-x'],
          enemies[enemy]['target-y']
        );

        // If level != Zombie Surround,
        //   increase enemy speed and check for new target.
        if(canvas_mode != 3){
            speeds[0] *= 2;
            speeds[1] *= 2;

            // Check if enemy AI should pick new destination.
            if(enemies[enemy]['target-x'] > enemies[enemy]['x'] - 5
              && enemies[enemy]['target-x'] < enemies[enemy]['x'] + 5
              && enemies[enemy]['target-y'] > enemies[enemy]['y'] - 5
              && enemies[enemy]['target-y'] < enemies[enemy]['y'] + 5){
                enemies[enemy]['target-x'] = math_random_integer(500) - 250;
                enemies[enemy]['target-y'] = math_random_integer(500) - 250;
            }
        }

        // Move enemy towards target.
        enemies[enemy]['x'] += enemies[enemy]['target-x'] > enemies[enemy]['x']
          ? speeds[0]
          : -speeds[0];
        enemies[enemy]['y'] += enemies[enemy]['target-y'] > enemies[enemy]['y']
          ? speeds[1]
          : -speeds[1];

        // Check if player collides with enemy.
        if(enemies[enemy]['x'] + 15 - player['x'] > -17
          && enemies[enemy]['x'] - 15 - player['x'] < 17
          && enemies[enemy]['y'] + 15 - player['y'] > -17
          && enemies[enemy]['y'] - 15 - player['y'] < 17){
            game_running = false;
            return;
        }
    }

    // Handle bullets.
    for(var bullet in bullets){
        bullets[bullet]['x'] += 5 * bullets[bullet]['dx'];
        bullets[bullet]['y'] += 5 * bullets[bullet]['dy'];

        if(bullets[bullet]['x'] < -level_settings[2]
          || bullets[bullet]['x'] > level_settings[2]
          || bullets[bullet]['y'] < -level_settings[3]
          || bullets[bullet]['y'] > level_settings[3]){
            bullets.splice(
              bullet,
              1
            );
            continue;
        }

        var hit_foreground = false;

        for(var rect in foreground_rect){
            if(!foreground_rect[rect]['collision']
              || bullets[bullet]['x'] <= foreground_rect[rect]['x']
              || bullets[bullet]['x'] >= foreground_rect[rect]['x'] + foreground_rect[rect]['width']
              || bullets[bullet]['y'] <= foreground_rect[rect]['y']
              || bullets[bullet]['y'] >= foreground_rect[rect]['y'] + foreground_rect[rect]['height']){
                continue;
            }

            bullets.splice(
              bullet,
              1
            );
            hit_foreground = true;
            break;
        }

        if(hit_foreground){
            continue;
        }

        for(var enemy in enemies){
            if(bullets[bullet]['player'] === 0){
                if(bullets[bullet]['x'] <= enemies[enemy]['x'] - 15
                  || bullets[bullet]['x'] >= enemies[enemy]['x'] + 15
                  || bullets[bullet]['y'] <= enemies[enemy]['y'] - 15
                  || bullets[bullet]['y'] >= enemies[enemy]['y'] + 15){
                    continue;
                }

                bullets.splice(
                  bullet,
                  1
                );

                // If mode != Zombie Surround or zombies should respawn,
                //   pick new enemy location...
                if(mode < 3
                  || settings_settings['zombie-respawn']){
                    var enemy_x = 0;
                    var enemy_y = 0;

                    do{
                        enemy_x = math_random_integer(level_settings[2] * 2) - level_settings[2];
                        enemy_y = math_random_integer(level_settings[2] * 2) - level_settings[2];
                    }while(enemy_x > player['x'] - 50
                      && enemy_x < player['x'] + 50
                      && enemy_y > player['y'] - 50
                      && enemy_y < player['y'] + 50);

                    enemies[enemy]['x'] = enemy_x;
                    enemies[enemy]['y'] = enemy_y;

                }else{
                    enemies.splice(
                      enemy,
                      1
                    );
                }

                hits += 1;
                break;

            }else if(bullets[bullet]['x'] > player['x'] - 17
              && bullets[bullet]['x'] < player['x'] + 17
              && bullets[bullet]['y'] > player['y'] - 17
              && bullets[bullet]['y'] < player['y'] + 17){
                game_running = false;
                return;
            }
        }
    }
}

function setmode_logic(newgame){
    bullets.length = 0;
    enemies = [];
    game_running = true;
    mouse_lock_x = -1;

    // Main menu mode.
    if(canvas_mode === 0){
        document.body.innerHTML = '<div><div><b>Duel vs AI:</b><ul><li><a onclick="canvas_setmode(1, true)">Empty Square Arena</a><li><a onclick="canvas_setmode(2, true)">Final Destination</a></ul></div><hr>'
          + '<div><input id=zombie-amount><a onclick="canvas_setmode(3, true)">Zombie Surround</a><br>'
          + '<label><input id=zombie-respawn type=checkbox>Respawn</label></div></div>'
          + '<div class=right><div><input disabled value=ESC>Main Menu<br>'
          + '<input id=movement-keys maxlength=4>Move ↑←↓→<br>'
          + '<input id=restart-key maxlength=1>Restart<br>'
          + '<input disabled value=Click>Shoot</div><hr>'
          + '<div><input id=audio-volume max=1 min=0 step=0.01 type=range>Audio<br>'
          + '<input id=color type=color>Color<br>'
          + '<input id=ms-per-frame>ms/Frame<br>'
          + '<input id=weapon-reload>Weapon Reload<br>'
          + '<a onclick=settings_reset()>Reset Settings</a></div></div>';
        settings_update();

    // Game mode.
    }else{
        if(newgame){
            settings_save();
        }

        enemy_reload = 100;
        hits = 0;
        key_down = false;
        key_left = false;
        key_right = false;
        key_up = false;
        player = {
          'reload': settings_settings['weapon-reload'],
          'x': 0,
          'y': 0,
        };
    }
}

var background_rect = [];
var bullets = [];
var enemies = [];
var enemy_reload = 0;
var foreground_rect = [];
var game_running = true;
var hits = 0;
var key_down = false;
var key_left = false;
var key_right = false;
var key_up = false;
var level_settings = [];
var mouse_lock_x = 0;
var mouse_lock_y = 0;
var mouse_x = 0;
var mouse_y = 0;
var player = {};

window.onkeydown = function(e){
    if(canvas_mode <= 0){
        return;
    }

    var key = e.keyCode || e.which;

    // ESC: return to main menu.
    if(key === 27){
        canvas_setmode(
          0,
          true
        );
        return;
    }

    key = String.fromCharCode(key);

    if(key === settings_settings['movement-keys'][1]){
        key_left = true;

    }else if(key === settings_settings['movement-keys'][3]){
        key_right = true;

    }else if(key === settings_settings['movement-keys'][2]){
        key_down = true;

    }else if(key === settings_settings['movement-keys'][0]){
        key_up = true;

    }else if(key === settings_settings['restart-key']){
        canvas_setmode(
          canvas_mode,
          false
        );
    }
};

window.onkeyup = function(e){
    var key = String.fromCharCode(e.keyCode || e.which);

    if(key === settings_settings['movement-keys'][1]){
        key_left = false;

    }else if(key === settings_settings['movement-keys'][3]){
        key_right = false;

    }else if(key === settings_settings['movement-keys'][2]){
        key_down = false;

    }else if(key === settings_settings['movement-keys'][0]){
        key_up = false;
    }
};

window.onload = function(){
    settings_init(
      'Shooter-2D.htm-',
      {
        'audio-volume': 1,
        'color': '#009900',
        'movement-keys': 'WASD',
        'ms-per-frame': 25,
        'restart-key': 'H',
        'weapon-reload': 50,
        'zombie-amount': 25,
        'zombie-respawn': false,
      }
    );
    canvas_init();
}

window.onmousedown = function(e){
    if(canvas_mode <= 0){
        return;
    }

    e.preventDefault();
    mouse_lock_x = mouse_x;
    mouse_lock_y = mouse_y;
};

window.onmousemove = function(e){
    if(canvas_mode <= 0){
        return;
    }

    mouse_x = e.pageX;
    mouse_y = e.pageY;
};

window.onmouseup = function(e){
    mouse_lock_x = -1;
};
