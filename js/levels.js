function load_level(id){
    foreground_rect.length = 0;

    // level: Empty Square Arena
    if(id === 1){
        level_settings = [
          id - 1,
          1,
          250,
          250,
        ];

        background_rect = [
          [-50,   -50, 100, 100, '#000', 0],
          [-250, -250, 500, 500, '#333'],
        ];
        foreground_rect = [
          [-50, -200, 100, 100, '#777', 1],
          [-32,  -32,  64,  64, '#000', 0],
          [-50,  100, 100, 100, '#777', 1],
        ];

        player_x = 125;
        player_y = 0;

        enemies.push({
          'target-x': random_number(500) - 250,
          'target-y': random_number(500) - 250,
          'x': -125,
          'y': 0,
        });

        enemy_reload = 100;
        weapon_reload = settings['weapon-reload'];

    // level: Final Destination
    }else if(id === 2){
        level_settings = [
          id - 1,
          1,
          250,
          250,
        ];

        background_rect = [
          [-250, -250, 500, 500, '#333'],
        ];

        player_x = 125;
        player_y = 0;

        enemies.push({
          'target-x': random_number(500) - 250,
          'target-y': random_number(500) - 250,
          'x': -125,
          'y': 0,
        });

        enemy_reload = 100;
        weapon_reload = settings['weapon-reload'];

    // level: Zombie Surround
    }else if(id === 3){
        level_settings = [
          id - 1,
          settings['zombie-amount'],
          400,
          400,
        ];

        background_rect = [
          [-400, -400, 800, 800, '#333'],
        ];

        player_x = 0;
        player_y = 0;

        var zombie_x = 0;
        var zombie_y = 0;

        // Vreate proper number of zombies.
        var loop_counter = level_settings[1] - 1;
        do{
            // Calculate new zombie location away from player starting point.
            do{
                zombie_x = random_number(level_settings[2] * 2) - level_settings[2];
                zombie_y = random_number(level_settings[3] * 2) - level_settings[3];
            }while(zombie_x > -99
              && zombie_x < 99
              && zombie_y > -99
              && zombie_y < 99);

            enemies.push({
              'target-x': player_x,
              'target-y': player_y,
              'x': zombie_x,
              'y': zombie_y,
            });
        }while(loop_counter--);

        enemy_reload = 100;
        weapon_reload = settings['weapon-reload'];
    }
}
