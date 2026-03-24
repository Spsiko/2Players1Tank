export const ENEMY_DATA =
{
  brown:
  {
    color:        'brown',
    gunColor:     'saddlebrown',
    bulletColor:  'orange',
    hitValue:   25,   // score per hit
    scoreValue: 75,  // bonus on kill
    bulletSpeed:  350,
    health:       1,
    maxBounces:   1,
    fireRate:     2.0,
    speed:        0,
    rotationSpeed: 0,
  },

  gray:
  {
    color:        'gray',
    gunColor:     'darkgray',
    bulletColor:  'white',
    bulletSpeed:  350,
    hitValue:     40,
    scoreValue:   110,
    health:       1,
    maxBounces:   1,
    fireRate:     1.5,
    speed:        80,
    rotationSpeed: 2,
  },

  teal:
  {
    color:         'teal',
    gunColor:      'darkcyan',
    bulletColor:   'cyan',
    bulletSpeed:   375,
    hitValue:      50,
    scoreValue:    200,
    health:        2,
    maxBounces:    2,
    fireRate:      1.2,
    speed:         100,
    rotationSpeed: 2.5,
  },

  black: {
    color:         '#222',
    gunColor:      '#444',
    bulletColor:   'white',
    bulletSpeed:   400,
    hitValue:      75,
    scoreValue:    300,
    health:        2,
    maxBounces:    2,
    fireRate:      1.8,
    speed:         90,
    rotationSpeed: 2,
  },

  white: {
    color:         'white',
    gunColor:      '#ccc',
    bulletColor:   'lightblue',
    bulletSpeed:   450,
    hitValue:      60,
    scoreValue:    250,
    health:        1,
    maxBounces:    1,
    fireRate:      0.6,  // fires frequently
    speed:         160,  // noticeably faster than others
    rotationSpeed: 3,
  }
};