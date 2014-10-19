(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("scripts/album", function(exports, require, module) {
var albumPicasso = {
  name: 'The Colors',
  artist: 'Pablo Picasso',
  label: 'Cubism',
  year: '1881',
  albumArtUrl: '/images/album-placeholder.png',
  songs: [
      {name: 'Blue', length: '4:26'},
      {name: 'Green', length: '3:14'},
      {name: 'Red', length: '5:01'},
      {name: 'Pink', length: '3:21'},
      {name: 'Magenta', length: '2:15'}
    ]
};

var albumMarconi = {
  name: 'The Telephone',
  artist: 'Guglielmo Marconi',
  label: 'EM',
  year: '1909',
  albumArtUrl: '/images/album-placeholder.png',
  songs: [
      {name: 'Hello, Operator?', length: '1:01'},
      {name: 'Ring, ring, ring', length: '5:01'},
      {name: 'Fits in your pocket', length: '3:21'},
      {name: 'Can you hear me now?', length: '3:14'},
      {name: 'Wrong phone number', length: '2:15'}
    ]
};

//Track data

var currentlyPlayingSong = null;
var createSongRow = function(songNumber, songName, songLength) {
  var template =
      '<tr>'
    + '  <td class="song-number col-md-1" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    + '  <td class="col-md-9">' + songName + '</td>'
    + '  <td class="col-md-2">' + songLength + '</td>'
    + '</tr>'
  ;

  /*Instead of returning the row immediately, we'll attach hover
    functionality first*/
  var $row = $(template);

  var onHover = function(event) {
    var songNumberCell = $(this).find('.song-number');
    var songNumber = songNumberCell.data('song-number');
    if (songNumber !== currentlyPlayingSong) {
      songNumberCell.html('<a class="album-song-button"><i class="fa fa-play"></i></a>');
    };
  };

  var offHover = function(event) {
    var songNumberCell = $(this).find('.song-number');
    var songNumber = songNumberCell.data('song-number');
    if (songNumber !== currentlyPlayingSong) {
      songNumberCell.html(songNumber);
    };
  };

  //Toggle play, pause, song # based on the button clicked
  var clickHandler = function(event) {
    var songNumber = $(this).data('song-number');

    if (currentlyPlayingSong !== null) {
      //Revert to song # for currently playing song because user started new song
      var currentlyPlayingCell = $('.song-number[data-song-number="' + currentlyPlayingSong + '"]');
      currentlyPlayingCell.html(currentlyPlayingSong);
    }

    if (currentlyPlayingSong !== songNumber) {
      //Switch from Play -> Pause button to indicate new song is playing
      $(this).html('<a class="album-song-button"><i class="fa fa-pause"></i></a>');
      currentlyPlayingSong = songNumber;
    }
    else if (currentlyPlayingSong === songNumber) {
      //Switch from Pause -> Play button to pause currently playing song
      $(this).html('<a class="album-song-button"><i class="fa fa-pause"></i></a>');
      currentlyPlayingSong = null;
    }
  };

  $row.find('.song-number').click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;
};


var changeAlbumView = function(album) {
  //Update the album title
  var $albumTitle = $('.album-title');
  $albumTitle.text(album.name);

  //Update the album artist
  var $albumArtist = $('.album-artist');
  $albumArtist.text(album.artist);

  //Update the meta info
  var $albumMeta = $('.album-meta-info');
  $albumMeta.text(album.year + " on " + album.label);

  //Update the album image
  var $albumImage = $('.album-image img');
  $albumImage.attr('src', album.albumArtUrl);

  //Update the song list
  var $songList = $('.album-song-listing');
  $songList.empty();
  var songs = album.songs;
  for (var i=0; i<songs.length; i++) {
    var songData = songs[i];
    var $newRow = createSongRow(i+1, songData.name, songData.length);
    $songList.append($newRow);
  };
}; 


if(document.URL.match(/\/album.html/)) {
  $(document).ready(function() {
    changeAlbumView(albumPicasso);
    setupSeekBars();
  });
};












});

;require.register("scripts/app", function(exports, require, module) {
var albumPicasso = {
  name: 'The Colors',
  artist: 'Pablo Picasso',
  label: 'Cubism',
  year: '1881',
  albumArtUrl: '/images/album-placeholder.png',
  songs: [
      {name: 'Blue', length: '4:26', audioUrl: '/music/placeholders/blue'},
      {name: 'Green', length: '3:14', audioUrl: '/music/placeholders/green'},
      {name: 'Red', length: '5:01', audioUrl: '/music/placeholders/red'},
      {name: 'Pink', length: '3:21', audioUrl: '/music/placeholders/pink'},
      {name: 'Magenta', length: '2:15', audioUrl: '/music/placeholders/magenta'}
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

  $scope.titleText = "Bloc Jams";

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
}]);


// Services
blocJams.service('SongPlayer', function() {
  var currentSoundFile = null;
  var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
  };

  return {
    currentSong: null,
    currentAlbum: null,
    playing: false,

    play: function() {
      this.playing = true;
      currentSoundFile.play();
    },
    pause: function() {
      this.playing = false;
      currentSoundFile.pause();
    },
    next: function() {
      var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
      currentTrackIndex++;
      if(currentTrackIndex >= this.currentAlbum.songs.length) {
        this.playing = false;
        currentSong = null;
      }
      var song = this.currentAlbum.songs[currentTrackIndex];
      this.setSong(this.currentAlbum, song);
    },
    previous: function() {
      var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
      currentTrackIndex--;
      if(currentTrackIndex < 0) {
        this.playing = false;
        currentSong = null;
      }
      var song = this.currentAlbum.songs[currentTrackIndex];
      this.setSong(this.currentAlbum, song);
    },
    setSong: function(album, song) {
      if (currentSoundFile) {
        currentSoundFile.stop();
      }
      this.currentAlbum = album;
      this.currentSong = song;
      currentSoundFile = new buzz.sound(song.audioUrl, {
        formats: ['mp3'],
        preload: true
      });
      this.play();
    }
  };
});

blocJams.directive('slider', function() {
  var updateSeekPercentage = function($seekBar, event) {
    var barWidth = $seekBar.width();
    var offsetX = event.pageX - $seekBar.offset().left;

    var offsetXPercent = (offsetX / barWidth) * 100;
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
  }

  return {
    templateUrl: '/templates/directives/slider.html',
    replace: true,
    restrict: 'E',
    link: function(scope, element, attributes) {
      var $seekBar = $(element);

      $seekBar.click(function(event) {
        updateSeekPercentage($seekBar, event);
      });

      $seekBar.find('.thumb').mousedown(function(event) {
        $seekBar.addClass('no-animate');

        $(document).bind('mousemove.thumb', function(event) {
          updateSeekPercentage($seekBar, event);
        });

        $(document).bind('mouseup.thumb', function() {
          $seekBar.removeClass('no-animate');
          $(document).unbind('mousemove.thumb');
          $(document).unbind('mouseup.thumb');
        });
      });
    }
  };
});

});

;require.register("scripts/collection", function(exports, require, module) {
var buildAlbumThumbnail = function () {
  var template =
      '<div class="collection-album-container col-md-2">'
    + '  <div class="collection-album-image-container">'
    + '    <img src="/images/album-placeholder.png"/>'
    + '  </div>'
    + '  <div class="caption album-collection-info">'
    + '    <p>'
    + '      <a class="album-name" href="/album.html">Album Name</a>'
    + '      <br/>'
    + '      <a href="/album.html">Artist name</a>'
    + '      <br/>'
    + '      X songs'
    + '      <br/>'
    + '    </p>'
    + '  </div>'
    + '</div>';
    return $(template);
};

var buildAlbumOverlay = function(albumURL) {
  var template = 
      '<div class="collection-album-image-overlay">'
    + '  <div class="collection-overlay-content">'
    + '    <a class="collection-overlay-button" href="' + albumURL + '">'
    + '      <i class="fa fa-play"></i>'
    + '    </a>'
    + '    &nbsp;'
    + '    <a class="collection-overlay-button">'
    + '      <i class="fa fa-plus"></i>'
    + '    </a>'
    + '  </div>'
    + '</div>'
    ;
  return $(template);
}

var updateCollectionView = function() {
  var $collection = $(".collection-container .row");
    $collection.empty();

    for (var i=0; i<33; i++) {
      var $newThumbnail = buildAlbumThumbnail();
      $collection.append($newThumbnail);
    };

    var onHover = function(event) {
      $(this).append(buildAlbumOverlay('/album.html'));
    };

    var offHover = function(event) {
      $(this).find('.collection-album-image-overlay').remove();
    };

    $collection.find('.collection-album-image-container').hover(onHover, offHover);
};

if(document.URL.match(/\/collection.html/)) {
  $(document).ready(function() {
    updateCollectionView();
  });
};


});

;require.register("scripts/landing", function(exports, require, module) {
$(document).ready(function() {
  $('.hero-content h3').click(function(){
    subText = $(this).text();
    $(this).text(subText + '!');
  });

  $('.selling-points .point').hover(function() {
    //On hover, slide point down
    console.log('Hover action triggered.');
    $(this).animate({'margin-top': '10px'});
  }, function(){
    //Off hover, put point back where it was
    console.log('Off-hover action triggered.');
    $(this).animate({'margin-top': '0'});
  });
}); 
});

;require.register("scripts/profile", function(exports, require, module) {
//holds the name of our tab button container for selection later in the function
var tabsContainer = '.user-profile-tabs-container';
var selectTabHandler = function(event) {
  $tab = $(this);
  $(tabsContainer + ' li').removeClass('active');
  $tab.parent().addClass('active');
  selectedTabName = $tab.attr('href');
  console.log(selectedTabName);
  $('.tab-pane').addClass('hidden');
  $(selectedTabName).removeClass('hidden');
  event.preventDefault();
};

if(document.URL.match(/\/profile.html/)) {
  $(document).ready(function() {
    var $tabs = $(tabsContainer + ' a');
    $tabs.click(selectTabHandler);
    $tabs[0].click();
  });
};
});

;
//# sourceMappingURL=app.js.map