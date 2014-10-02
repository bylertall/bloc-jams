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