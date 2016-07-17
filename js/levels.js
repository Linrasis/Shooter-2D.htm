'use strict';

function load_level(id){
    background_rect.length = 0;
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
          {
            'color': '#000',
            'height': 100,
            'width': 100,
            'x': -50,
            'y': -50,
          },
          {
            'color': '#333',
            'height': 500,
            'width': 500,
            'x': -250,
            'y': -250,
          },
        ];
        foreground_rect = [
          {
            'collision': true,
            'color': '#777',
            'height': 100,
            'width': 100,
            'x': -50,
            'y': -200,
          },
          {
            'collision': false,
            'color': '#000',
            'height': 64,
            'width': 64,
            'x': -32,
            'y': -32,
          },
          {
            'collision': true,
            'color': '#777',
            'height': 100,
            'width': 100,
            'x': -50,
            'y': 100,
          },
        ];

        player['x'] = 125;

        enemies.push({
          'target-x': random_integer(500) - 250,
          'target-y': random_integer(500) - 250,
          'x': -125,
          'y': 0,
        });

    // level: Final Destination
    }else if(id === 2){
        level_settings = [
          id - 1,
          1,
          250,
          250,
        ];

        background_rect = [
          {
            'color': '#333',
            'height': 500,
            'width': 500,
            'x': -250,
            'y': -250,
          },
        ];

        player['x'] = 125;

        enemies.push({
          'target-x': random_integer(500) - 250,
          'target-y': random_integer(500) - 250,
          'x': -125,
          'y': 0,
        });

    // level: Zombie Surround
    }else if(id === 3){
        level_settings = [
          id - 1,
          settings_settings['zombie-amount'],
          400,
          400,
        ];

        background_rect = [
          {
            'color': '#333',
            'height': 800,
            'width': 800,
            'x': -400,
            'y': -400,
          },
        ];

        var zombie_x = 0;
        var zombie_y = 0;

        // Vreate proper number of zombies.
        var loop_counter = level_settings[1] - 1;
        do{
            // Calculate new zombie location away from player starting point.
            do{
                zombie_x = random_integer(level_settings[2] * 2) - level_settings[2];
                zombie_y = random_integer(level_settings[3] * 2) - level_settings[3];
            }while(zombie_x > -99
              && zombie_x < 99
              && zombie_y > -99
              && zombie_y < 99);

            enemies.push({
              'target-x': player['x'],
              'target-y': player['y'],
              'x': zombie_x,
              'y': zombie_y,
            });
        }while(loop_counter--);
    }
}
