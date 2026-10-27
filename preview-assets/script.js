(function(){
  var els=document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){
    els.forEach(function(e){e.classList.add('in')});
  }else{
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
    },{threshold:.12});
    els.forEach(function(e){io.observe(e)});
  }
  var b=document.getElementById('print');
  if(b)b.addEventListener('click',function(){
    els.forEach(function(e){e.classList.add('in')});
    window.print();
  });
})();
