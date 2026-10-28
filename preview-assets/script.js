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

  /* Visor de capturas: mejora progresiva. Sin JS las imágenes se ven igual. */
  (function(){
    var imgs=[].slice.call(document.querySelectorAll('.phone .screen img'));
    if(!imgs.length)return;
    var lista=[];            /* capturas únicas, en orden de aparición */
    var visor=null,foto,pie,cerrar,ant,sig,abridor=null,indice=0,overflowPrevio='';

    function indiceDe(src){
      for(var i=0;i<lista.length;i++)if(lista[i].src===src)return i;
      lista.push({src:src,alt:''});return lista.length-1;
    }

    /* Envuelve cada captura en un botón accesible */
    imgs.forEach(function(img){
      var src=img.getAttribute('src');
      var i=indiceDe(src);
      if(!lista[i].alt)lista[i].alt=img.getAttribute('alt')||'';
      var b=document.createElement('button');
      b.type='button';
      b.className='zoom';
      b.setAttribute('aria-label','Ampliar imagen: '+(img.getAttribute('alt')||'captura de FinWallet'));
      b.setAttribute('data-i',i);
      img.parentNode.insertBefore(b,img);
      b.appendChild(img);
      b.addEventListener('click',function(){abrir(i,b)});
    });

    /* La capa se crea una sola vez */
    function crear(){
      visor=document.createElement('div');
      visor.className='visor';
      visor.setAttribute('role','dialog');
      visor.setAttribute('aria-modal','true');
      visor.setAttribute('aria-label','Imagen ampliada');
      visor.innerHTML=
        '<button type="button" class="v-cerrar" aria-label="Cerrar imagen"><span aria-hidden="true">&times;</span></button>'+
        '<button type="button" class="v-nav v-ant" aria-label="Anterior"><span aria-hidden="true">&#8249;</span></button>'+
        '<figure class="v-fig"><img class="v-img" width="1080" height="2400" alt=""><figcaption class="v-pie"></figcaption></figure>'+
        '<button type="button" class="v-nav v-sig" aria-label="Siguiente"><span aria-hidden="true">&#8250;</span></button>';
      document.body.appendChild(visor);
      foto=visor.querySelector('.v-img');
      pie=visor.querySelector('.v-pie');
      cerrar=visor.querySelector('.v-cerrar');
      ant=visor.querySelector('.v-ant');
      sig=visor.querySelector('.v-sig');
      if(lista.length<2){ant.style.display='none';sig.style.display='none'}
      /* Clic en el fondo, en la imagen o en el pie cierra; los botones hacen lo suyo */
      visor.addEventListener('click',function(e){
        if(e.target.closest&&e.target.closest('button'))return;
        cerrarVisor();
      });
      cerrar.addEventListener('click',cerrarVisor);
      ant.addEventListener('click',function(){mostrar(indice-1)});
      sig.addEventListener('click',function(){mostrar(indice+1)});
    }

    function mostrar(i){
      var n=lista.length;
      indice=((i%n)+n)%n;
      var c=lista[indice];
      foto.src=c.src;          /* la imagen grande se carga solo al abrir */
      foto.alt=c.alt;
      pie.textContent=c.alt;
      visor.setAttribute('aria-label','Imagen ampliada '+(indice+1)+' de '+n+': '+c.alt);
    }

    function abrir(i,origen){
      if(!visor)crear();
      abridor=origen;
      mostrar(i);
      overflowPrevio=document.body.style.overflow;
      document.body.style.overflow='hidden';
      visor.classList.add('on');
      cerrar.focus();
    }

    function cerrarVisor(){
      if(!visor||!visor.classList.contains('on'))return;
      visor.classList.remove('on');
      document.body.style.overflow=overflowPrevio;
      if(abridor)abridor.focus();
      abridor=null;
    }

    document.addEventListener('keydown',function(e){
      if(!visor||!visor.classList.contains('on'))return;
      if(e.key==='Escape'||e.key==='Esc'){e.preventDefault();cerrarVisor();}
      else if(e.key==='ArrowLeft'&&lista.length>1){e.preventDefault();mostrar(indice-1);}
      else if(e.key==='ArrowRight'&&lista.length>1){e.preventDefault();mostrar(indice+1);}
      else if(e.key==='Tab'){
        /* Atrapa el foco dentro de la capa */
        var f=[cerrar,ant,sig].filter(function(b){return b.style.display!=='none'});
        var primero=f[0],ultimo=f[f.length-1];
        if(f.indexOf(document.activeElement)<0){e.preventDefault();primero.focus();}
        else if(e.shiftKey&&document.activeElement===primero){e.preventDefault();ultimo.focus();}
        else if(!e.shiftKey&&document.activeElement===ultimo){e.preventDefault();primero.focus();}
      }
    });
  })();
})();
