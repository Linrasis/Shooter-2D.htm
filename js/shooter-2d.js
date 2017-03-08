'use strict';

function draw_logic(){
    // Save and translate buffer canvas.
    canvas_buffer.save();
    canvas_buffer.translate(
      canvas_x,
      canvas_y
    );

    // Draw background environment.
    for(var rect in background_rect){
        canvas_buffer.fillStyle = background_rect[rect]['color'];
        canvas_buffer.fillRect(
          -player['x'] + background_rect[rect]['x'],
          -player['y'] + background_rect[rect]['y'],
          background_rect[rect]['width'],
          background_rect[rect]['height']
        );
    }

    // Draw foreground environment.
    for(rect in foreground_rect){
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
        canvas_buffer.fillRect(
          -player['x'] + enemies[enemy]['x'] - width_half,
          -player['y'] + enemies[enemy]['y'] - height_half,
          storage_data['width'],
          storage_data['height']
        );
    }

    // Draw player and targeting direction.
    canvas_buffer.fillStyle = storage_data['color'];
    canvas_buffer.fillRect(
      -width_half,
      -height_half,
      storage_data['width'],
      storage_data['height']
    );
    var endpoint = math_fixed_length_line({
      'length': 25,
      'x0': 0,
      'x1': mouse_x - canvas_x,
      'y0': 0,
      'y1': mouse_y - canvas_y,
    });
    canvas_draw_path({
      'properties': {
        'strokeStyle': '#fff',
      },
      'style': 'stroke',
      'vertices': [
        {
          'type': 'moveTo',
          'x': 0,
          'y': 0,
        },
        {
          'x': endpoint['x'],
          'y': endpoint['y'],
        },
      ],
    });

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
          ? storage_data['color']
          : '#f66';
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
      'Reload: ' + player['reload'] + '/' + storage_data['weapon-reload'],
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
          storage_data['restart-key'] + ' = Restart',
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

    if(!game_running
      || canvas_menu){
        return;
    }

    var player_dx = 0;
    var player_dy = 0;

    // Add player key movments to dx and dy, if still within level boundaries.
    if(key_left
      && player['x'] - storage_data['speed'] > -level_settings[2]){
        player_dx -= storage_data['speed'];
    }

    if(key_right
      && player['x'] + storage_data['speed'] < level_settings[2]){
        player_dx += storage_data['speed'];
    }

    if(key_down
      && player['y'] + storage_data['speed'] < level_settings[3]){
        if(player_dx != 0){
            player_dx = player_dx / 2 * Math.sqrt(storage_data['speed']);
            player_dy += Math.sqrt(storage_data['speed']);

        }else{
            player_dy += storage_data['speed'];
        }
    }

    if(key_up
      && player['y'] - storage_data['speed'] > -level_settings[3]){
        if(player_dx != 0){
            player_dx = player_dx / 2 * Math.sqrt(storage_data['speed']);
            player_dy -= Math.sqrt(storage_data['speed']);

        }else{
            player_dy -= storage_data['speed'];
        }
    }

    // Check if player weapon can be fired, else update reload.
    if(player['reload'] >= storage_data['weapon-reload']){
        // If weapon being fired...
        if(mouse_lock_x > 0){
            player['reload'] = 0;

            // ...calculate bullet movement...
            var speeds = math_move_2d({
              'x0': player['x'],
              'x1': player['x'] + mouse_x - canvas_x,
              'y0': player['y'],
              'y1': player['y'] + mouse_y - canvas_y,
            });

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
                set_destination(0);
            }
        }

    }else{
        player['reload'] += 1;
    }

    // If level != Zombie Surround.
    if(canvas_mode < 3){
        // Update reload and fire weapon if possible.
        enemy_reload += 1;
        if(enemy_reload > storage_data['weapon-reload']){
            enemy_reload = 0;

            // Calculate bullet destination based on player position...
            var speeds = math_move_2d({
              'x0': enemies[0]['x'],
              'x1': player['x'],
              'y0': enemies[0]['y'],
              'y1': player['y'],
            });

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
        if(player['x'] + player_dx - width_half > foreground_rect[rect]['x'] + foreground_rect[rect]['width']
          || player['x'] + player_dx + width_half < foreground_rect[rect]['x']
          || player['y'] + player_dy - height_half > foreground_rect[rect]['y'] + foreground_rect[rect]['height']
          || player['y'] + player_dy + height_half < foreground_rect[rect]['y']){
            continue;
        }

        if(player['y'] > foreground_rect[rect]['y'] - height_half
          && player['y'] < foreground_rect[rect]['y'] + foreground_rect[rect]['height'] + height_half){
            if(key_left
              && player['y'] + player_dy + height_half > foreground_rect[rect]['y']
              && player['y'] + player_dy - height_half < foreground_rect[rect]['y'] + foreground_rect[rect]['height']
              && player['x'] + player_dx - width_half < foreground_rect[rect]['x'] + foreground_rect[rect]['width']){
                player_dx = 0;

            }else if(key_right
              && player['y'] + player_dy + height_half > foreground_rect[rect]['y']
              && player['y'] + player_dy - height_half < foreground_rect[rect]['y'] + foreground_rect[rect]['height']
              && player['x'] + player_dx + width_half > foreground_rect[rect]['x']){
                player_dx = 0;
            }
        }

        if(key_down
          && player['x'] + player_dx + width_half > foreground_rect[rect]['x']
          && player['x'] + player_dx - width_half < foreground_rect[rect]['x'] + foreground_rect[rect]['width']
          && player['y'] + player_dy + height_half > foreground_rect[rect]['y']){
            player_dy = 0;

        }else if(key_up
          && player['x'] + player_dx + width_half > foreground_rect[rect]['x']
          && player['x'] + player_dx - width_half < foreground_rect[rect]['x'] + foreground_rect[rect]['width']
          && player['y'] + player_dy - height_half < foreground_rect[rect]['y'] + foreground_rect[rect]['height']){
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
        var speeds = math_move_2d({
          'multiplier': 2,
          'x0': enemies[enemy]['x'],
          'x1': enemies[enemy]['target-x'],
          'y0': enemies[enemy]['y'],
          'y1': enemies[enemy]['target-y'],
        });

        // Move enemy towards target.
        enemies[enemy]['x'] += enemies[enemy]['target-x'] > enemies[enemy]['x']
          ? speeds[0]
          : -speeds[0];
        enemies[enemy]['y'] += enemies[enemy]['target-y'] > enemies[enemy]['y']
          ? speeds[1]
          : -speeds[1];

        // If level != Zombie Surround,
        //   increase enemy speed and check for new target.
        if(canvas_mode != 3){
            speeds[0] *= storage_data['speed'];
            speeds[1] *= storage_data['speed'];

            // Check if enemy AI should pick new destination.
            var double_speed = storage_data['speed'] * 2;
            if(enemies[enemy]['target-x'] > enemies[enemy]['x'] - double_speed
              && enemies[enemy]['target-x'] < enemies[enemy]['x'] + double_speed
              && enemies[enemy]['target-y'] > enemies[enemy]['y'] - double_speed
              && enemies[enemy]['target-y'] < enemies[enemy]['y'] + double_speed){
                set_destination(enemy);
            }

        // Check if player collides with zombie.
        }else if(enemies[enemy]['x'] - player['x'] > -storage_data['width']
          && enemies[enemy]['x'] - player['x'] < storage_data['width']
          && enemies[enemy]['y'] - player['y'] > -storage_data['height']
          && enemies[enemy]['y'] - player['y'] < storage_data['height']){
            game_running = false;
            return;
        }
    }

    // Handle bullets.
    for(var bullet in bullets){
        bullets[bullet]['x'] += bullets[bullet]['dx'] * 5;
        bullets[bullet]['y'] += bullets[bullet]['dy'] * 5;

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
                if(bullets[bullet]['x'] <= enemies[enemy]['x'] - width_half
                  || bullets[bullet]['x'] >= enemies[enemy]['x'] + width_half
                  || bullets[bullet]['y'] <= enemies[enemy]['y'] - height_half
                  || bullets[bullet]['y'] >= enemies[enemy]['y'] + height_half){
                    continue;
                }

                bullets.splice(
                  bullet,
                  1
                );

                // If mode != Zombie Surround or zombies should respawn,
                //   pick new enemy location...
                if(canvas_mode < 3
                  || storage_data['zombie-respawn']){
                    var enemy_x = 0;
                    var enemy_y = 0;

                    do{
                        enemy_x = random_integer({
                          'max': level_settings[2] * 2,
                        }) - level_settings[2];
                        enemy_y = random_integer({
                          'max': level_settings[2] * 2,
                        }) - level_settings[2];
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

            }else if(bullets[bullet]['x'] > player['x'] - width_half
              && bullets[bullet]['x'] < player['x'] + width_half
              && bullets[bullet]['y'] > player['y'] - height_half
              && bullets[bullet]['y'] < player['y'] + height_half){
                game_running = false;
                return;
            }
        }
    }
}

function set_destination(id){
    enemies[id]['target-x'] = random_integer({
      'max': level_settings[2],
    }) - level_settings[2] / 2;
    enemies[id]['target-y'] = random_integer({
      'max': level_settings[3],
    }) - level_settings[3] / 2;
}

function setmode_logic(newgame){
    bullets.length = 0;
    enemies = [];
    game_running = true;
    mouse_lock_x = -1;

    // Main menu mode.
    if(canvas_mode === 0){
        document.body.innerHTML = '<div><div>Duel vs AI:<ul><li><a onclick=canvas_setmode({mode:1,newgame:true})>Empty Square Arena</a><li><a onclick=canvas_setmode({mode:2,newgame:true})>Final Destination</a></ul></div><hr>'
          + '<div><input id=zombie-amount><a onclick=canvas_setmode({mode:3,newgame:true})>Zombie Surround</a><br>'
          + '<label><input id=zombie-respawn type=checkbox>Respawn</label></div></div>'
          + '<div class=right><div><input disabled value=ESC>Menu<br>'
          + '<input id=movement-keys maxlength=4>Move ↑←↓→<br>'
          + '<input id=restart-key maxlength=1>Restart<br>'
          + '<input disabled value=Click>Shoot</div><hr>'
          + '<div><input id=audio-volume max=1 min=0 step=0.01 type=range>Audio<br>'
          + '<input id=color type=color>Color<br>'
          + '<input id=height>Height<br>'
          + '<input id=ms-per-frame>ms/Frame<br>'
          + '<input id=speed>Speed<br>'
          + '<input id=weapon-reload>Weapon Reload<br>'
          + '<input id=width>Width<br>'
          + '<a onclick=storage_reset()>Reset Settings</a></div></div>';
        storage_update();

    // Game mode.
    }else{
        if(newgame){
            storage_save();
        }

        enemy_reload = 100;
        height_half = storage_data['height'] / 2;
        hits = 0;
        key_down = false;
        key_left = false;
        key_right = false;
        key_up = false;
        player = {
          'reload': storage_data['weapon-reload'],
          'x': 0,
          'y': 0,
        };
        width_half = storage_data['width'] / 2;
    }
}

var background_rect = [];
var bullets = [];
var enemies = [];
var enemy_reload = 0;
var foreground_rect = [];
var game_running = true;
var height_half = 0;
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
var width_half = 0;

window.onload = function(){
    storage_init({
      'data': {
        'audio-volume': 1,
        'color': '#009900',
        'height': 34,
        'movement-keys': 'WASD',
        'ms-per-frame': 25,
        'restart-key': 'H',
        'speed': 2,
        'weapon-reload': 50,
        'width': 34,
        'zombie-amount': 25,
        'zombie-respawn': false,
      },
      'prefix': 'Shooter-2D.htm-',
    });
    canvas_init();

    window.onkeydown = function(e){
        if(canvas_mode <= 0){
            return;
        }

        var key = e.keyCode || e.which;

        // ESC: return to main menu.
        if(key === 27){
            canvas_menu_toggle();
            return;
        }

        key = String.fromCharCode(key);

        if(key === storage_data['movement-keys'][1]){
            key_left = true;

        }else if(key === storage_data['movement-keys'][3]){
            key_right = true;

        }else if(key === storage_data['movement-keys'][2]){
            key_down = true;

        }else if(key === storage_data['movement-keys'][0]){
            key_up = true;

        }else if(key === storage_data['restart-key']){
            canvas_setmode({
              'mode': canvas_mode,
            });

        }else if(key === 'Q'){
            canvas_menu_quit();
        }
    };

    window.onkeyup = function(e){
        var key = String.fromCharCode(e.keyCode || e.which);

        if(key === storage_data['movement-keys'][1]){
            key_left = false;

        }else if(key === storage_data['movement-keys'][3]){
            key_right = false;

        }else if(key === storage_data['movement-keys'][2]){
            key_down = false;

        }else if(key === storage_data['movement-keys'][0]){
            key_up = false;
        }
    };

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
}
