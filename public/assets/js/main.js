//Counter
if ("IntersectionObserver" in window) {
    let counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let counter = entry.target;
          let target = parseInt(counter.innerText);
          let step = target / 200;
          let current = 0;
          let timer = setInterval(function () {
            current += step;
            counter.innerText = Math.floor(current);
            if (parseInt(counter.innerText) >= target) {
              clearInterval(timer);
            }
          }, 10);
          counterObserver.unobserve(counter);
        }
      });
    });

    let counters = document.querySelectorAll(".counter");
    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }

  //Gallery
  $(document).ready(function(){
    // filter
    $('.nav-gallery a').on('click', function(event){
        event.preventDefault();
        // current class
        $('.nav-gallery li.current').removeClass('current');
        $(this).parent().addClass('current');

        // set new heading
        $('h1.heading').text($(this).text());
        
        // filter link text
        var category = $(this).text().toLowerCase().replace(' ', '-');
        
        // remove hidden class if "all" is selected
        if(category == null){
            $('ul#gallery li:hidden').fadeIn('slow').removeClass('hidden');
        } else {
            $('ul#gallery li').each(function(){
              if(!$(this).hasClass(category)){
                  $(this).hide().addClass('hidden');
              } else {
                  $(this).fadeIn('slow').removeClass('hidden');
              }
            });
        }
        return false;        
    });
    // lightbox
    $('ul#gallery a').on('click', function(event){
        event.preventDefault();
        var link = $(this).find('img').attr('src');
        $('.gallery img').attr('src', '');
        $('.gallery img').attr('src', link);
        $('.gallery').fadeIn('slow');
    });
    // close lightbox
      $('.gallery').on('click', function(event){
          event.preventDefault();
          $('.gallery').fadeOut('slow');
      });
  });

    $(document).ready(function(){
      $('.togglebtn').click(function(){
          $('.myimgdivtoggle').toggle();
      });
    });