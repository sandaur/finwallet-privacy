(function(){
  /* Idioma de la página: 'es' (el del HTML) o 'en'; quien cambia de idioma avisa por onLang */
  var lang='es',onLang=[];
  function tr(es,en){return lang==='en'?en:es}
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
      if(!lista[i].img)lista[i].img=img;   /* el texto alternativo se lee al mostrar: cambia con el idioma */
      var b=document.createElement('button');
      b.type='button';
      b.className='zoom';
      b.setAttribute('aria-label',tr('Ampliar imagen: ','Enlarge image: ')+(img.getAttribute('alt')||tr('captura de FinWallet','FinWallet screenshot')));
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
      visor.setAttribute('aria-label',tr('Imagen ampliada','Enlarged image'));
      visor.innerHTML=
        '<button type="button" class="v-cerrar" aria-label="'+tr('Cerrar imagen','Close image')+'"><span aria-hidden="true">&times;</span></button>'+
        '<button type="button" class="v-nav v-ant" aria-label="'+tr('Anterior','Previous')+'"><span aria-hidden="true">&#8249;</span></button>'+
        '<figure class="v-fig"><img class="v-img" width="1080" height="2400" alt=""><figcaption class="v-pie"></figcaption></figure>'+
        '<button type="button" class="v-nav v-sig" aria-label="'+tr('Siguiente','Next')+'"><span aria-hidden="true">&#8250;</span></button>';
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
      var alt=c.img.getAttribute('alt')||'';
      foto.alt=alt;
      pie.textContent=alt;
      visor.setAttribute('aria-label',tr('Imagen ampliada ','Enlarged image ')+(indice+1)+tr(' de ',' of ')+n+': '+alt);
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

    /* Al cambiar de idioma se actualizan los rótulos de los botones y de la capa */
    onLang.push(function(){
      [].forEach.call(document.querySelectorAll('.zoom'),function(b){
        var im=b.querySelector('img');
        b.setAttribute('aria-label',tr('Ampliar imagen: ','Enlarge image: ')+(im&&im.getAttribute('alt')||tr('captura de FinWallet','FinWallet screenshot')));
      });
      if(!visor)return;
      cerrar.setAttribute('aria-label',tr('Cerrar imagen','Close image'));
      ant.setAttribute('aria-label',tr('Anterior','Previous'));
      sig.setAttribute('aria-label',tr('Siguiente','Next'));
      if(visor.classList.contains('on'))mostrar(indice);
    });

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

  /* Traducción de la página y formulario de la beta.
     El HTML está en español (es lo que ven los buscadores y quien no tiene JavaScript);
     el inglés sale de este diccionario, que se busca por el texto en español. */
  (function(){
    var EN={
      title:`FinWallet: understand where your money goes, without handing over your data`,
      desc:`FinWallet infographic: log fast, know how you're doing this month and keep all your data on your phone.`,
      text:{
        [`por Sandaur Apps`]:`by Sandaur Apps`,
        [`Inscríbete en la beta`]:`Join the beta`,
        [`Prueba cerrada de 14 días para Android`]:`14-day closed test for Android`,
        [`Entiende a dónde se va tu`]:`Understand where your `,
        [`plata`]:`money`,
        [`, sin entregar tus datos.`]:` goes, without handing over your data.`,
        [`Una app para ordenar tus finanzas personales sin complicarte: registras en segundos, ves cómo vas en el mes y todo se queda en tu teléfono.`]:`An app to keep your personal finances in order without the hassle: you log in seconds, see how you're doing this month, and everything stays on your phone.`,
        [`1 · Registrar es rápido`]:`1 · Logging is quick`,
        [`2 · Te dice cómo vas`]:`2 · It shows how you're doing`,
        [`3 · Todo queda en tu teléfono`]:`3 · Everything stays on your phone`,
        [`¿Te suena?`]:`Sound familiar?`,
        [`Situaciones de todos los meses`]:`Things that happen every month`,
        [`“Llegué a fin de mes y no sé en qué se fue la plata.”`]:`“I got to the end of the month and have no idea where my money went.”`,
        [`Sin un registro, los gastos chicos se pierden de vista.`]:`Without a record, small expenses get lost.`,
        [`“Tengo un montón de boletas del súper en la billetera.”`]:`“My wallet is full of supermarket receipts.”`,
        [`Se acumulan, se borran con el tiempo y nadie las pasa a mano.`]:`They pile up, fade over time, and nobody types them in.`,
        [`“¿Y ese cobro mensual? Ni me acordaba que lo tenía.”`]:`“What's that monthly charge? I forgot I even had it.”`,
        [`Suscripciones y cobros que siguen llegando sin que los mires.`]:`Subscriptions and charges that keep coming without you looking.`,
        [`Cómo funciona`]:`How it works`,
        [`Registra, ordena, entiende`]:`Log, organize, understand`,
        [`Tres pasos, sin planillas ni configuraciones eternas.`]:`Three steps, no spreadsheets, no endless setup.`,
        [`Registra en segundos`]:`Log in seconds`,
        [`Toca el botón`]:`Tap the `,
        [`: el teclado se abre listo para escribir el monto. Si cierras el formulario por error, lo que escribiste se conserva. ¿Tienes una boleta? Fotografíala y la app lee el total, la fecha y el comercio.`]:` button: the keyboard opens ready for the amount. If you close the form by mistake, what you typed is kept. Got a receipt? Photograph it and the app reads the total, the date and the shop.`,
        [`Ordena por categorías y cuentas`]:`Organize by category and account`,
        [`Cada gasto va a su categoría y a la cuenta que usaste: la cuenta corriente, el efectivo, la tarjeta de crédito. Tus presupuestos se actualizan solos.`]:`Each expense goes to its category and to the account you used: checking, cash, credit card. Your budgets update by themselves.`,
        [`Entiende cómo vas`]:`See how you're doing`,
        [`El Resumen te muestra tu saldo, tus ingresos y gastos del mes, cuánto te queda por gastar y un gráfico que compara tu ritmo de gasto con el del mes pasado, con proyección a fin de mes.`]:`The Overview shows your balance, the month's income and expenses, how much you have left to spend, and a chart comparing your spending pace with last month's, with a month-end projection.`,
        [`Funcionalidades`]:`Features`,
        [`Lo que puedes hacer con FinWallet`]:`What you can do with FinWallet`,
        [`Escanear boletas`]:`Scan receipts`,
        [`Fotografía la boleta, la app hace el resto`]:`Photograph the receipt, the app does the rest`,
        [`Lee el total, la fecha y el comercio directamente en tu teléfono, sin internet. También puedes compartir una imagen desde la galería.`]:`It reads the total, the date and the shop right on your phone, without internet. You can also share an image from your gallery.`,
        [`Si no está segura del total, te muestra la foto y tú tocas el monto correcto.`]:`If it isn't sure about the total, it shows you the photo and you tap the right amount.`,
        [`La foto queda adjunta al registro.`]:`The photo stays attached to the record.`,
        [`Los campos leídos se marcan con “Leído de la boleta”.`]:`Fields read from the receipt are marked “Read from the receipt”.`,
        [`Presupuestos con ritmo`]:`Budgets with pace`,
        [`No solo cuánto gastaste: cómo vas`]:`Not just how much you spent: how you're doing`,
        [`Define un presupuesto general y uno por categoría. Una marca en cada barra muestra dónde deberías ir hoy.`]:`Set an overall budget and one per category. A mark on each bar shows where you should be today.`,
        [`Cuánto puedes gastar por día.`]:`How much you can spend per day.`,
        [`Proyección a fin de mes.`]:`Month-end projection.`,
        [`Etiquetas claras: al ritmo, con margen, excedido.`]:`Clear labels: on pace, room to spare, over budget.`,
        [`Cuentas y tarjetas`]:`Accounts and cards`,
        [`Tu plata y tu deuda, por separado`]:`Your money and your debt, kept apart`,
        [`Varias cuentas, tarjetas de crédito con cupo y transferencias entre ellas. Lo que debes en crédito se muestra aparte.`]:`Several accounts, credit cards with a limit and transfers between them. What you owe on credit is shown separately.`,
        [`Botón “Pagar tarjeta”.`]:`“Pay card” button.`,
        [`El pago de la tarjeta no se cuenta como gasto por segunda vez.`]:`The card payment isn't counted as spending a second time.`,
        [`Análisis`]:`Insights`,
        [`Un resumen en lenguaje simple`]:`A summary in plain language`,
        [`En qué categorías se va tu plata y cómo se compara con tu promedio.`]:`Which categories your money goes to and how it compares with your average.`,
        [`Detecta suscripciones y cobros repetidos o inusuales.`]:`Spots subscriptions and repeated or unusual charges.`,
        [`Avisa cambios de precio.`]:`Flags price changes.`,
        [`Mira los últimos 6 meses.`]:`See the last 6 months.`,
        [`Pagos recurrentes`]:`Recurring payments`,
        [`Arriendo, sueldo, suscripciones: automáticos o “pregúntame antes”. Ves la lista de próximos pagos y cuánto tienes comprometido cada mes.`]:`Rent, salary, subscriptions: automatic or “ask me first”. You see the list of upcoming payments and how much you have committed each month.`,
        [`Widget en tu pantalla de inicio`]:`Home-screen widget`,
        [`Registra rápido y mira tu saldo y lo que te queda por gastar, sin abrir la app.`]:`Log quickly and see your balance and what you have left to spend, without opening the app.`,
        [`Tu mes, a tu medida`]:`Your month, your way`,
        [`Elige qué día empieza tu mes, por ejemplo el día de pago. También puedes ver el saldo solo del mes.`]:`Choose which day your month starts, for example payday. You can also see just the month's balance.`,
        [`Ayuda integrada`]:`Built-in help`,
        [`Un recorrido inicial, un glosario y, si mantienes presionada una cifra, te explica qué es.`]:`A first-run tour, a glossary and, if you long-press a figure, it explains what it is.`,
        [`Disponible en español e inglés, con tema claro, oscuro o el de tu teléfono. Las capturas son de la app en tema claro y con datos de ejemplo.`]:`Available in Spanish and English, with a light theme, a dark theme or your phone's. The screenshots show the app in Spanish, in the light theme and with sample data.`,
        [`El valor de usarla`]:`Why use it`,
        [`Qué cambia en tu día a día`]:`What changes in your day to day`,
        [`Tiempo`]:`Time`,
        [`Anotar un gasto toma segundos, y una boleta se pasa con una foto.`]:`Logging an expense takes seconds, and a receipt goes in with a photo.`,
        [`Pagas en la caja, sacas la foto y sigues con tu día.`]:`You pay at the till, take the photo and get on with your day.`,
        [`Claridad`]:`Clarity`,
        [`Ves en qué categorías se va la plata, no solo el total.`]:`You see which categories your money goes to, not just the total.`,
        [`Descubres cuáles son tus gastos más grandes del mes y cómo se comparan con tu promedio.`]:`You find out your biggest expenses of the month and how they compare with your average.`,
        [`Sabes cómo vas antes de que termine el mes.`]:`You know how you're doing before the month ends.`,
        [`Llegas a fin de mes sabiendo cuánto te queda por día, no adivinando.`]:`You reach the end of the month knowing how much you have left per day, not guessing.`,
        [`Tranquilidad`]:`Peace of mind`,
        [`Nada se te pasa: los pagos fijos y las suscripciones quedan a la vista.`]:`Nothing slips by: fixed payments and subscriptions stay in view.`,
        [`Antes de que llegue el cobro, ya lo viste en tus próximos pagos.`]:`Before the charge arrives, you've already seen it in your upcoming payments.`,
        [`Privacidad`]:`Privacy`,
        [`Tus datos se quedan en tu teléfono`]:`Your data stays on your phone`,
        [`No te pedimos la clave del banco ni armamos una cuenta en la nube.`]:`We don't ask for your bank password or set up a cloud account.`,
        [`Sin permiso de internet`]:`No internet permission`,
        [`La app no tiene permiso de internet: no puede enviar tus datos a ningún lado.`]:`The app has no internet permission: it cannot send your data anywhere.`,
        [`Todo guardado en el teléfono`]:`Everything stored on the phone`,
        [`Tus registros, cuentas y presupuestos viven en tu dispositivo. Si tienes activada la copia de seguridad de Android, el sistema puede respaldarlos en tu propia cuenta de Google; FinWallet no tiene acceso a esa copia.`]:`Your records, accounts and budgets live on your device. If Android backup is turned on, the system may back them up to your own Google account; FinWallet has no access to that copy.`,
        [`Boletas leídas en el teléfono`]:`Receipts read on the phone`,
        [`La lectura de boletas ocurre en el dispositivo, sin internet.`]:`Receipts are read on the device, without internet.`,
        [`Cargando…`]:`Loading…`
      },
      alt:{
        [`Ícono de FinWallet: una boleta con una insignia de verificación sobre fondo morado`]:`FinWallet icon: a receipt with a verification badge on a purple background`,
        [`Pantalla Presupuestos de FinWallet con barras por categoría y etiquetas como Al ritmo y Con margen`]:`FinWallet Budgets screen with bars per category and labels such as On pace and Room to spare`,
        [`Pantalla Resumen de FinWallet: saldo, ingresos y gastos del mes, y gráfico del ritmo de gasto`]:`FinWallet Overview screen: balance, the month's income and expenses, and the spending pace chart`,
        [`Pantalla Análisis de FinWallet con un resumen en lenguaje simple y las categorías más grandes`]:`FinWallet Insights screen with a plain-language summary and the biggest categories`,
        [`Formulario de registro con el monto, la fecha y la descripción leídos de una boleta y marcados como Leído de la boleta`]:`Record form with the amount, date and description read from a receipt and marked as Read from the receipt`,
        [`Presupuestos por categoría con barras y una marca que indica dónde deberías ir hoy`]:`Budgets by category with bars and a mark showing where you should be today`,
        [`Resumen con saldo actual, ingresos y gastos del mes, cuánto queda disponible para gastar y el gráfico de ritmo`]:`Overview with current balance, the month's income and expenses, how much is left to spend and the pace chart`,
        [`Formulario con los datos de una boleta leídos por la app`]:`Form with the receipt data read by the app`,
        [`Presupuesto mensual total con la proyección de cierre y la marca de lo esperado hoy`]:`Total monthly budget with the month-end projection and the mark for what is expected today`,
        [`Pantalla Cuentas con varias cuentas, una tarjeta de crédito con su cupo y el botón Pagar tarjeta`]:`Accounts screen with several accounts, a credit card with its limit and the Pay card button`,
        [`Pantalla Análisis con el gasto del mes comparado con el mes anterior y las tres categorías mayores`]:`Insights screen with this month's spending compared with last month and the three biggest categories`
      }
    };

    var base='https://docs.google.com/forms/d/e/';
    var forms={
      es:{id:'1FAIpQLSe-8Pz-qVW5PoCmFfUaBqH-xhTHlCdVLZGRiILD4VmTOSrOlQ',short:'https://forms.gle/RLWCXSUk7usi4oyD7',
        eyebrow:'Beta cerrada',title:'Ordena tu plata a tu ritmo',
        lead:'Estamos probando FinWallet con un grupo pequeño durante 14 días. Si tienes un teléfono Android, inscríbete y te escribimos con el enlace para unirte.',
        open:'Abrir el formulario en una pestaña nueva',frameTitle:'Formulario de inscripción a la beta de FinWallet'},
      en:{id:'1FAIpQLSf7I_Pg46lgwJYVelKPTx0E0neQKedCh6JrmpL6lmrBTOqQ3Q',short:'https://forms.gle/Dy8DLkjbpzyfeKKm8',
        eyebrow:'Closed beta',title:'Get your money in order, at your own pace',
        lead:'We are testing FinWallet with a small group for 14 days. If you have an Android phone, sign up and we will write to you with the link to join.',
        open:'Open the form in a new tab',frameTitle:'FinWallet beta signup form'}
    };

    /* Textos y atributos en español, tal como están en el HTML, para poder volver a ellos */
    var skip='#beta-eyebrow,#beta-title,#beta-lead,#beta-open';
    var nodes=[],alts=[];
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    for(var n=walker.nextNode();n;n=walker.nextNode()){
      var p=n.parentNode;
      if(!n.nodeValue.trim()||/^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.nodeName)||(p.closest&&p.closest(skip)))continue;
      nodes.push({n:n,es:n.nodeValue,key:n.nodeValue.trim()});
    }
    [].forEach.call(document.querySelectorAll('img[alt]'),function(im){alts.push({im:im,es:im.getAttribute('alt')})});
    var desc=document.querySelector('meta[name="description"]');
    var esTitle=document.title,esDesc=desc&&desc.getAttribute('content');

    var frame=document.getElementById('beta-form');
    var buttons=[].slice.call(document.querySelectorAll('.lang button'));

    function setLang(l){
      lang=l;
      document.documentElement.lang=l==='en'?'en':'es-CL';
      nodes.forEach(function(x){
        var v=l==='en'?EN.text[x.key]:null;
        x.n.nodeValue=v==null?x.es:v;
      });
      alts.forEach(function(x){
        var v=l==='en'?EN.alt[x.es]:null;
        x.im.setAttribute('alt',v==null?x.es:v);
      });
      document.title=l==='en'?EN.title:esTitle;
      if(desc)desc.setAttribute('content',l==='en'?EN.desc:esDesc);

      var f=forms[l];
      if(frame){
        frame.src=base+f.id+'/viewform?embedded=true';
        frame.title=f.frameTitle;
        document.getElementById('beta-eyebrow').textContent=f.eyebrow;
        document.getElementById('beta-title').textContent=f.title;
        document.getElementById('beta-lead').textContent=f.lead;
        var a=document.getElementById('beta-open');
        a.href=f.short;a.textContent=f.open;
      }
      buttons.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-lang')===l?'true':'false')});
      onLang.forEach(function(fn){fn()});
    }

    buttons.forEach(function(b){b.addEventListener('click',function(){setLang(b.getAttribute('data-lang'))})});

    /* El idioma sale del navegador; ?lang=en o ?lang=es lo fuerza */
    var forced=(location.search.match(/[?&]lang=(es|en)\b/)||[])[1];
    var nav=((navigator.languages&&navigator.languages[0])||navigator.language||'es').toLowerCase();
    setLang(forced||(nav.indexOf('es')===0?'es':'en'));
  })();
})();
