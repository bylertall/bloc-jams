var albumPicasso = {
  name: 'The Colors',
  artist: 'Pablo Picasso',
  label: 'Cubism',
  year: '1881',
  albumArtUrl: '/images/album-placeholder.png',
  songs: [
      {name: 'Blue', length: 163.38, audioUrl: '/music/placeholders/blue'},
      {name: 'Green', length: 105.66, audioUrl: '/music/placeholders/green'},
      {name: 'Red', length: 270.14, audioUrl: '/music/placeholders/red'},
      {name: 'Pink', length: 154.81, audioUrl: '/music/placeholders/pink'},
      {name: 'Magenta', length: 375.92, audioUrl: '/music/placeholders/magenta'}
    ]
};

blocJams = angular.module('BlocJams', ['ui.router']);

blocJams.config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  /*Landing*/
  $stateProvider.state('landing', {
    url: '/',
    controller: 'Landing.controller',
    templateUrl: '/templates/landing.html'
  });

  /*Song page*/
  $stateProvider.state('song', {
    url:'/song',
    controller: 'Song.controller',
    templateUrl: '/templates/song.html'
  });
  
  /*Collection*/
  $stateProvider.state('collection', {
    url:'/collection',
    controller: 'Collection.controller',
    templateUrl: '/templates/collection.html'
  });

  /*Album*/
  $stateProvider.state('album', {
    url:'/album',
    controller: 'Album.controller',
    templateUrl: '/templates/album.html'
  });
}]);

// Controllers
blocJams.controller('Landing.controller', ['$scope', function($scope) {
  $scope.subText = "Turn the music up!";  

  $scope.subTextClicked = function() {
    $scope.subText += '!';
  };

  $scope.titleText = "<click-me></click-me>";

  $scope.titleTextClicked = function () {
    function shuffle(o){ //v1.0
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };
    shuffle($scope.albumURLs);
  };

  $scope.albumURLs = [
    '/images/album-placeholders/album-1.jpg',
    '/images/album-placeholders/album-2.jpg',
    '/images/album-placeholders/album-3.jpg',
    '/images/album-placeholders/album-4.jpg',
    '/images/album-placeholders/album-5.jpg',
    '/images/album-placeholders/album-6.jpg',
    '/images/album-placeholders/album-7.jpg',
    '/images/album-placeholders/album-8.jpg',
    '/images/album-placeholders/album-9.jpg',
  ];
}]); 

blocJams.controller('Song.controller', ['$scope', function($scope) {
  $scope.header = 'Song Template';
}]);

blocJams.controller('Collection.controller', ['$scope', 'SongPlayer', function($scope, SongPlayer) {
  $scope.albums = [];
  for (var i=0; i < 33; i++) {
    $scope.albums.push(angular.copy(albumPicasso));
  };

  $scope.playAlbum = function(album) {
    SongPlayer.setSong(album, album.songs[0]);
  }
}]);

blocJams.controller('Album.controller', ['$scope', 'SongPlayer', function($scope, SongPlayer) {
  $scope.album = angular.copy(albumPicasso);

  var hoveredSong = null;

  $scope.onHoverSong = function(song) {
    hoveredSong = song;
  };

  $scope.offHoverSong = function(song) {
    hoveredSong = null;
  };

  $scope.getSongState = function(song) {
    if (song === SongPlayer.currentSong && SongPlayer.playing) {
      return 'playing';
    }
    else if (song === hoveredSong) {
      return 'hovered';
    }
    return 'default';
  };

  $scope.playSong = function(song) {
    SongPlayer.setSong($scope.album, song);
  };

  $scope.pauseSong = function(song) {
    SongPlayer.pause();
  };
}]);

blocJams.controller('PlayerBar.controller', ['$scope', 'SongPlayer', function($scope, SongPlayer) {
  $scope.songPlayer = SongPlayer;

  $scope.volumeClass = function() {
    return {
      'fa-volume-off': SongPlayer.volume == 0,
      'fa-volume-down': SongPlayer.volume <= 70 && SongPlayer.volume > 0,
      'fa-volume-up': SongPlayer.volume > 70
    }
  };

  SongPlayer.onTimeUpdate(function(event, time) {
    $scope.$apply(function() {
      $scope.playTime = time;
    });
  });
}]);


// Services
blocJams.service('SongPlayer', ['$rootScope', function($rootScope) {
  var currentSoundFile = null;
  var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
  };

  return {
    currentSong: null,
    currentAlbum: null,
    playing: false,
    volume: 90,

    play: function() {
      if(currentSoundFile) {
        this.playing = true;
        currentSoundFile.play();
      }
    },
    pause: function() {
      if(currentSoundFile) {
        this.playing = false;
        currentSoundFile.pause();
      }
    },
    next: function() {
      var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
      currentTrackIndex++;
      if(currentTrackIndex >= this.currentAlbum.songs.length) {
        this.playing = false;
        currentSoundFile.stop();
        currentSoundFile = null;
      }
      var song = this.currentAlbum.songs[currentTrackIndex];
      this.setSong(this.currentAlbum, song);
    },
    previous: function() {
      var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
      currentTrackIndex--;
      if(currentTrackIndex < 0) {
        this.playing = false;
        currentSoundFile.stop();
        currentSoundFile = null;
      }
      var song = this.currentAlbum.songs[currentTrackIndex];
      this.setSong(this.currentAlbum, song);
    },
    seek: function(time) {
      //checks to make sure that a sound file is playing before seeking
      if(currentSoundFile) {
        //uses Buzz method to set time of the song
        currentSoundFile.setTime(time);
      }
    },
    onTimeUpdate: function(callback) {
      return $rootScope.$on('sound:timeupdate', callback);
    },
    setVolume: function(volume) {
      if(currentSoundFile) {
        currentSoundFile.setVolume(volume);
      }
      this.volume = volume;
    },
    mute: function(volume) {
      if(currentSoundFile) {
        currentSoundFile.toggleMute();
        
        if(currentSoundFile.isMuted()) {
          this.volume = 0;
        } else {
          this.volume = currentSoundFile.getVolume();
        }
      }
    },
    setSong: function(album, song) {
      if(currentSoundFile) {
        currentSoundFile.stop();
      }
      this.currentAlbum = album;
      this.currentSong = song;

      currentSoundFile = new buzz.sound(song.audioUrl, {
        formats: ['mp3'],
        preload: true
      });

      currentSoundFile.bind('timeupdate', function(e) {
        $rootScope.$broadcast('sound:timeupdate', this.getTime());
      });

      this.play();
    }
  };
}]);


// Directives & filters
blocJams.directive('slider', ['$document', function($document) {
  //Returns a number between 0 and 1 to determine where the mouse even happened along the slider bar
  var calculateSliderPercentFromMouseEvent = function($slider, event) {
    var offsetX = event.pageX - $slider.offset().left; //distance from left
    var sliderWidth = $slider.width();
    var offsetXPercent = (offsetX / sliderWidth);
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(1, offsetXPercent);
    return offsetXPercent;
  }

  var numberFromValue = function(value, defaultValue) {
    if(typeof value === 'number') {
      return value;
    }
    if(typeof value === 'undefined') {
      return defaultValue;
    }
    if(typeof value === 'string') {
      return Number(value);
    }
  }

  return {
    templateUrl: '/templates/directives/slider.html',
    replace: true,
    restrict: 'E',
    scope: {
      onChange: '&'
    },
    link: function(scope, element, attributes) {
      //These values represent the progress into the song/volume bar, and its max value
      //For now the values are arbitrary
      scope.value = 0;
      scope.max = 100;
      var $seekBar = $(element);

      attributes.$observe('value', function(newValue) {
        scope.value = numberFromValue(newValue, 0);
      });

      attributes.$observe('max', function(newValue) {
        scope.max = numberFromValue(newValue, 100) || 100;
      });

      var percentString = function() {
        var value = scope.value || 0;
        var max = scope.max || 100;
        percent = value / max * 100;
        return percent + "%";
      }

      scope.fillStyle = function() {
        return {width: percentString()};
      }

      scope.thumbStyle = function() {
        return {left: percentString()};
      }

      scope.onClickSlider = function(event) {
        var percent = calculateSliderPercentFromMouseEvent($seekBar, event);
        scope.value = percent * scope.max;
        notifyCallback(scope.value);
      }

      scope.trackThumb = function() {
        $document.bind('mousemove.thumb', function(event) {
          var percent = calculateSliderPercentFromMouseEvent($seekBar, event);
          scope.$apply(function() {
            scope.value = percent * scope.max;
            notifyCallback(scope.value);
          });
        });
        //cleanup
        $document.bind('mouseup.thumb', function() {
          $document.unbind('mousemove.thumb');
          $document.unbind('mouseup.thumb');
        });
      }

      var notifyCallback = function(newValue) {
        if(typeof scope.onChange === 'function') {
          scope.onChange({value: newValue});
        }
      };
    }
  };
}]);

blocJams.filter('timecode', function() {
  return function(seconds) {
    seconds = Number.parseFloat(seconds);

    //returned when no time is provided
    if(Number.isNaN(seconds)) {
      return '-:--';
    }

    //make it a whole number
    var wholeSeconds = Math.floor(seconds);

    var minutes = Math.floor(wholeSeconds / 60);

    remainingSeconds = wholeSeconds % 60;

    var output = minutes + ':';

    //zero pad seconds, so 9 seconds should be :09
    if(remainingSeconds < 10) {
      output += '0';
    }

    output += remainingSeconds;

    return output;
  }
})

blocJams.directive('clickMe', function() {
  return {
    template: '<h1 ng-click="titleTextClicked()">Bloc Jams</h1>',
    replace: true,
    restrict: 'E',
    link: function(scope, element, attrs) {
      element.click(function(event) {
        alert('You just shuffled your albums!')
      });
    }
  };
});

blocJams.directive('countHoverTime', function() {
  //initialize counter at zero
  var counter = 0;

  //initialize interval to null
  var interval = null;

  //set interval and counter incrementation
  var interval = null;

  var hoverTime = function(event) {
    interval = setInterval(function(){counter++}, 1000);
  };


  //log the counter value, clear the interval, reset counter to zero
  var logTime = function() {
    console.log(counter);
    clearInterval(interval);
    counter = 0;
  };
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.hover(hoverTime, logTime);
    }
  };
});